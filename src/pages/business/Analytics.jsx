import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'

function formatNumber(n) {
  const v = Number(n || 0)
  if (v >= 10000) return `${(v / 10000).toFixed(v >= 100000 ? 0 : 1)}만`
  return v.toLocaleString()
}

export default function BusinessAnalytics() {
  const [summary, setSummary] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    Promise.all([
      api('/api/content/analytics/summary'),
      api('/api/content'),
    ]).then(([s, p]) => { setSummary(s); setPosts(p.data || []) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    await api(`/api/content/${id}/approve`, { method: 'PATCH' })
    load()
  }

  return (
    <>
      <PageHeader title="분석 · 리포트" subtitle="크리에이터가 제출한 콘텐츠의 성과를 실시간으로 확인합니다." />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="게시물" value={formatNumber(summary?.totals?.posts)} />
              <Stat label="총 조회수" value={formatNumber(summary?.totals?.views)} />
              <Stat label="좋아요" value={formatNumber(summary?.totals?.likes)} />
              <Stat label="댓글" value={formatNumber(summary?.totals?.comments)} />
            </div>

            <div className="mt-6 grid lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2">
                <h3 className="text-[16px] font-extrabold">최근 30일 조회수 추이</h3>
                <div className="mt-4 h-[260px]">
                  <ResponsiveContainer>
                    <AreaChart data={(summary?.byDay || []).map((d) => ({ day: d.day, views: Number(d.views) }))}>
                      <defs>
                        <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5B47FB" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#5B47FB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" />
                      <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} />
                      <YAxis stroke="#9CA3AF" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="views" stroke="#5B47FB" fill="url(#vGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="text-[16px] font-extrabold">캠페인별 조회수</h3>
                <div className="mt-4 h-[260px]">
                  <ResponsiveContainer>
                    <BarChart data={(summary?.byCampaign || []).slice(0, 6).map((c) => ({ name: c.title?.slice(0, 8) || '-', views: Number(c.views) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                      <YAxis stroke="#9CA3AF" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="views" fill="#00C2A8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card className="mt-6" padded={false}>
              <div className="px-6 py-5 border-b border-[#F1F2F6] flex items-center justify-between">
                <h3 className="text-[16px] font-extrabold">제출된 콘텐츠</h3>
              </div>
              {posts.length === 0 ? (
                <div className="py-16 text-center text-[#6B7280]">제출된 콘텐츠가 없습니다.</div>
              ) : (
                <div className="divide-y divide-[#F1F2F6]">
                  {posts.map((p) => (
                    <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase text-[#5B47FB]">{p.platform}</span>
                          <Badge tone={p.approved ? 'success' : 'warn'}>{p.approved ? '승인' : '검토중'}</Badge>
                        </div>
                        <div className="mt-1 font-bold text-[14px] text-[#0B0B1A] truncate">{p.campaign_title}</div>
                        <div className="text-[11.5px] text-[#6B7280]">@{p.creator_handle} · <a href={p.post_url} target="_blank" rel="noreferrer" className="underline">{p.post_url}</a></div>
                      </div>
                      <div className="hidden md:grid grid-cols-3 gap-6 text-center">
                        <Mini label="조회" value={p.views} />
                        <Mini label="좋아요" value={p.likes} />
                        <Mini label="댓글" value={p.comments} />
                      </div>
                      {!p.approved && <Button size="sm" onClick={() => approve(p.id)}>승인</Button>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-[#EEF0F4] rounded-[18px] p-5">
      <div className="text-[12px] font-semibold text-[#6B7280]">{label}</div>
      <div className="mt-2 text-[26px] font-extrabold tracking-tight text-[#0B0B1A]">{value}</div>
    </div>
  )
}

function Mini({ label, value }) {
  return (
    <div>
      <div className="text-[10.5px] text-[#6B7280] font-semibold">{label}</div>
      <div className="text-[13.5px] font-bold text-[#0B0B1A]">{formatNumber(value)}</div>
    </div>
  )
}
