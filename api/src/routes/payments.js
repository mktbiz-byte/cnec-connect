import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { createEscrowIntent, captureEscrow, currentProvider } from '../lib/payments.js'

const router = Router()

const intentSchema = z.object({
  applicationId: z.string().uuid(),
  amount: z.number().int().positive(),
})

// 기업이 확정된 지원건에 대해 에스크로 결제 생성
router.post('/intent', requireAuth, requireRole('business'), async (req, res, next) => {
  try {
    const body = intentSchema.parse(req.body)
    const row = await query(
      `SELECT a.*, c.business_id, c.title FROM campaign_applications a
       JOIN campaigns c ON c.id = a.campaign_id WHERE a.id = $1`,
      [body.applicationId],
    )
    if (row.rowCount === 0) return res.status(404).json({ error: 'APPLICATION_NOT_FOUND' })
    const app = row.rows[0]
    if (app.business_id !== req.user.id) return res.status(403).json({ error: 'FORBIDDEN' })
    if (app.status !== 'accepted') return res.status(409).json({ error: 'NOT_ACCEPTED' })

    const intent = await createEscrowIntent({
      amount: body.amount,
      metadata: { application_id: app.id, campaign_id: app.campaign_id },
    })

    const { rows } = await query(
      `INSERT INTO payments(campaign_id, application_id, amount, status, provider, provider_txn_id, escrow_held_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        app.campaign_id,
        app.id,
        body.amount,
        intent.provider === 'mock' ? 'paid' : 'pending',
        intent.provider,
        intent.id,
        intent.provider === 'mock' ? new Date() : null,
      ],
    )

    res.status(201).json({ data: rows[0], clientSecret: intent.clientSecret })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

// 기업이 작업 완료 확인 → 에스크로 릴리즈 (Stripe: capture / mock: status 전이)
router.post('/:id/release', requireAuth, requireRole('business'), async (req, res, next) => {
  try {
    await withTx(async (client) => {
      const { rows } = await client.query(
        `SELECT p.*, c.business_id FROM payments p
         JOIN campaigns c ON c.id = p.campaign_id
         WHERE p.id = $1 FOR UPDATE`,
        [req.params.id],
      )
      if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      const payment = rows[0]
      if (payment.business_id !== req.user.id) return res.status(403).json({ error: 'FORBIDDEN' })
      if (payment.status === 'released') return res.json({ ok: true, alreadyReleased: true })

      if (payment.provider === 'stripe') {
        try { await captureEscrow(payment.provider_txn_id) }
        catch (e) { /* stripe error, we keep pending */ return res.status(502).json({ error: 'CAPTURE_FAILED', detail: e.message }) }
      }
      await client.query(
        `UPDATE payments SET status = 'released', released_at = now(), updated_at = now() WHERE id = $1`,
        [req.params.id],
      )
      const app = await client.query(`SELECT creator_id FROM campaign_applications WHERE id = $1`, [payment.application_id])
      if (app.rowCount) {
        await client.query(
          `INSERT INTO notifications(user_id, type, title, body, link)
           VALUES ($1, 'payment_released', '정산이 완료되었습니다', $2, '/app/creator/earnings')`,
          [app.rows[0].creator_id, `₩${Number(payment.amount).toLocaleString()} 정산 완료`],
        )
      }
      res.json({ ok: true })
    })
  } catch (err) {
    next(err)
  }
})

// 기업 — 내 결제 내역
router.get('/mine', requireAuth, requireRole('business'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.title AS campaign_title, cp.display_name AS creator_name, cp.handle AS creator_handle
       FROM payments p
       JOIN campaigns c ON c.id = p.campaign_id
       LEFT JOIN campaign_applications a ON a.id = p.application_id
       LEFT JOIN creator_profiles cp ON cp.user_id = a.creator_id
       WHERE c.business_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id],
    )
    res.json({ data: rows, provider: currentProvider() })
  } catch (err) {
    next(err)
  }
})

// 크리에이터 — 내 정산 내역
router.get('/earnings', requireAuth, requireRole('creator'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.title AS campaign_title, bp.company_name
       FROM payments p
       JOIN campaigns c ON c.id = p.campaign_id
       JOIN campaign_applications a ON a.id = p.application_id
       LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       WHERE a.creator_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id],
    )
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
})

export default router
