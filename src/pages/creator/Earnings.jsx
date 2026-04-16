import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'

const STATUS_LABEL = { pending: '대기', paid: '에스크로 보관', released: '정산 완료', refunded: '환불', failed: '실패' }
const STATUS_TONE = { pending: 'warn', paid: 'brand', released: 'success', refunded: 'neutral', failed: 'danger' }

function formatMoney(n) { return `₩${Number(n || 0).toLocaleString()}` }

export default function CreatorEarnings() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/payments/earnings').then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }, [])

  const pending = rows.filter((r) => r.status === 'paid').reduce((s, r) => s + Number(r.amount || 0), 0)
  const released = rows.filter((r) => r.status === 'released').reduce((s, r) => s + Number(r.amount || 0), 0)

  return (
    <>
      <PageHeader title="수익 · 정산" subtitle="에스크로로 보호되는 안전한 정산 내역" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#5B47FB] to-[#00C2A8] text-white rounded-[18px] p-6">
            <div className="text-[12px] font-semibold text-white/80">정산 완료</div>
            <div className="mt-2 text-[32px] font-extrabold tracking-tight">{formatMoney(released)}</div>
          </div>
          <div className="bg-white border border-[#EEF0F4] rounded-[18px] p-6">
            <div className="text-[12px] font-semibold text-[#6B7280]">에스크로 보관 중</div>
            <div className="mt-2 text-[32px] font-extrabold tracking-tight text-[#0B0B1A]">{formatMoney(pending)}</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">브랜드가 작업 완료를 확인하면 정산됩니다.</div>
          </div>
        </div>

        <Card className="mt-8" padded={false}>
          <div className="px-6 py-5 border-b border-[#F1F2F6]"><h3 className="text-[16px] font-extrabold">정산 내역</h3></div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">정산 내역이 없습니다.</div>
          ) : (
            <div className="divide-y divide-[#F1F2F6]">
              {rows.map((r) => (
                <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] text-[#0B0B1A] truncate">{r.campaign_title}</div>
                    <div className="text-[12px] text-[#6B7280]">{r.company_name} · {new Date(r.created_at).toLocaleDateString('ko-KR')}</div>
                  </div>
                  <div className="text-[14.5px] font-extrabold text-[#0B0B1A]">{formatMoney(r.amount)}</div>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
