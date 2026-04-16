import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { captureEscrow } from '../lib/payments.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

async function logActivity(client, actorId, action, targetType, targetId, meta) {
  await client.query(
    `INSERT INTO admin_activities(actor_id, action, target_type, target_id, meta) VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [actorId, action, targetType, targetId, JSON.stringify(meta || {})],
  )
}

async function notify(client, userId, type, title, body, link) {
  if (!userId) return
  await client.query(
    `INSERT INTO notifications(user_id, type, title, body, link) VALUES ($1, $2, $3, $4, $5)`,
    [userId, type, title, body || null, link || null],
  )
}

// ─── 대시보드 ────────────────────────────────────────────────────────────
router.get('/summary', async (_req, res, next) => {
  try {
    const [u, c, a, p, cp, content, recent] = await Promise.all([
      query(`SELECT role, COUNT(*)::int AS n FROM users GROUP BY role`),
      query(`SELECT status, COUNT(*)::int AS n FROM campaigns GROUP BY status`),
      query(`SELECT status, COUNT(*)::int AS n FROM campaign_applications GROUP BY status`),
      query(`SELECT status, COALESCE(SUM(amount), 0)::bigint AS total, COUNT(*)::int AS n FROM payments GROUP BY status`),
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE matched_user_id IS NOT NULL)::int AS matched FROM imported_creators`),
      query(`SELECT COUNT(*) FILTER (WHERE approved)::int AS approved, COUNT(*) FILTER (WHERE NOT approved)::int AS pending FROM content_posts`),
      query(`SELECT id, action, target_type, target_id, created_at, meta FROM admin_activities ORDER BY created_at DESC LIMIT 10`),
    ])
    res.json({
      users: u.rows, campaigns: c.rows, applications: a.rows, payments: p.rows,
      imported: cp.rows[0] || { total: 0, matched: 0 },
      content: content.rows[0] || { approved: 0, pending: 0 },
      recentActivity: recent.rows,
    })
  } catch (err) { next(err) }
})

// ─── 사용자 관리 (확장) ────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const { role, q, suspended } = req.query
    const params = []
    const where = []
    if (role) { params.push(role); where.push(`u.role = $${params.length}`) }
    if (suspended === 'true') where.push(`u.suspended = true`)
    if (suspended === 'false') where.push(`u.suspended = false`)
    if (q) { params.push(`%${q}%`); where.push(`(u.email ILIKE $${params.length} OR cp.display_name ILIKE $${params.length} OR bp.company_name ILIKE $${params.length})`) }
    const { rows } = await query(
      `SELECT u.id, u.email, u.role, u.email_verified, u.suspended, u.suspended_reason, u.created_at,
              cp.handle, cp.display_name, cp.verified AS creator_verified, cp.followers_total,
              bp.company_name, bp.verified AS business_verified
       FROM users u
       LEFT JOIN creator_profiles cp ON cp.user_id = u.id
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY u.created_at DESC LIMIT 200`,
      params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

router.post('/users/:id/verify', async (req, res, next) => {
  try {
    await withTx(async (client) => {
      const user = await client.query(`SELECT role FROM users WHERE id = $1`, [req.params.id])
      if (user.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      const role = user.rows[0].role
      if (role === 'creator') await client.query(`UPDATE creator_profiles SET verified = NOT verified WHERE user_id = $1`, [req.params.id])
      else if (role === 'business') await client.query(`UPDATE business_profiles SET verified = NOT verified WHERE user_id = $1`, [req.params.id])
      await logActivity(client, req.user.id, 'verify_toggle', 'user', req.params.id)
      res.json({ ok: true })
    })
  } catch (err) { next(err) }
})

router.post('/users/:id/suspend', async (req, res, next) => {
  try {
    const reason = (req.body?.reason || '').slice(0, 200) || null
    await withTx(async (client) => {
      const u = await client.query(`SELECT suspended FROM users WHERE id = $1`, [req.params.id])
      if (u.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      const newValue = !u.rows[0].suspended
      await client.query(
        `UPDATE users SET suspended = $2, suspended_at = CASE WHEN $2 THEN now() ELSE NULL END,
         suspended_reason = CASE WHEN $2 THEN $3 ELSE NULL END WHERE id = $1`,
        [req.params.id, newValue, reason],
      )
      await logActivity(client, req.user.id, newValue ? 'suspend' : 'unsuspend', 'user', req.params.id, { reason })
      await notify(client, req.params.id, 'account_status',
        newValue ? '계정이 정지되었습니다' : '계정 정지가 해제되었습니다',
        reason || null, null)
      res.json({ ok: true, suspended: newValue })
    })
  } catch (err) { next(err) }
})

const roleSchema = z.object({ role: z.enum(['creator', 'business', 'admin']) })
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const body = roleSchema.parse(req.body)
    await withTx(async (client) => {
      await client.query(`UPDATE users SET role = $1 WHERE id = $2`, [body.role, req.params.id])
      await logActivity(client, req.user.id, 'role_change', 'user', req.params.id, { role: body.role })
      res.json({ ok: true })
    })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION' })
    next(err)
  }
})

