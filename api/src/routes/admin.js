import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

// 대시보드 요약
router.get('/summary', async (_req, res, next) => {
  try {
    const [u, c, a, p, cp] = await Promise.all([
      query(`SELECT role, COUNT(*)::int AS n FROM users GROUP BY role`),
      query(`SELECT status, COUNT(*)::int AS n FROM campaigns GROUP BY status`),
      query(`SELECT status, COUNT(*)::int AS n FROM campaign_applications GROUP BY status`),
      query(`SELECT status, COALESCE(SUM(amount), 0)::bigint AS total, COUNT(*)::int AS n
             FROM payments GROUP BY status`),
      query(`SELECT COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE matched_user_id IS NOT NULL)::int AS matched
             FROM imported_creators`),
    ])
    res.json({
      users: u.rows,
      campaigns: c.rows,
      applications: a.rows,
      payments: p.rows,
      imported: cp.rows[0] || { total: 0, matched: 0 },
    })
  } catch (err) { next(err) }
})

// 사용자 목록 (role, 검증 상태 등)
router.get('/users', async (req, res, next) => {
  try {
    const { role, q } = req.query
    const params = []
    const where = []
    if (role) { params.push(role); where.push(`u.role = $${params.length}`) }
    if (q) { params.push(`%${q}%`); where.push(`(u.email ILIKE $${params.length} OR cp.display_name ILIKE $${params.length} OR bp.company_name ILIKE $${params.length})`) }
    const { rows } = await query(
      `SELECT u.id, u.email, u.role, u.email_verified, u.created_at,
              cp.handle, cp.display_name, cp.verified AS creator_verified, cp.followers_total,
              bp.company_name, bp.verified AS business_verified
       FROM users u
       LEFT JOIN creator_profiles cp ON cp.user_id = u.id
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY u.created_at DESC
       LIMIT 200`,
      params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// 인증 토글
router.post('/users/:id/verify', async (req, res, next) => {
  try {
    const user = await query(`SELECT role FROM users WHERE id = $1`, [req.params.id])
    if (user.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    const role = user.rows[0].role
    if (role === 'creator') await query(`UPDATE creator_profiles SET verified = NOT verified WHERE user_id = $1`, [req.params.id])
    else if (role === 'business') await query(`UPDATE business_profiles SET verified = NOT verified WHERE user_id = $1`, [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// 캠페인 목록
router.get('/campaigns', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.*, bp.company_name,
              (SELECT COUNT(*) FROM campaign_applications a WHERE a.campaign_id = c.id)::int AS app_count
       FROM campaigns c LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       ORDER BY c.created_at DESC LIMIT 200`,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// 결제 전체 목록
router.get('/payments', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.title AS campaign_title, bp.company_name, cp.display_name AS creator_name
       FROM payments p
       JOIN campaigns c ON c.id = p.campaign_id
       LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       LEFT JOIN campaign_applications a ON a.id = p.application_id
       LEFT JOIN creator_profiles cp ON cp.user_id = a.creator_id
       ORDER BY p.created_at DESC LIMIT 200`,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// ─── 크리에이터 임포트 (인스타 ↔ 폰/이메일 매칭) ─────────────────────────

function normalizeHandle(h) {
  if (!h) return null
  let s = String(h).trim().toLowerCase()
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
  s = s.replace(/^@/, '').replace(/\/.*$/, '')
  return s || null
}

const rowSchema = z.object({
  instagram: z.string().optional(),
  instagram_handle: z.string().optional(),
  instagram_url: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  followers: z.union([z.number(), z.string()]).optional(),
  source_id: z.string().optional(),
})

const importSchema = z.object({
  source: z.string().min(1),
  rows: z.array(rowSchema).max(10000),
})

router.post('/imports', async (req, res, next) => {
  try {
    const body = importSchema.parse(req.body)
    let inserted = 0
    for (const r of body.rows) {
      const handle = normalizeHandle(r.instagram_handle || r.instagram || r.instagram_url)
      const email = r.email ? String(r.email).trim().toLowerCase() : null
      const phone = r.phone ? String(r.phone).trim() : null
      const followers = r.followers ? Number(r.followers) : null
      await query(
        `INSERT INTO imported_creators(source, source_id, instagram_handle, instagram_url, email, phone, name, followers, raw)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
         ON CONFLICT (source, source_id) WHERE source_id IS NOT NULL
         DO UPDATE SET instagram_handle = EXCLUDED.instagram_handle,
                       email = EXCLUDED.email,
                       phone = EXCLUDED.phone,
                       name = EXCLUDED.name,
                       followers = EXCLUDED.followers,
                       raw = EXCLUDED.raw`,
        [body.source, r.source_id || null, handle, r.instagram_url || null, email, phone, r.name || null, followers, JSON.stringify(r)],
      )
      inserted++
    }
    res.json({ ok: true, inserted })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

// 현재 가입된 크리에이터와 자동 매칭 (instagram handle 기준)
router.post('/imports/match', async (_req, res, next) => {
  try {
    const result = await withTx(async (client) => {
      // creator_profiles.platforms 는 jsonb array. 각 요소 .name = 'instagram' 의 handle을 뽑아 매칭.
      const { rows: creators } = await client.query(
        `SELECT user_id, handle, platforms FROM creator_profiles`,
      )
      let matched = 0
      for (const c of creators) {
        const handles = new Set()
        handles.add(c.handle?.toLowerCase())
        for (const p of Array.isArray(c.platforms) ? c.platforms : []) {
          if (p && String(p.name || '').toLowerCase() === 'instagram' && p.handle) {
            handles.add(String(p.handle).toLowerCase().replace(/^@/, ''))
          }
        }
        for (const h of handles) {
          if (!h) continue
          const r = await client.query(
            `UPDATE imported_creators SET matched_user_id = $1, matched_at = now()
             WHERE matched_user_id IS NULL AND LOWER(instagram_handle) = $2`,
            [c.user_id, h],
          )
          matched += r.rowCount
        }
      }
      return matched
    })
    res.json({ ok: true, matched: result })
  } catch (err) { next(err) }
})

// 임포트 목록 + 매칭 결과
router.get('/imports', async (req, res, next) => {
  try {
    const { q, onlyMatched, onlyUnmatched } = req.query
    const params = []
    const where = []
    if (q) { params.push(`%${q}%`); where.push(`(ic.instagram_handle ILIKE $${params.length} OR ic.email ILIKE $${params.length} OR ic.phone ILIKE $${params.length} OR ic.name ILIKE $${params.length})`) }
    if (onlyMatched === 'true') where.push(`ic.matched_user_id IS NOT NULL`)
    if (onlyUnmatched === 'true') where.push(`ic.matched_user_id IS NULL`)
    const { rows } = await query(
      `SELECT ic.*,
              u.email AS user_email,
              cp.display_name AS matched_display_name
       FROM imported_creators ic
       LEFT JOIN users u ON u.id = ic.matched_user_id
       LEFT JOIN creator_profiles cp ON cp.user_id = ic.matched_user_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY ic.created_at DESC
       LIMIT 500`,
      params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// 인스타 핸들로 연락처 즉시 조회 (ad-hoc lookup)
router.get('/lookup', async (req, res, next) => {
  try {
    const raw = req.query.handle || req.query.q || ''
    const h = normalizeHandle(raw)
    if (!h) return res.status(400).json({ error: 'HANDLE_REQUIRED' })
    const { rows } = await query(
      `SELECT id, source, instagram_handle, instagram_url, email, phone, name, followers, matched_user_id, created_at
       FROM imported_creators WHERE LOWER(instagram_handle) = $1 ORDER BY created_at DESC LIMIT 10`,
      [h],
    )
    res.json({ handle: h, data: rows })
  } catch (err) { next(err) }
})

export default router
