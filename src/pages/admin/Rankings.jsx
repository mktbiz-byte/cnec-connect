import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'

function formatN(n) {
  const v = Number(n || 0)
  if (v >= 10000) return `${(v / 10000).toFixed(v >= 100000 ? 0 : 1)}만`
  return v.toLocaleString()
}

function currentMonth() { return new Date().toISOString().slice(0, 7) }

export default function AdminRankings() {
  const [rows, setRows] = useState([])
  const [month, setMonth] = useState(currentMonth())
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)

  const load = () => {
    setLoading(true)
    api(`/api/discovery/rankings?month=${month}`, { auth: false })
      .then((r) => setRows(r.data || []))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [month])

  const compute = async () => {
    setComputing(true)
    try {
      await api('/api/discovery/rankings/compute', { method: 'POST', body: { month } })
      load()
    } finally { setComputing(false) }
  }

  return (
    <>
      <PageHeader
        title="월별 TOP 100 랭킹"
        subtitle={`${month} 기준 크리에이터 랭킹`}
        actions={<Button onClick={compute} loading={computing} variant="soft" leftIcon={<Trophy size={14} />}>랭킹 계산</Button>}
      />
      <div className="px-6 md:px-10 py-6 max-w-[1000px] mx-auto">
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="h-11 px-4 rounded-[12px] border border-[#E5E7EB] text-[14px]" />
            <div className="text-[13px] text-[#6B7280]">랭킹 없으면 우측 "랭킹 계산" 버튼으로 생성</div>
          </div>
        </Card>

        <Card padded={false}>
          <div className="grid grid-cols-[60px_40px_2fr_120px_100px_120px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[11.5px] font-bold text-[#6B7280]">
            <div>순위</div>
            <div>변동</div>
            <div>크리에이터</div>
            <div>팔로워</div>
            <div>ER</div>
            <div>점수</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">{month}의 랭킹이 없습니다. "랭킹 계산" 버튼으로 생성하세요.</div>
          ) : rows.map((r) => {
            const diff = r.prev_rank ? r.prev_rank - r.rank : 0
            return (
              <div key={r.id} className="grid grid-cols-[60px_40px_2fr_120px_100px_120px] px-5 py-3.5 border-b border-[#F1F2F6] items-center text-[13.5px]">
                <div className="font-extrabold text-[#0B0B1A]">
                  {r.rank <= 3 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#5B47FB] text-white text-[13px] font-bold">{r.rank}</span> : r.rank}
                </div>
                <div>
                  {r.is_new ? <Badge tone="brand">NEW</Badge>
                   : diff > 0 ? <span className="text-[#17804D] text-[12px] font-bold inline-flex items-center"><TrendingUp size={12} />+{diff}</span>
                   : diff < 0 ? <span className="text-[#C43434] text-[12px] font-bold inline-flex items-center"><TrendingDown size={12} />{diff}</span>
                   : <Minus size={12} className="text-[#9CA3AF]" />}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#0B0B1A] truncate">{r.name} <span className="text-[#6B7280] font-normal">@{r.handle}</span></div>
                </div>
                <div className="font-bold text-[#0B0B1A]">{formatN(r.followers)}</div>
                <div className="text-[#5B47FB] font-bold">{Number(r.er || 0).toFixed(1)}%</div>
                <div className="text-[#6B7280]">{Number(r.score || 0).toLocaleString()}</div>
              </div>
            )
          })}
        </Card>
      </div>
    </>
  )
}
