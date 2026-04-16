import 'dotenv/config'
import { pool, withTx } from '../src/db.js'
import { hashPassword } from '../src/lib/password.js'

const DEMO_PASSWORD = 'demo1234!'

const CREATOR_SEEDS = [
  { email: 'creator@demo.cnec.co', handle: 'demo_creator', display_name: '데모 크리에이터', bio: 'CNEC Connect 데모 크리에이터입니다.', region: '서울', categories: ['뷰티', '라이프스타일'], platforms: [{ name: 'instagram', handle: 'demo_creator', followers: 128000 }, { name: 'youtube', handle: 'demoCreator', followers: 52000 }], followers_total: 180000, engagement_rate: 4.8, avg_views: 62000, languages: ['ko'], verified: true },
  { email: 'sora@demo.cnec.co', handle: 'sora_daily', display_name: '소라의 일상', bio: '데일리룩·뷰티 리뷰 크리에이터', region: '서울', categories: ['패션', '뷰티'], platforms: [{ name: 'instagram', handle: 'sora_daily', followers: 245000 }], followers_total: 245000, engagement_rate: 5.2, avg_views: 78000, languages: ['ko'], verified: true },
  { email: 'chef.min@demo.cnec.co', handle: 'chef_min', display_name: '민셰프', bio: '자취 요리·맛집 탐방', region: '부산', categories: ['음식', '맛집'], platforms: [{ name: 'youtube', handle: 'chefmin', followers: 310000 }, { name: 'instagram', handle: 'chef.min', followers: 88000 }], followers_total: 398000, engagement_rate: 3.9, avg_views: 145000, languages: ['ko'], verified: true },
  { email: 'travel.k@demo.cnec.co', handle: 'travel_k', display_name: '트래블케이', bio: '주말 국내여행 & 호캉스', region: '제주', categories: ['여행', '라이프스타일'], platforms: [{ name: 'instagram', handle: 'travel_k', followers: 520000 }, { name: 'tiktok', handle: 'travelk', followers: 180000 }], followers_total: 700000, engagement_rate: 4.1, avg_views: 210000, languages: ['ko', 'en'], verified: true },
  { email: 'fit.yoon@demo.cnec.co', handle: 'fit_yoon', display_name: '피트윤', bio: '홈트·헬스 루틴', region: '서울', categories: ['운동', '건강'], platforms: [{ name: 'youtube', handle: 'fityoon', followers: 420000 }], followers_total: 420000, engagement_rate: 6.1, avg_views: 185000, languages: ['ko'], verified: true },
  { email: 'tech.joon@demo.cnec.co', handle: 'tech_joon', display_name: '테크준', bio: 'IT 기기·앱 리뷰', region: '경기', categories: ['IT', '테크'], platforms: [{ name: 'youtube', handle: 'techjoon', followers: 260000 }], followers_total: 260000, engagement_rate: 4.5, avg_views: 98000, languages: ['ko'], verified: false },
  { email: 'kids.mom@demo.cnec.co', handle: 'kidsmom', display_name: '키즈맘', bio: '육아·키즈 제품 리뷰', region: '인천', categories: ['육아', '라이프스타일'], platforms: [{ name: 'instagram', handle: 'kidsmom', followers: 135000 }], followers_total: 135000, engagement_rate: 5.8, avg_views: 48000, languages: ['ko'], verified: true },
  { email: 'petlover@demo.cnec.co', handle: 'petlover', display_name: '펫러버', bio: '강아지·고양이 일상', region: '대구', categories: ['반려동물'], platforms: [{ name: 'instagram', handle: 'petlover', followers: 210000 }, { name: 'tiktok', handle: 'petloverkr', followers: 150000 }], followers_total: 360000, engagement_rate: 7.0, avg_views: 125000, languages: ['ko'], verified: true },
]

