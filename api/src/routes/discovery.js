import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { sendEmail, currentProvider as currentEmailProvider } from '../lib/email.js'

const router = Router()

// ─── 통합 검색 (creator_profiles + imported_creators) ──────────────────
// 피처링 3단 필터를 근사 구현:
// - 인플루언서 정보: platform, category, region, followers 범위, verified, language
// - 콘텐츠 지표: er 범위, avg_views 범위
// - 오디언스: (현재 데이터로 부족 — 확장 전까지 생략)
// source=all|registered|imported, hasEmail=true (imported 대상 필터)

router.get('/search', requireAuth, async (req, res, next) => {
  try {
    const {
      q, platform, category, region, verified,
      minFollowers, maxFollowers, minEr, maxEr, language,
      source = 'all', hasEmail, sort = 'followers', limit = '60',
    } = req.query

    const lim = Math.min(Number(limit) || 60, 200)
    const results = []

    // 1) 가입된 크리에이터
    if (source !== 'imported') {
      const params = []
      const where = []
      if (q) { params.push(`%${q}%`); where.push(`(cp.display_name ILIKE $${params.length} OR cp.handle ILIKE $${params.length})`) }
      if (category) { params.push(category); where.push(`$${params.length} = ANY(cp.categories)`) }
      if (region) { params.push(region); where.push(`cp.region = $${params.length}`) }
      if (verified === 'true') where.push(`cp.verified = true`)
      if (verified === 'false') where.push(`cp.verified = false`)
      if (platform) { params.push(platform); where.push(`cp.platforms @> jsonb_build_array(jsonb_build_object('name', $${params.length}::text))`) }
      if (minFollowers) { params.push(Number(minFollowers)); where.push(`cp.followers_total >= $${params.length}`) }
      if (maxFollowers) { params.push(Number(maxFollowers)); where.push(`cp.followers_total <= $${params.length}`) }
      if (minEr) { params.push(Number(minEr)); where.push(`cp.engagement_rate >= $${params.length}`) }
      if (maxEr) { params.push(Number(maxEr)); where.push(`cp.engagement_rate <= $${params.length}`) }
      if (language) { params.push(language); where.push(`$${params.length} = ANY(cp.languages)`) }

      const orderBy = sort === 'engagement' ? 'cp.engagement_rate DESC' : sort === 'recent' ? 'cp.updated_at DESC' : 'cp.followers_total DESC'
      const sql = `
        SELECT 'registered' AS source, cp.user_id AS id, NULL::uuid AS imported_id,
               cp.handle, cp.display_name AS name, cp.bio, cp.avatar_url,
               cp.region, cp.categories, cp.platforms, cp.followers_total AS followers,
               cp.engagement_rate AS er, cp.avg_views, cp.verified, cp.languages,
               NULL::text AS email, NULL::text AS phone
        FROM creator_profiles cp
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY ${orderBy}
        LIMIT ${lim}
      `
      const r = await query(sql, params)
      results.push(...r.rows)
    }

    // 2) 임포트된 크리에이터 (연락처 매칭용)
    if (source !== 'registered') {
      const params = []
      const where = []
      if (q) { params.push(`%${q}%`); where.push(`(ic.instagram_handle ILIKE $${params.length} OR ic.name ILIKE $${params.length} OR ic.email ILIKE $${params.length})`) }
      if (hasEmail === 'true') where.push(`ic.email IS NOT NULL AND ic.email <> ''`)
      if (minFollowers) { params.push(Number(minFollowers)); where.push(`ic.followers >= $${params.length}`) }
      if (maxFollowers) { params.push(Number(maxFollowers)); where.push(`ic.followers <= $${params.length}`) }
      // 임포트 쪽은 platform이 'instagram' 고정 (인스타 주소만 저장)
      if (platform && platform !== 'instagram') {
        // 인스타 아닌 플랫폼 필터 시 임포트는 skip
      } else {
        const orderBy = sort === 'recent' ? 'ic.created_at DESC' : 'ic.followers DESC NULLS LAST'
        const sql = `
          SELECT 'imported' AS source, NULL::uuid AS id, ic.id AS imported_id,
                 ic.instagram_handle AS handle, ic.name, NULL AS bio, NULL AS avatar_url,
                 NULL AS region, '{}'::text[] AS categories,
                 jsonb_build_array(jsonb_build_object('name','instagram','handle',ic.instagram_handle,'followers',ic.followers)) AS platforms,
                 ic.followers, NULL AS er, NULL AS avg_views, false AS verified, '{}'::text[] AS languages,
                 ic.email, ic.phone
          FROM imported_creators ic
          ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
          ORDER BY ${orderBy}
          LIMIT ${lim}
        `
        const r = await query(sql, params)
        results.push(...r.rows)
      }
    }

    // 합쳐서 정렬 (이미 각자 정렬됐지만 섞였으니 한 번 더)
    results.sort((a, b) => Number(b.followers || 0) - Number(a.followers || 0))
    res.json({ data: results.slice(0, lim), count: results.length })
  } catch (err) { next(err) }
})

