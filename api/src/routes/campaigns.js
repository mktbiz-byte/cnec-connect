import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js'

const router = Router()

// 공개/로그인 겸용 목록
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category, platform, status = 'recruiting', mine } = req.query
    const params = []
    const where = []

    if (mine === 'true' && req.user?.role === 'business') {
      params.push(req.user.id)
      where.push(`c.business_id = $${params.length}`)
    } else {
      params.push(status)
      where.push(`c.status = $${params.length}`)
    }
    if (category) {
      params.push(category)
      where.push(`c.category = $${params.length}`)
    }
    if (platform) {
      params.push(platform)
      where.push(`$${params.length} = ANY(c.platforms)`)
    }

    const sql = `
      SELECT c.*, bp.company_name, bp.logo_url
      FROM campaigns c
      LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
      WHERE ${where.join(' AND ')}
      ORDER BY c.created_at DESC
      LIMIT 60
    `
    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.*, bp.company_name, bp.logo_url, bp.website
       FROM campaigns c
       LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       WHERE c.id = $1`,
      [req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    res.json({ data: rows[0] })
  } catch (err) {
    next(err)
  }
})

const createSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1),
  category: z.string().min(1),
  budgetMin: z.number().int().nonnegative(),
  budgetMax: z.number().int().nonnegative(),
  deliverables: z.array(z.any()).default([]),
  requirements: z.string().optional(),
  platforms: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  applyDeadline: z.string().optional(),
  recruitCount: z.number().int().positive().default(1),
  status: z.enum(['draft', 'recruiting']).default('recruiting'),
  brandName: z.string().optional(),
  coverUrl: z.string().optional(),
})

router.post('/', requireAuth, requireRole('business'), async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body)
    const { rows } = await query(
      `INSERT INTO campaigns(business_id, title, description, category, budget_min, budget_max,
        deliverables, requirements, platforms, regions, start_date, end_date, apply_deadline, recruit_count, status, brand_name, cover_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        req.user.id,
        body.title,
        body.description,
        body.category,
        body.budgetMin,
        body.budgetMax,
        JSON.stringify(body.deliverables),
        body.requirements || null,
        body.platforms,
        body.regions,
        body.startDate || null,
        body.endDate || null,
        body.applyDeadline || null,
        body.recruitCount,
        body.status,
        body.brandName || null,
        body.coverUrl || null,
      ],
    )
    res.status(201).json({ data: rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

router.get('/:id/applications', requireAuth, async (req, res, next) => {
  try {
    const { rows: campaignRows } = await query('SELECT business_id FROM campaigns WHERE id = $1', [req.params.id])
    if (campaignRows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    if (req.user.role !== 'admin' && campaignRows[0].business_id !== req.user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' })
    }
    const { rows } = await query(
      `SELECT a.*, cp.handle, cp.display_name, cp.avatar_url, cp.followers_total, cp.engagement_rate
       FROM campaign_applications a
       LEFT JOIN creator_profiles cp ON cp.user_id = a.creator_id
       WHERE a.campaign_id = $1
       ORDER BY a.applied_at DESC`,
      [req.params.id],
    )
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
})

export default router