const BUSINESS_SEEDS = [
  { email: 'brand@demo.cnec.co', company_name: 'CNEC 데모 브랜드', contact_name: '김브랜드', phone: '02-000-0000', industry: '뷰티', website: 'https://cnec.co' },
  { email: 'fnb@demo.cnec.co', company_name: '맛있는 F&B', contact_name: '이식품', phone: '02-111-1111', industry: '식음료', website: 'https://tasty.example' },
  { email: 'tech@demo.cnec.co', company_name: '테크 스타트업', contact_name: '박테크', phone: '02-222-2222', industry: '테크', website: 'https://techstart.example' },
]

const CAMPAIGN_SEEDS = [
  { title: '여름 신상 립밤 인스타 체험단', description: '수분 가득 립밤 신상을 인스타그램 릴스/피드에 업로드해주실 크리에이터를 찾습니다.', category: '뷰티', brand_owner: 'brand@demo.cnec.co', budget_min: 300000, budget_max: 800000, deliverables: [{ type: 'reels', count: 1 }, { type: 'feed', count: 2 }], requirements: '팔로워 5만 이상, 뷰티 카테고리', platforms: ['instagram'], regions: ['전국'], recruit_count: 10 },
  { title: '프리미엄 반려동물 간식 체험 캠페인', description: '신제품 반려동물 간식 체험 후 유튜브/인스타 리뷰', category: '반려동물', brand_owner: 'fnb@demo.cnec.co', budget_min: 500000, budget_max: 1500000, deliverables: [{ type: 'youtube', count: 1 }, { type: 'feed', count: 1 }], requirements: '반려동물 콘텐츠 채널', platforms: ['youtube', 'instagram'], regions: ['전국'], recruit_count: 5 },
  { title: '신제품 무선이어폰 리뷰 영상', description: '신제품 무선이어폰을 직접 사용하고 장단점을 솔직하게 리뷰해주세요.', category: '테크', brand_owner: 'tech@demo.cnec.co', budget_min: 1000000, budget_max: 3000000, deliverables: [{ type: 'youtube', count: 1 }], requirements: '테크/IT 리뷰 경력', platforms: ['youtube'], regions: ['전국'], recruit_count: 3 },
  { title: '2분기 호텔 호캉스 숙박 리뷰', description: '신규 오픈 호텔 1박 2일 체험 후 리뷰', category: '여행', brand_owner: 'brand@demo.cnec.co', budget_min: 800000, budget_max: 1800000, deliverables: [{ type: 'reels', count: 2 }, { type: 'feed', count: 3 }], requirements: '여행/라이프스타일 채널, 팔로워 10만 이상', platforms: ['instagram', 'tiktok'], regions: ['서울', '제주'], recruit_count: 4 },
  { title: '홈트 기구 3개월 체험 캠페인', description: '홈트 기구 장기 체험 후 변화 콘텐츠 제작', category: '운동', brand_owner: 'fnb@demo.cnec.co', budget_min: 1200000, budget_max: 2500000, deliverables: [{ type: 'youtube', count: 3 }, { type: 'feed', count: 6 }], requirements: '피트니스 카테고리, 꾸준한 업로드', platforms: ['youtube', 'instagram'], regions: ['전국'], recruit_count: 3 },
]

