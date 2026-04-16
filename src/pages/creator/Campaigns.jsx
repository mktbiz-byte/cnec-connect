import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { Search } from 'lucide-react'

const CATEGORIES = ['전체', '뷰티', '패션', '음식', '여행', '운동', 'IT', '육아', '반려동물']

function formatMoney(n) { return `${(n || 0).toLocaleString()}원` }

export default function CreatorCampaigns() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('전체')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams({ status: 'recruiting' })
    if (category && category !== '전체') p.set('category', category)
    api(`/api/campaigns?${p}`, { auth: false }).then((r) => setItems(r.data || [])).finally(() => setLoading(false))
  }, [category])

  const filtered = useMemo(() => {
    if (!q) return items
    const k = q.toLowerCase()
    return items.filter((c) => c.title?.toLowerCase().includes(k) || c.company_name?.toLowerCase().includes(k))
  }, [items, q])

  return (
    <>
      <PageHeader title="캠페인 탐색" subtitle="나에게 맞는 캠페인을 찾아 지원해보세요." />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <div className="bg-white rounded-[18px] border border-[#EEF0F4] p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <Input leftAddon={<Search size={16} />} placeholder="캠페인 또는 브랜드 검색" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${
                  category === c ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB] hover:border-[#0B0B1A]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Card as={Link} to={`/campaigns/${c.id}`} key={c.id} hover padded={false} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-[#F2EFFF] via-white to-[#DEFFF8]" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge tone="brand">{c.category}</Badge>
                    <Badge tone="success">모집중</Badge>
                  </div>
                  <div className="mt-3 font-extrabold text-[15.5px] text-[#0B0B1A] line-clamp-2 h-[44px]">{c.title}</div>
                  <div className="mt-1 text-[12.5px] text-[#6B7280]">{c.company_name}</div>
                  <div className="mt-4 pt-3 border-t border-[#F1F2F6] flex items-center justify-between">
                    <span className="text-[12.5px] text-[#6B7280]">예산</span>
                    <span className="text-[13px] font-bold text-[#0B0B1A]">{formatMoney(c.budget_min)} ~ {formatMoney(c.budget_max)}</span>
                  </div>
                </div>
              </Card>
            ))}
            {filtered.length === 0 && <div className="text-[#6B7280] col-span-full py-16 text-center">조건에 맞는 캠페인이 없습니다.</div>}
          </div>
        )}
      </div>
    </>
  )
}
