// 기존 CNEC 또는 외부 Postgres DB에서 크리에이터 데이터를 읽어
// imported_creators 테이블로 복사합니다.
//
// 사용:
//   DATABASE_URL="<cnec-connect DB>" \
//   LEGACY_DATABASE_URL="<기존 CNEC DB>" \
//   LEGACY_SOURCE="cnec-legacy" \
//   node api/scripts/import-from-legacy.js
//
// 옵션:
//   LEGACY_TABLE      자동 감지 대신 특정 테이블명 강제 (예: "creators")
//   LEGACY_LIMIT      최대 건수 (기본 50000)
//   LEGACY_DRY_RUN    "true"면 쓰기 없이 미리 결과만 출력
//
// 스키마 자동 감지 규칙 (우선순위):
// 1) 테이블명 후보: creators / profiles / influencers / users 중 instagram 관련 컬럼 존재
// 2) 인스타 컬럼: instagram, instagram_handle, instagram_url, ig_handle, insta
// 3) 이메일: email, mail
// 4) 폰: phone, phone_number, mobile, contact
// 5) 이름: name, display_name, full_name, nickname
// 6) 팔로워: followers, follower_count, instagram_followers

import 'dotenv/config'
import pg from 'pg'

const LEGACY_URL = process.env.LEGACY_DATABASE_URL
const TARGET_URL = process.env.DATABASE_URL
const SOURCE = process.env.LEGACY_SOURCE || 'legacy-import'
const FORCE_TABLE = process.env.LEGACY_TABLE
const LIMIT = Number(process.env.LEGACY_LIMIT || 50000)
const DRY = String(process.env.LEGACY_DRY_RUN || '').toLowerCase() === 'true'

if (!LEGACY_URL) { console.error('LEGACY_DATABASE_URL is required'); process.exit(1) }
if (!TARGET_URL && !DRY) { console.error('DATABASE_URL (target) is required (or set LEGACY_DRY_RUN=true)'); process.exit(1) }

const IG_CANDIDATES = ['instagram_handle', 'instagram_url', 'instagram', 'ig_handle', 'insta', 'ig_url', 'instagram_id', 'instagram_username']
const EMAIL_CANDIDATES = ['email', 'mail', 'email_address', 'contact_email']
const PHONE_CANDIDATES = ['phone', 'phone_number', 'mobile', 'contact', 'contact_phone', 'mobile_number']
const NAME_CANDIDATES = ['name', 'display_name', 'full_name', 'nickname', 'creator_name', 'handle']
const FOLLOWER_CANDIDATES = ['followers', 'follower_count', 'instagram_followers', 'ig_followers', 'subscribers']
const ID_CANDIDATES = ['id', 'uuid', 'creator_id', 'user_id']

function normalizeHandle(h) {
  if (!h) return null
  let s = String(h).trim().toLowerCase()
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
  s = s.replace(/^@/, '').replace(/\/.*$/, '').replace(/\?.*$/, '')
  return s || null
}