router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'CANNOT_DELETE_SELF' })
    await withTx(async (client) => {
      await client.query(`DELETE FROM users WHERE id = $1`, [req.params.id])
      await logActivity(client, req.user.id, 'delete_user', 'user', req.params.id)
      res.json({ ok: true })
    })
  } catch (err) { next(err) }
})

// ─── 캠페인 관리 (확장) ────────────────────────────────────────────────
router.get('/campaigns', async (req, res, next) => {
  try {
    const { q, status } = req.query
    const params = []
    const where = []
    if (q) { params.push(`%${q}%`); where.push(`(c.title ILIKE $${params.length} OR bp.company_name ILIKE $${params.length})`) }
    if (status) { params.push(status); where.push(`c.status = $${params.length}`) }
    const { rows } = await query(
      `SELECT c.*, bp.company_name,
              (SELECT COUNT(*) FROM campaign_applications a WHERE a.campaign_id = c.id)::int AS app_count,
              (SELECT COUNT(*) FROM campaign_applications a WHERE a.campaign_id = c.id AND a.status = 'accepted')::int AS accepted_count
       FROM campaigns c LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY c.created_at DESC LIMIT 200`, params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

const statusSchema = z.object({ status: z.enum(['draft', 'recruiting', 'in_progress', 'completed', 'closed']) })
router.patch('/campaigns/:id/status', async (req, res, next) => {
  try {
    const body = statusSchema.parse(req.body)
    await withTx(async (client) => {
      const c = await client.query(`SELECT business_id FROM campaigns WHERE id = $1`, [req.params.id])
      if (c.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      await client.query(`UPDATE campaigns SET status = $1, updated_at = now() WHERE id = $2`, [body.status, req.params.id])
      await logActivity(client, req.user.id, 'campaign_status', 'campaign', req.params.id, { status: body.status })
      await notify(client, c.rows[0].business_id, 'admin_action',
        `관리자에 의해 캠페인 상태가 변경되었습니다 (${body.status})`, null, `/app/business/campaigns/${req.params.id}`)
      res.json({ ok: true })
    })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION' })
    next(err)
  }
})

router.delete('/campaigns/:id', async (req, res, next) => {
  try {
    await withTx(async (client) => {
      await client.query(`DELETE FROM campaigns WHERE id = $1`, [req.params.id])
      await logActivity(client, req.user.id, 'delete_campaign', 'campaign', req.params.id)
      res.json({ ok: true })
    })
  } catch (err) { next(err) }
})

// ─── 지원 관리 ────────────────────────────────────────────────────────
router.get('/applications', async (req, res, next) => {
  try {
    const { status, campaignId } = req.query
    const params = []
    const where = []
    if (status) { params.push(status); where.push(`a.status = $${params.length}`) }
    if (campaignId) { params.push(campaignId); where.push(`a.campaign_id = $${params.length}`) }
    const { rows } = await query(
      `SELECT a.*, c.title AS campaign_title, bp.company_name,
              cp.handle, cp.display_name, cp.avatar_url, cp.followers_total
       FROM campaign_applications a
       JOIN campaigns c ON c.id = a.campaign_id
       LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       LEFT JOIN creator_profiles cp ON cp.user_id = a.creator_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY a.applied_at DESC LIMIT 200`, params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

const decideSchema = z.object({ status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']) })
router.patch('/applications/:id', async (req, res, next) => {
  try {
    const body = decideSchema.parse(req.body)
    await withTx(async (client) => {
      const row = await client.query(
        `SELECT a.*, c.business_id FROM campaign_applications a JOIN campaigns c ON c.id = a.campaign_id WHERE a.id = $1`,
        [req.params.id],
      )
      if (row.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      await client.query(
        `UPDATE campaign_applications SET status = $1, decided_at = CASE WHEN $1 IN ('accepted','rejected') THEN now() ELSE decided_at END WHERE id = $2`,
        [body.status, req.params.id],
      )
      if (body.status === 'accepted') {
        await client.query(
          `INSERT INTO message_threads(campaign_id, business_id, creator_id) VALUES ($1, $2, $3)
           ON CONFLICT (campaign_id, business_id, creator_id) DO NOTHING`,
          [row.rows[0].campaign_id, row.rows[0].business_id, row.rows[0].creator_id],
        )
      }
      await logActivity(client, req.user.id, 'application_force', 'application', req.params.id, { status: body.status })
      await notify(client, row.rows[0].creator_id, 'application_decision',
        `관리자가 지원 상태를 ${body.status}로 변경했습니다`, null, '/app/creator/applications')
      res.json({ ok: true })
    })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION' })
    next(err)
  }
})

// ─── 콘텐츠 모더레이션 ────────────────────────────────────────────────
router.get('/content', async (req, res, next) => {
  try {
    const { approved, campaignId } = req.query
    const params = []
    const where = []
    if (approved === 'true') where.push(`cp.approved = true`)
    if (approved === 'false') where.push(`cp.approved = false`)
    if (campaignId) { params.push(campaignId); where.push(`cp.campaign_id = $${params.length}`) }
    const { rows } = await query(
      `SELECT cp.*, c.title AS campaign_title, bp.company_name, cr.handle AS creator_handle, cr.display_name AS creator_name
       FROM content_posts cp
       JOIN campaigns c ON c.id = cp.campaign_id
       LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       LEFT JOIN creator_profiles cr ON cr.user_id = cp.creator_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY cp.created_at DESC LIMIT 200`, params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

router.patch('/content/:id', async (req, res, next) => {
  try {
    const approved = !!req.body?.approved
    await withTx(async (client) => {
      const r = await client.query(`SELECT creator_id FROM content_posts WHERE id = $1`, [req.params.id])
      if (r.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      await client.query(`UPDATE content_posts SET approved = $1 WHERE id = $2`, [approved, req.params.id])
      await logActivity(client, req.user.id, approved ? 'content_approve' : 'content_reject', 'content', req.params.id)
      await notify(client, r.rows[0].creator_id, 'content_moderation',
        approved ? '콘텐츠가 승인되었습니다' : '콘텐츠가 반려되었습니다', null, '/app/creator/content')
      res.json({ ok: true })
    })
  } catch (err) { next(err) }
})

router.delete('/content/:id', async (req, res, next) => {
  try {
    await withTx(async (client) => {
      await client.query(`DELETE FROM content_posts WHERE id = $1`, [req.params.id])
      await logActivity(client, req.user.id, 'content_delete', 'content', req.params.id)
      res.json({ ok: true })
    })
  } catch (err) { next(err) }
})

// ─── 결제 관리 (확장) ──────────────────────────────────────────────────
router.get('/payments', async (req, res, next) => {
  try {
    const { status } = req.query
    const params = []
    const where = []
    if (status) { params.push(status); where.push(`p.status = $${params.length}`) }
    const { rows } = await query(
      `SELECT p.*, c.title AS campaign_title, bp.company_name, cp.display_name AS creator_name
       FROM payments p
       JOIN campaigns c ON c.id = p.campaign_id
       LEFT JOIN business_profiles bp ON bp.user_id = c.business_id
       LEFT JOIN campaign_applications a ON a.id = p.application_id
       LEFT JOIN creator_profiles cp ON cp.user_id = a.creator_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY p.created_at DESC LIMIT 200`, params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

router.post('/payments/:id/release', async (req, res, next) => {
  try {
    await withTx(async (client) => {
      const r = await client.query(
        `SELECT p.*, a.creator_id FROM payments p LEFT JOIN campaign_applications a ON a.id = p.application_id WHERE p.id = $1 FOR UPDATE`,
        [req.params.id],
      )
      if (r.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      const p = r.rows[0]
      if (p.status === 'released') return res.json({ ok: true, alreadyReleased: true })
      if (p.provider === 'stripe') {
        try { await captureEscrow(p.provider_txn_id) }
        catch (e) { return res.status(502).json({ error: 'CAPTURE_FAILED', detail: e.message }) }
      }
      await client.query(`UPDATE payments SET status = 'released', released_at = now(), updated_at = now() WHERE id = $1`, [req.params.id])
      await logActivity(client, req.user.id, 'force_release', 'payment', req.params.id)
      await notify(client, p.creator_id, 'payment_released',
        `관리자에 의해 정산이 실행되었습니다 (₩${Number(p.amount).toLocaleString()})`, null, '/app/creator/earnings')
      res.json({ ok: true })
    })
  } catch (err) { next(err) }
})

router.post('/payments/:id/refund', async (req, res, next) => {
  try {
    await withTx(async (client) => {
      const r = await client.query(`SELECT * FROM payments WHERE id = $1 FOR UPDATE`, [req.params.id])
      if (r.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      await client.query(`UPDATE payments SET status = 'refunded', updated_at = now() WHERE id = $1`, [req.params.id])
      await logActivity(client, req.user.id, 'refund', 'payment', req.params.id, { reason: req.body?.reason })
      res.json({ ok: true })
    })
  } catch (err) { next(err) }
})

// ─── 공지 브로드캐스트 ────────────────────────────────────────────────
const broadcastSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(1000).optional(),
  link: z.string().optional(),
  target: z.enum(['all', 'creator', 'business']).default('all'),
})

router.post('/broadcast', async (req, res, next) => {
  try {
    const body = broadcastSchema.parse(req.body)
    let where = ''
    const params = [body.title, body.body || null, body.link || null]
    if (body.target !== 'all') { where = 'WHERE role = $4'; params.push(body.target) }
    const result = await query(
      `INSERT INTO notifications(user_id, type, title, body, link)
       SELECT id, 'broadcast', $1, $2, $3 FROM users ${where}`, params,
    )
    await withTx(async (client) => {
      await logActivity(client, req.user.id, 'broadcast', 'notification', null, { title: body.title, target: body.target, count: result.rowCount })
    })
    res.json({ ok: true, sent: result.rowCount })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION' })
    next(err)
  }
})

// ─── 활동 피드 ────────────────────────────────────────────────────────
router.get('/activity', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT a.id, a.action, a.target_type, a.target_id, a.meta, a.created_at, u.email AS actor_email
       FROM admin_activities a LEFT JOIN users u ON u.id = a.actor_id
       ORDER BY a.created_at DESC LIMIT 100`,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// ─── 크리에이터 임포트 (기존) ─────────────────────────────────────────
function normalizeHandle(h) {
  if (!h) return null
  let s = String(h).trim().toLowerCase()
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
  s = s.replace(/^@/, '').replace(/\/.*$/, '')
  return s || null
}

const importSchema = z.object({
  source: z.string().min(1),
  rows: z.array(z.object({
    instagram: z.string().optional(),
    instagram_handle: z.string().optional(),
    instagram_url: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    followers: z.union([z.number(), z.string()]).optional(),
    source_id: z.string().optional(),
  })).max(10000),
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
         DO UPDATE SET instagram_handle = EXCLUDED.instagram_handle, email = EXCLUDED.email,
                       phone = EXCLUDED.phone, name = EXCLUDED.name, followers = EXCLUDED.followers, raw = EXCLUDED.raw`,
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

router.post('/imports/match', async (_req, res, next) => {
  try {
    const matched = await withTx(async (client) => {
      const { rows: creators } = await client.query(`SELECT user_id, handle, platforms FROM creator_profiles`)
      let n = 0
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
          n += r.rowCount
        }
      }
      return n
    })
    res.json({ ok: true, matched })
  } catch (err) { next(err) }
})

router.get('/imports', async (req, res, next) => {
  try {
    const { q, onlyMatched, onlyUnmatched } = req.query
    const params = []
    const where = []
    if (q) { params.push(`%${q}%`); where.push(`(ic.instagram_handle ILIKE $${params.length} OR ic.email ILIKE $${params.length} OR ic.phone ILIKE $${params.length} OR ic.name ILIKE $${params.length})`) }
    if (onlyMatched === 'true') where.push(`ic.matched_user_id IS NOT NULL`)
    if (onlyUnmatched === 'true') where.push(`ic.matched_user_id IS NULL`)
    const { rows } = await query(
      `SELECT ic.*, u.email AS user_email, cp.display_name AS matched_display_name
       FROM imported_creators ic LEFT JOIN users u ON u.id = ic.matched_user_id
       LEFT JOIN creator_profiles cp ON cp.user_id = ic.matched_user_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY ic.created_at DESC LIMIT 500`, params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

router.get('/lookup', async (req, res, next) => {
  try {
    const raw = req.query.handle || req.query.q || ''
    const h = normalizeHandle(raw)
    if (!h) return res.status(400).json({ error: 'HANDLE_REQUIRED' })
    const { rows } = await query(
      `SELECT id, source, instagram_handle, instagram_url, email, phone, name, followers, matched_user_id, created_at
       FROM imported_creators WHERE LOWER(instagram_handle) = $1 ORDER BY created_at DESC LIMIT 10`, [h],
    )
    res.json({ handle: h, data: rows })
  } catch (err) { next(err) }
})

export default router
