import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { z } from 'zod'

const router = Router()

// 공개 크리에이터 목록
router.get('/', async (req, res, next) => {
  try {
    const { q, category, region, platform, minFollowers, sort = 'followers' } = req.query
    const params = []
    const where = []
    if (q) {
      params.push(`%${q}%`)
      where.push(`(cp.display_name ILIKE $${params.length} OR cp.handle ILIKE $${params.length})`)
    }
    if (category) {
      params.push(category)
      where.push(`$${params.length} = ANY(cp.categories)`)
    }
    if (region) {
      params.push(region)
      where.push(`cp.region = $${params.length}`)
    }
    if (platform) {
      params.push(platform)
      where.push(`cp.platforms @> jsonb_build_array(jsonb_build_object('name', $${params.length}::text))`)
    }
    if (minFollowers) {
      params.push(Number(minFollowers))
      where.push(`cp.followers_total >= $${params.length}`)
    }
    const orderBy =
      sort === 'engagement' ? 'cp.engagement_rate DESC'
      : sort === 'recent' ? 'cp.created_at DESC'
      : 'cp.followers_total DESC'

    const sql = `
      SELECT cp.user_id, cp.handle, cp.display_name, cp.bio, cp.avatar_url, cp.region,
             cp.categories, cp.platforms, cp.followers_total, cp.engagement_rate, cp.avg_views, cp.verified
      FROM creator_profiles cp
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY ${orderBy}
      LIMIT 60
    `
    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
})

router.get('/:handle', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT cp.*, u.email FROM creator_profiles cp JOIN users u ON u.id = cp.user_id WHERE cp.handle = $1`,
      [req.params.handle],
    )
    if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    const row = rows[0]
    delete row.email
    res.json({ data: row })
  } catch (err) {
    next(err)
  }
})

// 내 프로필 편집
const updateSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(500).optional(),
  region: z.string().optional(),
  categories: z.array(z.string()).optional(),
  platforms: z.array(z.object({
    name: z.string(),
    handle: z.string(),
    followers: z.number().int().nonnegative().optional(),
  })).optional(),
  avatarUrl: z.string().url().optional(),
  languages: z.array(z.string()).optional(),
})

router.patch('/me', requireAuth, requireRole('creator'), async (req, res, next) => {
  try {
    const body = updateSchema.parse(req.body)
    const fields = []
    const values = []
    function push(col, val) {
      values.push(val)
      fields.push(`${col} = $${values.length}`)
    }
    if (body.displayName !== undefined) push('display_name', body.displayName)
    if (body.bio !== undefined) push('bio', body.bio)
    if (body.region !== undefined) push('region', body.region)
    if (body.categories !== undefined) push('categories', body.categories)
    if (body.platforms !== undefined) {
      values.push(JSON.stringify(body.platforms))
      fields.push(`platforms = $${values.length}::jsonb`)
      const total = body.platforms.reduce((s, p) => s + (p.followers || 0), 0)
      values.push(total)
      fields.push(`followers_total = $${values.length}`)
    }
    if (body.avatarUrl !== undefined) push('avatar_url', body.avatarUrl)
    if (body.languages !== undefined) push('languages', body.languages)

    if (fields.length === 0) return res.json({ ok: true })

    values.push(req.user.id)
    const sql = `UPDATE creator_profiles SET ${fields.join(', ')}, updated_at = now() WHERE user_id = $${values.length} RETURNING *`
    const { rows } = await query(sql, values)
    res.json({ data: rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

export default router
