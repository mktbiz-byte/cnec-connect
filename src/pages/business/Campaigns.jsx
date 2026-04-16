import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'
import { FilePlus } from 'lucide-react'

const STATUS = [
  { k: 'all', label: '전체' },
  { k: 'recruiting', label: '모집중' },
  { k: 'in_progress', label: '진행중' },
  { k: 'completed', label: '완료' },
  { k: 'draft', label: '초안' },
]

export default function BusinessCampaigns() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams({ mine: 'true' })
    if (status !== 'all') p.set('status', status)
    api(`/api/campaigns?${p}`).then((r) => setItems(r.data || [])).finally(() => setLoading(false))
  }, [status])

  return (
    <>
      <PageHeader
        title="캠페인 관리"
        subtitle="모든 캠페인의 상태와 진행 상황을 확인하고 관리합니다."
        actions={<Button as={Link} to="/app/business/campaigns/new" leftIcon={<FilePlus size={16} />}>새 캠페인</Button>}
      />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <div className="flex flex-wrap gap-1.5 mb-6">
          {STATUS.map((s) => (
            <button
              key={s.k}
              onClick={() => setStatus(s.k)}
              className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition ${
                status === s.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB] hover:border-[#0B0B1A]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <Card className="py-16 text-center text-[#6B7280]">캠페인이 없습니다.</Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((c) => (
              <Card as={Link} to={`/app/business/campaigns/${c.id}`} key={c.id} hover padded={false} className="overflow-hidden">
                <div className="h-28 bg-gradient-to-br from-[#F3F1FF] via-white to-[#F3F1FF]" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge tone="brand">{c.category}</Badge>
                    <Badge tone={c.status === 'recruiting' ? 'success' : 'neutral'}>{c.status}</Badge>
                  </div>
                  <div className="mt-3 font-extrabold text-[15.5px] text-[#0B0B1A] line-clamp-2 h-[44px]">{c.title}</div>
                  <div className="mt-3 text-[12.5px] text-[#6B7280]">예산 {(c.budget_min || 0).toLocaleString()} ~ {(c.budget_max || 0).toLocaleString()}원</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
