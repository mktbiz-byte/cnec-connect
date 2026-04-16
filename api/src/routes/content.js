import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

const submitSchema = z.object({
  campaignId: z.string().uuid(),
  platform: z.string().min(1),
  postUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  views: z.number().int().nonnegative().optional(),
  likes: z.number().int().nonnegative().optional(),
  comments: z.number().int().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
})

// 크리에이터 — 게시물 제출
router.post('/', requireAuth, requireRole('creator'), async (req, res, next) => {
  try {
    const body = submitSchema.parse(req.body)

    // 지원이 accepted 상태여야 한다
    const app = await query(
      `SELECT 1 FROM campaign_applications WHERE campaign_id = $1 AND creator_id = $2 AND status = 'accepted'`,
      [body.campaignId, req.user.id],
    )
    if (app.rowCount === 0) return res.status(403).json({ error: 'NOT_ACCEPTED' })

    const { rows } = await query(
      `INSERT INTO content_posts(campaign_id, creator_id, platform, post_url, thumbnail_url, views, likes, comments, shares, tracked_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       RETURNING *`,
      [
        body.campaignId,
        req.user.id,
        body.platform,
        body.postUrl,
        body.thumbnailUrl || null,
        body.views || 0,
        body.likes || 0,
        body.comments || 0,
        body.shares || 0,
      ],
    )
    res.status(201).json({ data: rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

// 크리에이터 — 내 게시물
router.get('/mine', requireAuth, requireRole('creator'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT cp.*, c.title AS campaign_title
       FROM content_posts cp JOIN campaigns c ON c.id = cp.campaign_id
       WHERE cp.creator_id = $1 ORDER BY cp.created_at DESC`,
      [req.user.id],
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// 기업 — 내 캠페인의 콘텐츠
router.get('/', requireAuth, requireRole('business'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT cp.*, c.title AS campaign_title, cr.display_name AS creator_name, cr.handle AS creator_handle
       FROM content_posts cp
       JOIN campaigns c ON c.id = cp.campaign_id
       LEFT JOIN creator_profiles cr ON cr.user_id = cp.creator_id
       WHERE c.business_id = $1 ORDER BY cp.created_at DESC`,
      [req.user.id],
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// 기업 — 게시물 승인
router.patch('/:id/approve', requireAuth, requireRole('business'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE content_posts cp SET approved = true
       FROM campaigns c
       WHERE cp.campaign_id = c.id AND cp.id = $1 AND c.business_id = $2
       RETURNING cp.id`,
      [req.params.id, req.user.id],
    )
    if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// 기업 — 분석 요약
router.get('/analytics/summary', requireAuth, requireRole('business'), async (req, res, next) => {
  try {
    const totals = await query(
      `SELECT COUNT(*)::int AS posts,
              COALESCE(SUM(cp.views), 0)::bigint AS views,
              COALESCE(SUM(cp.likes), 0)::bigint AS likes,
              COALESCE(SUM(cp.comments), 0)::bigint AS comments,
              COALESCE(SUM(cp.shares), 0)::bigint AS shares
       FROM content_posts cp
       JOIN campaigns c ON c.id = cp.campaign_id
       WHERE c.business_id = $1`,
      [req.user.id],
    )
    const byCampaign = await query(
      `SELECT c.id, c.title,
              COUNT(cp.id)::int AS posts,
              COALESCE(SUM(cp.views), 0)::bigint AS views,
              COALESCE(SUM(cp.likes), 0)::bigint AS likes
       FROM campaigns c
       LEFT JOIN content_posts cp ON cp.campaign_id = c.id
       WHERE c.business_id = $1
       GROUP BY c.id, c.title
       ORDER BY views DESC
       LIMIT 10`,
      [req.user.id],
    )
    const byDay = await query(
      `SELECT date_trunc('day', cp.created_at)::date AS day,
              COALESCE(SUM(cp.views), 0)::bigint AS views
       FROM content_posts cp
       JOIN campaigns c ON c.id = cp.campaign_id
       WHERE c.business_id = $1 AND cp.created_at > now() - interval '30 days'
       GROUP BY 1 ORDER BY 1`,
      [req.user.id],
    )
    res.json({ totals: totals.rows[0], byCampaign: byCampaign.rows, byDay: byDay.rows })
  } catch (err) { next(err) }
})

export default router
