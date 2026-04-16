import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

const applySchema = z.object({
  campaignId: z.string().uuid(),
  message: z.string().max(2000).optional(),
  proposedBudget: z.number().int().nonnegative().optional(),
  portfolioUrls: z.array(z.string().url()).optional(),
})

router.post('/', requireAuth, requireRole('creator'), async (req, res, next) => {
  try {
    const body = applySchema.parse(req.body)
    const campaign = await query(`SELECT status FROM campaigns WHERE id = $1`, [body.campaignId])
    if (campaign.rowCount === 0) return res.status(404).json({ error: 'CAMPAIGN_NOT_FOUND' })
    if (campaign.rows[0].status !== 'recruiting') return res.status(409).json({ error: 'CAMPAIGN_NOT_OPEN' })

    try {
      const { rows } = await query(
        `INSERT INTO campaign_applications(campaign_id, creator_id, message, proposed_budget, portfolio_urls)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [body.campaignId, req.user.id, body.message || null, body.proposedBudget || null, body.portfolioUrls || []],
      )
      res.status(201).json({ data: rows[0] })
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'ALREADY_APPLIED' })
      throw e
    }
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

router.get('/mine', requireAuth, requireRole('creator'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT a.*, c.title AS campaign_title, c.category, c.cover_url, bp.company_name
       FROM campaign_applications a
       JOIN campaigns c ON c.id = a.campaign_id
       LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       WHERE a.creator_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id],
    )
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
})

const decideSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
})

router.patch('/:id/decision', requireAuth, requireRole('business'), async (req, res, next) => {
  try {
    const body = decideSchema.parse(req.body)
    await withTx(async (client) => {
      const { rows } = await client.query(
        `SELECT a.*, c.business_id
         FROM campaign_applications a
         JOIN campaigns c ON c.id = a.campaign_id
         WHERE a.id = $1 FOR UPDATE`,
        [req.params.id],
      )
      if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      if (rows[0].business_id !== req.user.id) return res.status(403).json({ error: 'FORBIDDEN' })

      await client.query(
        `UPDATE campaign_applications SET status = $1, decided_at = now() WHERE id = $2`,
        [body.status, req.params.id],
      )

      if (body.status === 'accepted') {
        await client.query(
          `INSERT INTO message_threads(campaign_id, business_id, creator_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (campaign_id, business_id, creator_id) DO NOTHING`,
          [rows[0].campaign_id, req.user.id, rows[0].creator_id],
        )
      }

      await client.query(
        `INSERT INTO notifications(user_id, type, title, body, link)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          rows[0].creator_id,
          'application_decision',
          body.status === 'accepted' ? '캠페인 지원이 승인되었습니다' : '캠페인 지원 결과를 확인해주세요',
          null,
          `/app/creator/applications`,
        ],
      )

      res.json({ ok: true })
    })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

export default router