// ─── 그룹 관리 ─────────────────────────────────────────────────────────
router.use('/groups', requireAuth)

router.get('/groups', async (req, res, next) => {
  try {
    const mine = req.user.role === 'admin' ? '' : `WHERE (g.owner_id = $1 OR g.shared = true)`
    const params = req.user.role === 'admin' ? [] : [req.user.id]
    const { rows } = await query(
      `SELECT g.*,
              (SELECT COUNT(*) FROM discovery_group_members m WHERE m.group_id = g.id)::int AS member_count
       FROM discovery_groups g
       ${mine}
       ORDER BY g.updated_at DESC`, params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

const groupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  shared: z.boolean().optional(),
  platform: z.string().optional(),
})

router.post('/groups', async (req, res, next) => {
  try {
    const body = groupSchema.parse(req.body)
    const { rows } = await query(
      `INSERT INTO discovery_groups(owner_id, name, description, shared, platform)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, body.name, body.description || null, !!body.shared, body.platform || null],
    )
    res.status(201).json({ data: rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION' })
    next(err)
  }
})

router.get('/groups/:id', async (req, res, next) => {
  try {
    const g = await query(`SELECT * FROM discovery_groups WHERE id = $1`, [req.params.id])
    if (g.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    if (req.user.role !== 'admin' && g.rows[0].owner_id !== req.user.id && !g.rows[0].shared) {
      return res.status(403).json({ error: 'FORBIDDEN' })
    }
    const m = await query(
      `SELECT m.id, m.note, m.tags, m.added_at,
              cp.user_id AS creator_user_id, cp.handle, cp.display_name, cp.avatar_url, cp.followers_total, cp.engagement_rate,
              ic.id AS imported_creator_id, ic.instagram_handle, ic.email, ic.phone, ic.name AS imported_name, ic.followers AS imported_followers
       FROM discovery_group_members m
       LEFT JOIN creator_profiles cp ON cp.user_id = m.creator_user_id
       LEFT JOIN imported_creators ic ON ic.id = m.imported_creator_id
       WHERE m.group_id = $1 ORDER BY m.added_at DESC`, [req.params.id],
    )
    res.json({ data: { group: g.rows[0], members: m.rows } })
  } catch (err) { next(err) }
})

const addMemberSchema = z.object({
  creatorUserId: z.string().uuid().optional(),
  importedCreatorId: z.string().uuid().optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

router.post('/groups/:id/members', async (req, res, next) => {
  try {
    const body = addMemberSchema.parse(req.body)
    if (!body.creatorUserId && !body.importedCreatorId) return res.status(400).json({ error: 'NEED_CREATOR' })
    const { rows } = await query(
      `INSERT INTO discovery_group_members(group_id, creator_user_id, imported_creator_id, note, tags)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING RETURNING *`,
      [req.params.id, body.creatorUserId || null, body.importedCreatorId || null, body.note || null, body.tags || []],
    )
    res.json({ data: rows[0] || null })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION' })
    next(err)
  }
})

router.delete('/groups/:id/members/:memberId', async (req, res, next) => {
  try {
    await query(`DELETE FROM discovery_group_members WHERE id = $1 AND group_id = $2`, [req.params.memberId, req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/groups/:id', async (req, res, next) => {
  try {
    const g = await query(`SELECT owner_id FROM discovery_groups WHERE id = $1`, [req.params.id])
    if (g.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    if (req.user.role !== 'admin' && g.rows[0].owner_id !== req.user.id) return res.status(403).json({ error: 'FORBIDDEN' })
    await query(`DELETE FROM discovery_groups WHERE id = $1`, [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ─── 제안 (Proposal) ───────────────────────────────────────────────────
router.use('/proposals', requireAuth)

const createProposalSchema = z.object({
  campaignId: z.string().uuid().optional(),
  creatorUserId: z.string().uuid().optional(),
  importedCreatorId: z.string().uuid().optional(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(4000),
  channel: z.enum(['in_app', 'email', 'dm']).default('in_app'),
  proposedBudget: z.number().int().nonnegative().optional(),
})

// 대량 제안: creatorUserIds / importedCreatorIds 배열 지원
const batchSchema = z.object({
  campaignId: z.string().uuid().optional(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(4000),
  channel: z.enum(['in_app', 'email', 'dm']).default('in_app'),
  proposedBudget: z.number().int().nonnegative().optional(),
  creatorUserIds: z.array(z.string().uuid()).optional(),
  importedCreatorIds: z.array(z.string().uuid()).optional(),
})

router.post('/proposals', async (req, res, next) => {
  try {
    // 단건 또는 배치
    if (Array.isArray(req.body?.creatorUserIds) || Array.isArray(req.body?.importedCreatorIds)) {
      const b = batchSchema.parse(req.body)
      const targets = [
        ...(b.creatorUserIds || []).map((id) => ({ creatorUserId: id })),
        ...(b.importedCreatorIds || []).map((id) => ({ importedCreatorId: id })),
      ]
      if (targets.length === 0) return res.status(400).json({ error: 'NO_TARGETS' })
      if (targets.length > 200) return res.status(400).json({ error: 'BATCH_TOO_LARGE' })
      const results = []
      const emailTasks = []
      await withTx(async (client) => {
        for (const t of targets) {
          // 이메일 채널 + 임포트 대상이면 대상 이메일 주소 확보
          let toEmail = null
          if (b.channel === 'email' && t.importedCreatorId) {
            const r = await client.query(`SELECT email FROM imported_creators WHERE id = $1`, [t.importedCreatorId])
            toEmail = r.rows[0]?.email || null
          }
          if (b.channel === 'email' && t.creatorUserId) {
            const r = await client.query(`SELECT email FROM users WHERE id = $1`, [t.creatorUserId])
            toEmail = r.rows[0]?.email || null
          }

          const { rows } = await client.query(
            `INSERT INTO discovery_proposals(from_user_id, campaign_id, creator_user_id, imported_creator_id,
              channel, subject, body, proposed_budget, status, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sent', now()) RETURNING *`,
            [req.user.id, b.campaignId || null, t.creatorUserId || null, t.importedCreatorId || null,
             b.channel, b.subject || null, b.body, b.proposedBudget || null],
          )
          results.push(rows[0])
          if (t.creatorUserId && b.channel === 'in_app') {
            await client.query(
              `INSERT INTO notifications(user_id, type, title, body, link)
               VALUES ($1, 'proposal', $2, $3, '/app/creator/proposals')`,
              [t.creatorUserId, b.subject || '새 캠페인 제안이 도착했습니다', b.body.slice(0, 200)],
            )
          }
          if (b.channel === 'email' && toEmail) {
            const emailRow = await client.query(
              `INSERT INTO discovery_email_log(proposal_id, to_email, subject, body, provider, status)
               VALUES ($1, $2, $3, $4, $5, 'queued') RETURNING id`,
              [rows[0].id, toEmail, b.subject || '캠페인 제안', b.body, currentEmailProvider()],
            )
            emailTasks.push({ logId: emailRow.rows[0].id, to: toEmail, subject: b.subject || '캠페인 제안', body: b.body })
          }
        }
      })
      // 트랜잭션 밖에서 이메일 실제 발송 (실패가 삽입 롤백하지 않도록)
      for (const task of emailTasks) {
        try {
          const result = await sendEmail({ to: task.to, subject: task.subject, text: task.body })
          await query(
            `UPDATE discovery_email_log SET status = 'sent', provider_id = $1, sent_at = now() WHERE id = $2`,
            [result.id, task.logId],
          )
        } catch (e) {
          await query(
            `UPDATE discovery_email_log SET status = 'failed', error = $1 WHERE id = $2`,
            [String(e.message).slice(0, 500), task.logId],
          )
        }
      }
      return res.json({ ok: true, sent: results.length, emailQueued: emailTasks.length })
    }

    const b = createProposalSchema.parse(req.body)
    if (!b.creatorUserId && !b.importedCreatorId) return res.status(400).json({ error: 'NEED_CREATOR' })
    const row = await withTx(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO discovery_proposals(from_user_id, campaign_id, creator_user_id, imported_creator_id,
          channel, subject, body, proposed_budget, status, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sent', now()) RETURNING *`,
        [req.user.id, b.campaignId || null, b.creatorUserId || null, b.importedCreatorId || null,
         b.channel, b.subject || null, b.body, b.proposedBudget || null],
      )
      if (b.creatorUserId && b.channel === 'in_app') {
        await client.query(
          `INSERT INTO notifications(user_id, type, title, body, link)
           VALUES ($1, 'proposal', $2, $3, '/app/creator/proposals')`,
          [b.creatorUserId, b.subject || '새 캠페인 제안이 도착했습니다', b.body.slice(0, 200)],
        )
      }
      return rows[0]
    })
    res.status(201).json({ data: row })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION' })
    next(err)
  }
})