async function discoverSchema(client) {
  if (FORCE_TABLE) {
    const cols = (await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [FORCE_TABLE],
    )).rows.map((r) => r.column_name.toLowerCase())
    return buildMapping(FORCE_TABLE, cols)
  }
  // 공용: public 스키마 모든 테이블 후보 중 instagram 컬럼이 있는 것 찾기
  const tables = (await client.query(
    `SELECT table_name, array_agg(column_name) AS cols
     FROM information_schema.columns
     WHERE table_schema = 'public'
     GROUP BY table_name`,
  )).rows
  const scored = tables
    .map((t) => {
      const cols = t.cols.map((c) => String(c).toLowerCase())
      const igHit = IG_CANDIDATES.find((c) => cols.includes(c))
      if (!igHit) return null
      let score = 10
      if (cols.some((c) => EMAIL_CANDIDATES.includes(c))) score += 5
      if (cols.some((c) => PHONE_CANDIDATES.includes(c))) score += 3
      if (cols.some((c) => FOLLOWER_CANDIDATES.includes(c))) score += 2
      return { table: t.table_name, cols, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) throw new Error('인스타 컬럼을 가진 테이블을 찾지 못했습니다. LEGACY_TABLE 환경변수로 강제 지정하세요.')
  console.log(`\n[스키마 감지] 후보 테이블:`)
  for (const s of scored.slice(0, 5)) console.log(`  · ${s.table} (score=${s.score}, cols=${s.cols.length})`)
  const best = scored[0]
  return buildMapping(best.table, best.cols)
}

function buildMapping(table, cols) {
  const lower = cols.map((c) => c.toLowerCase())
  const pick = (candidates) => candidates.find((c) => lower.includes(c)) || null
  return {
    table,
    cols: {
      id: pick(ID_CANDIDATES),
      instagram: pick(IG_CANDIDATES),
      email: pick(EMAIL_CANDIDATES),
      phone: pick(PHONE_CANDIDATES),
      name: pick(NAME_CANDIDATES),
      followers: pick(FOLLOWER_CANDIDATES),
    },
  }
}

async function main() {
  const legacy = new pg.Client({ connectionString: LEGACY_URL, ssl: { rejectUnauthorized: false } })
  await legacy.connect()

  const target = DRY ? null : new pg.Client({ connectionString: TARGET_URL, ssl: { rejectUnauthorized: false } })
  if (target) await target.connect()

  try {
    const { table, cols } = await discoverSchema(legacy)
    console.log(`\n[사용 테이블] ${table}`)
    console.log(`[매핑]`, cols)
    if (!cols.instagram) throw new Error('instagram 컬럼 매핑 실패')

    const selectCols = [
      cols.id ? `"${cols.id}"::text AS source_id` : `NULL AS source_id`,
      `"${cols.instagram}" AS instagram`,
      cols.email ? `"${cols.email}" AS email` : `NULL AS email`,
      cols.phone ? `"${cols.phone}" AS phone` : `NULL AS phone`,
      cols.name ? `"${cols.name}" AS name` : `NULL AS name`,
      cols.followers ? `"${cols.followers}"::text AS followers` : `NULL AS followers`,
    ].join(', ')

    const sql = `SELECT ${selectCols} FROM "${table}" WHERE "${cols.instagram}" IS NOT NULL LIMIT ${LIMIT}`
    console.log(`\n[쿼리] ${sql}`)

    const { rows } = await legacy.query(sql)
    console.log(`\n[읽음] ${rows.length}건`)

    if (DRY) {
      console.log('\n[DRY RUN — 미리보기 상위 5건]')
      for (const r of rows.slice(0, 5)) {
        console.log(`  @${normalizeHandle(r.instagram)} | ${r.email || '-'} | ${r.phone || '-'} | ${r.name || '-'}`)
      }
      console.log('\n실행하려면 LEGACY_DRY_RUN=false 또는 제거하고 재실행하세요.')
      return
    }

    let inserted = 0, updated = 0, skipped = 0
    for (const r of rows) {
      const handle = normalizeHandle(r.instagram)
      if (!handle) { skipped++; continue }
      const email = r.email ? String(r.email).trim().toLowerCase() || null : null
      const phone = r.phone ? String(r.phone).trim() || null : null
      const followers = r.followers ? Number(String(r.followers).replace(/[^\d]/g, '')) || null : null

      const result = await target.query(
        `INSERT INTO imported_creators(source, source_id, instagram_handle, email, phone, name, followers, raw)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         ON CONFLICT (source, source_id) WHERE source_id IS NOT NULL
         DO UPDATE SET instagram_handle = EXCLUDED.instagram_handle,
                       email = COALESCE(EXCLUDED.email, imported_creators.email),
                       phone = COALESCE(EXCLUDED.phone, imported_creators.phone),
                       name = COALESCE(EXCLUDED.name, imported_creators.name),
                       followers = COALESCE(EXCLUDED.followers, imported_creators.followers),
                       raw = EXCLUDED.raw
         RETURNING (xmax = 0) AS inserted`,
        [SOURCE, r.source_id, handle, email, phone, r.name || null, followers, JSON.stringify(r)],
      )
      if (result.rows[0]?.inserted) inserted++; else updated++
      if ((inserted + updated) % 500 === 0) process.stdout.write(`  · ${inserted + updated}건 처리...\r`)
    }
    console.log(`\n[완료] 신규 ${inserted}건, 업데이트 ${updated}건, 스킵 ${skipped}건`)

    // 자동 매칭 수행
    console.log('\n[자동 매칭] 가입 크리에이터와 인스타 핸들 매칭 중...')
    const match = await target.query(
      `UPDATE imported_creators ic
       SET matched_user_id = cp.user_id, matched_at = now()
       FROM creator_profiles cp
       WHERE ic.matched_user_id IS NULL
         AND LOWER(ic.instagram_handle) = LOWER(cp.handle)
       RETURNING ic.id`,
    )
    console.log(`  · 핸들 매칭: ${match.rowCount}건`)

    const match2 = await target.query(
      `UPDATE imported_creators ic
       SET matched_user_id = cp.user_id, matched_at = now()
       FROM creator_profiles cp, jsonb_array_elements(cp.platforms) p
       WHERE ic.matched_user_id IS NULL
         AND p->>'name' = 'instagram'
         AND LOWER(p->>'handle') = LOWER(ic.instagram_handle)
       RETURNING ic.id`,
    )
    console.log(`  · platforms jsonb 매칭: ${match2.rowCount}건`)
  } finally {
    await legacy.end()
    if (target) await target.end()
  }
}

main().catch((err) => {
  console.error('\n[실패]', err.message)
  console.error(err.stack)
  process.exit(1)
})
