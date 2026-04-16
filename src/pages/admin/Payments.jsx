import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'

const STATUS_LABEL = { pending: '대기', paid: '에스크로', released: '정산 완료', refunded: '환불', failed: '실패' }
const STATUS_TONE = { pending: 'warn', paid: 'brand', released: 'success', refunded: 'neutral', failed: 'danger' }

export default function AdminPayments() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api('/api/admin/payments').then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="결제 관리" subtitle="플랫폼 전체 에스크로·정산 내역" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card padded={false}>
          <div className="grid grid-cols-[1fr_1fr_1fr_120px_120px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280]">
            <div>캠페인</div>
            <div>브랜드</div>
            <div>크리에이터</div>
            <div>금액</div>
            <div>상태</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_1fr_1fr_120px_120px] px-5 py-3.5 border-b border-[#F1F2F6] items-center text-[13.5px]">
              <div className="font-bold text-[#0B0B1A] truncate">{p.campaign_title}</div>
              <div className="text-[#333452] truncate">{p.company_name || '-'}</div>
              <div className="text-[#333452] truncate">{p.creator_name || '-'}</div>
              <div className="text-[#0B0B1A] font-bold">₩{Number(p.amount).toLocaleString()}</div>
              <div><Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge></div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