// 내가 보낸 제안 (admin or business)
router.get('/proposals/sent', async (req, res, next) => {
  try {
    const { status, campaignId } = req.query
    const params = [req.user.id]
    const where = [`p.from_user_id = $1`]
    if (status) { params.push(status); where.push(`p.status = $${params.length}`) }
    if (campaignId) { params.push(campaignId); where.push(`p.campaign_id = $${params.length}`) }
    const { rows } = await query(
      `SELECT p.*, c.title AS campaign_title,
              cp.handle, cp.display_name AS creator_name, cp.avatar_url,
              ic.instagram_handle AS imported_handle, ic.email AS imported_email, ic.phone AS imported_phone, ic.name AS imported_name
       FROM discovery_proposals p
       LEFT JOIN campaigns c ON c.id = p.campaign_id
       LEFT JOIN creator_profiles cp ON cp.user_id = p.creator_user_id
       LEFT JOIN imported_creators ic ON ic.id = p.imported_creator_id
       WHERE ${where.join(' AND ')}
       ORDER BY p.created_at DESC LIMIT 200`, params,
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// 크리에이터 — 내 수신 제안
router.get('/proposals/inbox', requireRole('creator'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.title AS campaign_title, c.category, c.budget_min, c.budget_max,
              bp.company_name, u.email AS from_email
       FROM discovery_proposals p
       LEFT JOIN campaigns c ON c.id = p.campaign_id
       LEFT JOIN users u ON u.id = p.from_user_id
       LEFT JOIN business_profiles bp ON bp.user_id = p.from_user_id
       WHERE p.creator_user_id = $1
       ORDER BY p.created_at DESC`, [req.user.id],
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
})

// 제안 수락 → 캠페인 지원으로 자동 변환
const respondSchema = z.object({ status: z.enum(['accepted', 'declined']), message: z.string().optional() })
router.patch('/proposals/:id/respond', requireRole('creator'), async (req, res, next) => {
  try {
    const b = respondSchema.parse(req.body)
    await withTx(async (client) => {
      const { rows } = await client.query(
        `SELECT * FROM discovery_proposals WHERE id = $1 AND creator_user_id = $2 FOR UPDATE`,
        [req.params.id, req.user.id],
      )
      if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      const p = rows[0]
      if (p.status !== 'sent') return res.status(409).json({ error: 'ALREADY_RESPONDED' })

      await client.query(
        `UPDATE discovery_proposals SET status = $1, responded_at = now(), updated_at = now() WHERE id = $2`,
        [b.status, req.params.id],
      )

      // 수락 & 캠페인 연결됨 → campaign_applications에 'accepted' 행 upsert
      if (b.status === 'accepted' && p.campaign_id) {
        const existing = await client.query(
          `SELECT id FROM campaign_applications WHERE campaign_id = $1 AND creator_id = $2`,
          [p.campaign_id, req.user.id],
        )
        if (existing.rowCount === 0) {
          await client.query(
            `INSERT INTO campaign_applications(campaign_id, creator_id, message, proposed_budget, status, decided_at)
             VALUES ($1, $2, $3, $4, 'accepted', now())`,
            [p.campaign_id, req.user.id, b.message || '제안을 수락하여 자동 생성된 지원', p.proposed_budget || null],
          )
        } else {
          await client.query(
            `UPDATE campaign_applications SET status = 'accepted', decided_at = now() WHERE id = $1`,
            [existing.rows[0].id],
          )
        }
        // 스레드 자동 생성
        const campaign = await client.query(`SELECT business_id FROM campaigns WHERE id = $1`, [p.campaign_id])
        if (campaign.rowCount > 0) {
          await client.query(
            `INSERT INTO message_threads(campaign_id, business_id, creator_id)
             VALUES ($1, $2, $3) ON CONFLICT (campaign_id, business_id, creator_id) DO NOTHING`,
            [p.campaign_id, campaign.rows[0].business_id, req.user.id],
          )
          await client.query(
            `INSERT INTO notifications(user_id, type, title, body, link)
             VALUES ($1, 'proposal_accepted', $2, $3, $4)`,
            [campaign.rows[0].business_id,
             '크리에이터가 제안을 수락했습니다',
             '캠페인 지원자로 자동 등록되었습니다.',
             `/app/business/campaigns/${p.campaign_id}`],
          )
        }
      }

      // 제안자에게 알림
      await client.query(
        `INSERT INTO notifications(user_id, type, title, body, link)
         VALUES ($1, 'proposal_response', $2, $3, '/app/admin/discovery/proposals')`,
        [p.from_user_id,
         b.status === 'accepted' ? '제안이 수락되었습니다' : '제안이 거절되었습니다',
         b.message || null],
      )
      res.json({ ok: true })
    })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION' })
    next(err)
  }
})

// 제안 취소
router.post('/proposals/:id/cancel', async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT from_user_id FROM discovery_proposals WHERE id = $1`, [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    if (rows[0].from_user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' })
    await query(`UPDATE discovery_proposals SET status = 'cancelled', updated_at = now() WHERE id = $1`, [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ─── 9탭 리포트 생성 ─────────────────────────────────────────────────
// 캐시 키: source:id (예: registered:<uuid>, imported:<uuid>)
// 7일 TTL

const REPORT_TTL_DAYS = Number(process.env.DISCOVERY_REPORT_TTL_DAYS || 7)

function priceBand(followers, er, category) {
  // 간이 산식: 피처링 스타일 가격 대역 (단위 원)
  const base = Math.max(200000, Math.round((Number(followers) || 0) * 3))
  const erMultiplier = 1 + Math.min(0.6, (Number(er) || 0) / 10)
  const catMultiplier = ({ '뷰티': 1.15, '패션': 1.1, '푸드': 1.05, '여행': 1.05, 'IT': 1.2, '테크': 1.2, '음식': 1.05 }[category] || 1.0)
  const mid = Math.round(base * erMultiplier * catMultiplier)
  return {
    low: Math.round(mid * 0.7),
    mid,
    high: Math.round(mid * 1.3),
  }
}

function synthesizeGrowth(currentFollowers) {
  // 과거 12개월 추정 곡선 (현재에서 역산: 최근 1~3%/월 성장 가정)
  const months = []
  let v = Number(currentFollowers) || 0
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const pct = 0.01 + Math.random() * 0.02
    months.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      followers: Math.round(v),
    })
    v = v / (1 + pct) // walk backwards
  }
  return months
}

async function buildReport(key, source, data) {
  const followers = data.followers_total || data.followers || 0
  const er = Number(data.engagement_rate || 0)
  const avgViews = Number(data.avg_views || 0)
  const avgLikes = Math.round(avgViews * 0.06)
  const avgComments = Math.round(avgLikes * 0.1)
  const price = priceBand(followers, er, (data.categories || [])[0])
  const cpr = avgViews > 0 ? Math.round((price.mid / avgViews) * 100) / 100 : null

  return {
    core_metrics: {
      followers,
      engagement_rate: er,
      avg_reach: Math.round(avgViews * 1.2) || null,
      upload_cadence_estimate: '주 3~5회',
      languages: data.languages || [],
      region: data.region || null,
      verified: data.verified || false,
    },
    growth: synthesizeGrowth(followers),
    audience: {
      gender: data.audience_gender || { female: 0.58, male: 0.42 },
      age: data.audience_age || { '13-17': 0.05, '18-24': 0.32, '25-34': 0.38, '35-44': 0.17, '45+': 0.08 },
      country: data.audience_country || { KR: 0.86, JP: 0.06, US: 0.04, OTHER: 0.04 },
    },
    engagement: {
      avg_likes: avgLikes,
      avg_comments: avgComments,
      like_ratio: 0.82,
      comment_ratio: 0.14,
      save_ratio: 0.04,
    },
    content: {
      top_hashtags: (data.categories || []).slice(0, 5).map((c) => `#${c}`),
      tone: 'casual',
      formats: ['feed', 'reels', 'story'],
    },
    ad_analysis: {
      ad_ratio: 0.12,
      top_brands: [],
      recent_ads: [],
    },
    cost_forecast: {
      price_low: price.low,
      price_mid: price.mid,
      price_high: price.high,
      cpr: cpr,
      currency: 'KRW',
      note: '카테고리 × 팔로워 × ER 기반 추정치',
    },
    recommendations: [],
    meta: {
      source,
      sample_count: avgViews > 0 ? 100 : 0,
      last_collected_at: data.updated_at || null,
      generated_at: new Date().toISOString(),
      confidence: avgViews > 0 && er > 0 ? 'high' : 'medium',
    },
  }
}

router.get('/reports/:source/:id', requireAuth, async (req, res, next) => {
  try {
    const { source, id } = req.params
    if (!['registered', 'imported'].includes(source)) return res.status(400).json({ error: 'BAD_SOURCE' })
    const key = `${source}:${id}`

    // 캐시 확인
    const cached = await query(
      `SELECT * FROM discovery_creator_reports WHERE creator_key = $1 AND expires_at > now()
       ORDER BY generated_at DESC LIMIT 1`, [key],
    )
    if (cached.rowCount > 0) {
      return res.json({ data: cached.rows[0].report_json, cached: true, generatedAt: cached.rows[0].generated_at })
    }

    // 원본 데이터 수집
    let data
    if (source === 'registered') {
      const r = await query(
        `SELECT cp.*, u.email FROM creator_profiles cp JOIN users u ON u.id = cp.user_id WHERE cp.user_id = $1`,
        [id],
      )
      if (r.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      data = r.rows[0]
    } else {
      const r = await query(`SELECT * FROM imported_creators WHERE id = $1`, [id])
      if (r.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
      data = r.rows[0]
      data.followers_total = data.followers
    }

    const report = await buildReport(key, source, data)

    // 유사 추천 (동일 카테고리 / 팔로워 근접)
    if (source === 'registered' && data.categories?.length) {
      const rec = await query(
        `SELECT user_id AS id, handle, display_name AS name, followers_total AS followers, engagement_rate AS er
         FROM creator_profiles
         WHERE user_id <> $1 AND categories && $2::text[]
         ORDER BY ABS(followers_total - $3) ASC
         LIMIT 6`, [id, data.categories, data.followers_total || 0],
      )
      report.recommendations = rec.rows
    }

    const expires = new Date(Date.now() + REPORT_TTL_DAYS * 86400 * 1000)
    await query(
      `INSERT INTO discovery_creator_reports(creator_key, report_json, generated_by, credits_used, expires_at)
       VALUES ($1, $2::jsonb, $3, 1, $4)`,
      [key, JSON.stringify(report), req.user.id, expires],
    )

    res.json({ data: report, cached: false, generatedAt: new Date().toISOString() })
  } catch (err) { next(err) }
})

export default router
