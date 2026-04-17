import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell } from 'recharts'

function formatN(n) {
  const v = Number(n || 0)
  if (v >= 10000) return `${(v / 10000).toFixed(v >= 100000 ? 0 : 1)}만`
  return v.toLocaleString()
}

const TABS = [
  '핵심 지표', '팔로워 성장', '오디언스', '인게이지먼트',
  '콘텐츠', '광고 분석', '비용 예측', '추천 계정', '기준 안내',
]
const COLORS = ['#5B47FB', '#8270FB', '#A898FF', '#CABFFF', '#E5E0FF']

export default function AdminReport() {
  const { source, id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [meta, setMeta] = useState({})

  useEffect(() => {
    setLoading(true)
    api(`/api/discovery/reports/${source}/${id}`)
      .then((r) => { setReport(r.data); setMeta({ cached: r.cached, generatedAt: r.generatedAt }) })
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [source, id])

  if (loading) return <div className="py-24 flex justify-center"><div className="w-6 h-6 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
  if (!report) return <div className="py-24 text-center text-[#6B7280]">리포트를 생성할 수 없습니다.</div>

  const cm = report.core_metrics || {}

  return (
    <>
      <PageHeader
        title={`리포트 · ${cm.region || source}`}
        subtitle={`팔로워 ${formatN(cm.followers)} · ER ${cm.engagement_rate}% · ${meta.cached ? '캐시' : '신규 생성'} · ${meta.generatedAt ? new Date(meta.generatedAt).toLocaleString('ko-KR') : ''}`}
        actions={<Link to="/app/admin/discovery" className="text-[13px] font-semibold text-[#5B47FB]">← 검색으로</Link>}
      />
      <div className="px-6 md:px-10 py-6 max-w-[1280px] mx-auto">
        <div className="flex flex-wrap gap-1.5 mb-6">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`h-9 px-3.5 rounded-full text-[12.5px] font-semibold border transition ${tab === i ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && <TabCore r={report} />}
        {tab === 1 && <TabGrowth r={report} />}
        {tab === 2 && <TabAudience r={report} />}
        {tab === 3 && <TabEngagement r={report} />}
        {tab === 4 && <TabContent r={report} />}
        {tab === 5 && <TabAd r={report} />}
        {tab === 6 && <TabCost r={report} />}
        {tab === 7 && <TabRecommend r={report} />}
        {tab === 8 && <TabMeta r={report} />}
      </div>
    </>
  )
}

function TabCore({ r }) {
  const cm = r.core_metrics || {}
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <StatCard label="팔로워" value={formatN(cm.followers)} />
      <StatCard label="참여율" value={`${cm.engagement_rate || 0}%`} />
      <StatCard label="예상 평균 도달" value={formatN(cm.avg_reach)} />
      <StatCard label="업로드 주기" value={cm.upload_cadence_estimate || '-'} />
      <StatCard label="인증 배지" value={cm.verified ? '있음' : '없음'} />
      <StatCard label="지역" value={cm.region || '-'} />
    </div>
  )
}

function TabGrowth({ r }) {
  return (
    <Card>
      <h3 className="text-[16px] font-extrabold">최근 12개월 팔로워 성장 추이</h3>
      <p className="mt-1 text-[12px] text-[#6B7280]">역산 추정치 (실제 수집 데이터 연동 시 대체됩니다)</p>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer>
          <AreaChart data={r.growth || []}>
            <defs><linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B47FB" stopOpacity={0.4} /><stop offset="95%" stopColor="#5B47FB" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" />
            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={formatN} />
            <Tooltip formatter={(v) => formatN(v)} />
            <Area type="monotone" dataKey="followers" stroke="#5B47FB" fill="url(#gGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function TabAudience({ r }) {
  const aud = r.audience || {}
  const genderData = aud.gender ? Object.entries(aud.gender).map(([k, v]) => ({ name: k === 'female' ? '여성' : '남성', value: Math.round(v * 100) })) : []
  const ageData = aud.age ? Object.entries(aud.age).map(([k, v]) => ({ name: k, value: Math.round(v * 100) })) : []
  const countryData = aud.country ? Object.entries(aud.country).map(([k, v]) => ({ name: k, value: Math.round(v * 100) })) : []

  return (
    <div className="grid md:grid-cols-3 gap-5">
      <Card><h3 className="text-[16px] font-extrabold mb-4">성별 분포</h3>
        <div className="h-[200px]"><ResponsiveContainer><PieChart><Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
          {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie></PieChart></ResponsiveContainer></div>
      </Card>
      <Card><h3 className="text-[16px] font-extrabold mb-4">연령대</h3>
        <div className="h-[200px]"><ResponsiveContainer><BarChart data={ageData}><XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} /><YAxis stroke="#9CA3AF" fontSize={11} /><Tooltip /><Bar dataKey="value" fill="#5B47FB" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card>
      <Card><h3 className="text-[16px] font-extrabold mb-4">국가</h3>
        <div className="h-[200px]"><ResponsiveContainer><PieChart><Pie data={countryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
          {countryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie></PieChart></ResponsiveContainer></div>
      </Card>
    </div>
  )
}

function TabEngagement({ r }) {
  const e = r.engagement || {}
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <StatCard label="평균 좋아요" value={formatN(e.avg_likes)} />
      <StatCard label="평균 댓글" value={formatN(e.avg_comments)} />
      <StatCard label="좋아요 비율" value={`${Math.round((e.like_ratio || 0) * 100)}%`} />
      <StatCard label="댓글 비율" value={`${Math.round((e.comment_ratio || 0) * 100)}%`} />
    </div>
  )
}

function TabContent({ r }) {
  const c = r.content || {}
  return (
    <Card>
      <h3 className="text-[16px] font-extrabold">콘텐츠 분석</h3>
      <div className="mt-4 grid md:grid-cols-3 gap-6">
        <div><div className="text-[12px] font-bold text-[#6B7280] mb-2">주요 해시태그</div>
          <div className="flex flex-wrap gap-2">{(c.top_hashtags || []).map((h) => <span key={h} className="h-8 px-3 rounded-full bg-[#F3F1FF] text-[#4733D6] text-[12.5px] font-bold inline-flex items-center">{h}</span>)}</div>
        </div>
        <div><div className="text-[12px] font-bold text-[#6B7280] mb-2">톤</div><div className="font-bold text-[#0B0B1A]">{c.tone || '-'}</div></div>
        <div><div className="text-[12px] font-bold text-[#6B7280] mb-2">포맷</div><div className="flex flex-wrap gap-1.5">{(c.formats || []).map((f) => <Badge key={f} tone="neutral">{f}</Badge>)}</div></div>
      </div>
    </Card>
  )
}

function TabAd({ r }) {
  const ad = r.ad_analysis || {}
  return (
    <Card>
      <h3 className="text-[16px] font-extrabold">광고 콘텐츠 분석</h3>
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <StatCard label="광고 비율" value={`${Math.round((ad.ad_ratio || 0) * 100)}%`} />
        <div><div className="text-[12px] font-bold text-[#6B7280] mb-2">협업 추정 브랜드</div>
          {(ad.top_brands || []).length === 0 ? <div className="text-[#6B7280] text-[13px]">수집 데이터 대기 중</div> :
           ad.top_brands.map((b) => <Badge key={b} tone="brand">{b}</Badge>)}
        </div>
      </div>
      <p className="mt-4 text-[12px] text-[#9CA3AF]">공식 API 데이터 연동 시 개별 광고 성과·댓글 반응이 추가됩니다.</p>
    </Card>
  )
}

function TabCost({ r }) {
  const c = r.cost_forecast || {}
  return (
    <Card>
      <h3 className="text-[16px] font-extrabold">비용 및 성과 예측</h3>
      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <StatCard label="예상 최소 광고비" value={`₩${Number(c.price_low || 0).toLocaleString()}`} />
        <StatCard label="예상 중간값" value={`₩${Number(c.price_mid || 0).toLocaleString()}`} />
        <StatCard label="예상 최대 광고비" value={`₩${Number(c.price_high || 0).toLocaleString()}`} />
        <StatCard label="예상 CPR" value={c.cpr != null ? `${c.cpr}원/도달` : '데이터 부족'} />
      </div>
      <p className="mt-4 text-[12.5px] text-[#6B7280]">{c.note || ''}</p>
      <p className="mt-1 text-[11px] text-[#9CA3AF]">이 수치는 추정치이며 실제 계약 조건과 다를 수 있습니다.</p>
    </Card>
  )
}

function TabRecommend({ r }) {
  return (
    <Card>
      <h3 className="text-[16px] font-extrabold">맞춤 추천 계정</h3>
      {(r.recommendations || []).length === 0 ? (
        <div className="mt-4 text-[13px] text-[#6B7280]">동일 카테고리 추천 데이터가 아직 부족합니다.</div>
      ) : (
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {r.recommendations.map((c) => (
            <Link key={c.id} to={`/app/admin/discovery/reports/registered/${c.id}`}
              className="p-4 rounded-xl border border-[#E7E8EE] hover:border-[#0B0B1A] transition">
              <div className="font-bold text-[#0B0B1A]">{c.name}</div>
              <div className="text-[12px] text-[#6B7280]">@{c.handle} · {formatN(c.followers)}팔로워 · ER {Number(c.er || 0).toFixed(1)}%</div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}

function TabMeta({ r }) {
  const m = r.meta || {}
  return (
    <Card>
      <h3 className="text-[16px] font-extrabold">데이터 기준 안내</h3>
      <dl className="mt-4 grid md:grid-cols-2 gap-3 text-[14px]">
        <div><dt className="text-[#6B7280] text-[12px] font-semibold">소스</dt><dd className="font-bold text-[#0B0B1A]">{m.source || '-'}</dd></div>
        <div><dt className="text-[#6B7280] text-[12px] font-semibold">샘플 수</dt><dd className="font-bold text-[#0B0B1A]">{m.sample_count || 0}건</dd></div>
        <div><dt className="text-[#6B7280] text-[12px] font-semibold">최근 수집일</dt><dd className="font-bold text-[#0B0B1A]">{m.last_collected_at ? new Date(m.last_collected_at).toLocaleDateString('ko-KR') : '미수집'}</dd></div>
        <div><dt className="text-[#6B7280] text-[12px] font-semibold">리포트 생성일</dt><dd className="font-bold text-[#0B0B1A]">{m.generated_at ? new Date(m.generated_at).toLocaleString('ko-KR') : '-'}</dd></div>
        <div><dt className="text-[#6B7280] text-[12px] font-semibold">신뢰도</dt><dd><Badge tone={m.confidence === 'high' ? 'success' : 'warn'}>{m.confidence || 'low'}</Badge></dd></div>
        <div><dt className="text-[#6B7280] text-[12px] font-semibold">캐시 TTL</dt><dd className="font-bold text-[#0B0B1A]">{REPORT_TTL_DAYS || 7}일</dd></div>
      </dl>
      <p className="mt-6 text-[12px] text-[#9CA3AF]">
        오디언스 성별·나이·국가는 추정 기반입니다. Instagram Graph API 또는 Business Suite 연동 시 실측치로 대체됩니다.
        비용 예측은 카테고리×팔로워×ER 회귀 산식 기반이며, 실제 계약가와 차이가 있을 수 있습니다.
      </p>
    </Card>
  )
}

const REPORT_TTL_DAYS = 7

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#E7E8EE] rounded-[18px] p-5">
      <div className="text-[12px] font-semibold text-[#6B7280]">{label}</div>
      <div className="mt-2 text-[22px] font-extrabold text-[#0B0B1A] tracking-tight">{value}</div>
    </div>
  )
}
