import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, type, title, body, link, read_at, created_at
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.user.id],
    )
    const unread = await query(
      `SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [req.user.id],
    )
    res.json({ data: rows, unread: unread.rows[0].n })
  } catch (err) { next(err) }
})

router.post('/read-all', requireAuth, async (req, res, next) => {
  try {
    await query(`UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL`, [req.user.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.post('/:id/read', requireAuth, async (req, res, next) => {
  try {
    await query(`UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
