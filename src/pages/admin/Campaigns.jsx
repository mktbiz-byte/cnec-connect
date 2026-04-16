import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'

export default function AdminCampaigns() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api('/api/admin/campaigns').then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="캠페인 관리" subtitle="모든 브랜드의 캠페인 현황" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card padded={false}>
          <div className="grid grid-cols-[1.4fr_1fr_120px_120px_90px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280]">
            <div>캠페인</div>
            <div>브랜드</div>
            <div>카테고리</div>
            <div>상태</div>
            <div>지원자</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.map((c) => (
            <div key={c.id} className="grid grid-cols-[1.4fr_1fr_120px_120px_90px] px-5 py-3.5 border-b border-[#F1F2F6] items-center text-[13.5px]">
              <div className="font-bold text-[#0B0B1A] truncate">{c.title}</div>
              <div className="text-[#333452] truncate">{c.company_name}</div>
              <div className="text-[#6B7280]">{c.category}</div>
              <div><Badge tone={c.status === 'recruiting' ? 'success' : 'neutral'}>{c.status}</Badge></div>
              <div className="text-[#0B0B1A] font-bold">{c.app_count}</div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
