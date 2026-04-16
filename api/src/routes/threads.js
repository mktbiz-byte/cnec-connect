import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function whereForRole(userId, role) {
  if (role === 'business') return { sql: 't.business_id = $1', params: [userId] }
  return { sql: 't.creator_id = $1', params: [userId] }
}

// 내 스레드 목록
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { sql, params } = whereForRole(req.user.id, req.user.role)
    const { rows } = await query(
      `SELECT t.id, t.campaign_id, t.business_id, t.creator_id, t.last_message_at, t.created_at,
              c.title AS campaign_title,
              bp.company_name, bp.logo_url,
              cp.display_name AS creator_name, cp.handle AS creator_handle, cp.avatar_url AS creator_avatar,
              (SELECT m.body FROM messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS last_body,
              (SELECT COUNT(*) FROM messages m
                WHERE m.thread_id = t.id AND m.sender_id <> $1 AND m.read_at IS NULL) AS unread
       FROM message_threads t
       LEFT JOIN campaigns c ON c.id = t.campaign_id
       LEFT JOIN business_profiles bp ON bp.user_id = t.business_id
       LEFT JOIN creator_profiles cp ON cp.user_id = t.creator_id
       WHERE ${sql}
       ORDER BY t.last_message_at DESC`,
      params,
    )
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
})

// 스레드 상세 + 메시지
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT * FROM message_threads WHERE id = $1`, [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    const t = rows[0]
    if (t.business_id !== req.user.id && t.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' })
    }
    const msgs = await query(
      `SELECT id, sender_id, body, attachments, read_at, created_at
       FROM messages WHERE thread_id = $1 ORDER BY created_at ASC`,
      [req.params.id],
    )

    // mark opponent messages read
    await query(
      `UPDATE messages SET read_at = now()
       WHERE thread_id = $1 AND sender_id <> $2 AND read_at IS NULL`,
      [req.params.id, req.user.id],
    )

    res.json({ data: { thread: t, messages: msgs.rows } })
  } catch (err) {
    next(err)
  }
})

const msgSchema = z.object({
  body: z.string().min(1).max(4000),
  attachments: z.array(z.any()).optional(),
})

router.post('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const body = msgSchema.parse(req.body)
    const thread = await query(`SELECT * FROM message_threads WHERE id = $1`, [req.params.id])
    if (thread.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    const t = thread.rows[0]
    if (t.business_id !== req.user.id && t.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' })
    }

    await withTx(async (client) => {
      const ins = await client.query(
        `INSERT INTO messages(thread_id, sender_id, body, attachments)
         VALUES ($1, $2, $3, $4::jsonb)
         RETURNING id, sender_id, body, attachments, read_at, created_at`,
        [req.params.id, req.user.id, body.body, JSON.stringify(body.attachments || [])],
      )
      await client.query(
        `UPDATE message_threads SET last_message_at = now() WHERE id = $1`,
        [req.params.id],
      )
      const recipient = t.business_id === req.user.id ? t.creator_id : t.business_id
      await client.query(
        `INSERT INTO notifications(user_id, type, title, body, link)
         VALUES ($1, 'message', '새 메시지가 도착했습니다', $2, $3)`,
        [recipient, body.body.slice(0, 100), req.user.role === 'business' ? '/app/creator/messages' : '/app/business/messages'],
      )
      res.status(201).json({ data: ins.rows[0] })
    })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

export default router