async function upsertCreator(client, passwordHash, seed) {
  const res = await client.query(
    `INSERT INTO users(email, password_hash, role, email_verified)
     VALUES ($1, $2, 'creator', true)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [seed.email, passwordHash],
  )
  const userId = res.rows[0].id
  await client.query(
    `INSERT INTO creator_profiles(user_id, handle, display_name, bio, region, categories, platforms, followers_total, engagement_rate, avg_views, languages, verified, onboarded)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, true)
     ON CONFLICT (user_id) DO UPDATE SET
       handle = EXCLUDED.handle,
       display_name = EXCLUDED.display_name,
       bio = EXCLUDED.bio,
       region = EXCLUDED.region,
       categories = EXCLUDED.categories,
       platforms = EXCLUDED.platforms,
       followers_total = EXCLUDED.followers_total,
       engagement_rate = EXCLUDED.engagement_rate,
       avg_views = EXCLUDED.avg_views,
       languages = EXCLUDED.languages,
       verified = EXCLUDED.verified`,
    [
      userId,
      seed.handle,
      seed.display_name,
      seed.bio,
      seed.region,
      seed.categories,
      JSON.stringify(seed.platforms),
      seed.followers_total,
      seed.engagement_rate,
      seed.avg_views,
      seed.languages,
      seed.verified,
    ],
  )
  return userId
}

async function upsertBusiness(client, passwordHash, seed) {
  const res = await client.query(
    `INSERT INTO users(email, password_hash, role, email_verified)
     VALUES ($1, $2, 'business', true)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [seed.email, passwordHash],
  )
  const userId = res.rows[0].id
  await client.query(
    `INSERT INTO business_profiles(user_id, company_name, contact_name, phone, industry, website, verified, onboarded)
     VALUES ($1, $2, $3, $4, $5, $6, true, true)
     ON CONFLICT (user_id) DO UPDATE SET
       company_name = EXCLUDED.company_name,
       contact_name = EXCLUDED.contact_name,
       phone = EXCLUDED.phone,
       industry = EXCLUDED.industry,
       website = EXCLUDED.website`,
    [userId, seed.company_name, seed.contact_name, seed.phone, seed.industry, seed.website],
  )
  return userId
}

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Aborting seed.')
    process.exit(1)
  }
  const passwordHash = await hashPassword(DEMO_PASSWORD)

  await withTx(async (client) => {
    // 관리자 계정
    await client.query(
      `INSERT INTO users(email, password_hash, role, email_verified)
       VALUES ($1, $2, 'admin', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
      ['admin@demo.cnec.co', passwordHash],
    )
    console.log('admin: admin@demo.cnec.co')

    const businessIds = {}
    for (const s of BUSINESS_SEEDS) {
      businessIds[s.email] = await upsertBusiness(client, passwordHash, s)
      console.log(`business: ${s.email}`)
    }

    const creatorIds = {}
    for (const s of CREATOR_SEEDS) {
      creatorIds[s.email] = await upsertCreator(client, passwordHash, s)
      console.log(`creator: ${s.email}`)
    }

    // Clear old demo campaigns for idempotent seed
    await client.query(
      `DELETE FROM campaigns WHERE business_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))`,
      [BUSINESS_SEEDS.map((b) => b.email)],
    )

    const campaignIds = []
    for (const c of CAMPAIGN_SEEDS) {
      const res = await client.query(
        `INSERT INTO campaigns(business_id, title, description, category, budget_min, budget_max, deliverables, requirements, platforms, regions, start_date, end_date, apply_deadline, recruit_count, status, brand_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, now()::date, (now() + interval '30 days')::date, (now() + interval '10 days')::date, $11, 'recruiting', $12)
         RETURNING id`,
        [
          businessIds[c.brand_owner],
          c.title,
          c.description,
          c.category,
          c.budget_min,
          c.budget_max,
          JSON.stringify(c.deliverables),
          c.requirements,
          c.platforms,
          c.regions,
          c.recruit_count,
          BUSINESS_SEEDS.find((b) => b.email === c.brand_owner).company_name,
        ],
      )
      campaignIds.push(res.rows[0].id)
      console.log(`campaign: ${c.title}`)
    }

    // A few demo applications
    const creatorList = Object.values(creatorIds)
    for (let i = 0; i < Math.min(10, campaignIds.length * 2); i++) {
      const campaignId = campaignIds[i % campaignIds.length]
      const creatorId = creatorList[i % creatorList.length]
      await client.query(
        `INSERT INTO campaign_applications(campaign_id, creator_id, message, proposed_budget, status)
         VALUES ($1, $2, $3, $4, 'pending')
         ON CONFLICT (campaign_id, creator_id) DO NOTHING`,
        [campaignId, creatorId, '안녕하세요! 캠페인에 꼭 맞는 콘텐츠를 만들겠습니다.', 500000 + (i * 100000)],
      )
    }
  })

  console.log('\nSeed complete.')
  console.log(`Demo password (all accounts): ${DEMO_PASSWORD}`)
  await pool.end()
}

run().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
