import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'

const STATUS_LABEL = { pending: '대기', paid: '에스크로', released: '정산 완료', refunded: '환불', failed: '실패' }
const STATUS_TONE = { pending: 'warn', paid: 'brand', released: 'success', refunded: 'neutral', failed: 'danger' }

const FILTERS = [
  { k: '', label: '전체' },
  { k: 'paid', label: '에스크로' },
  { k: 'released', label: '정산 완료' },
  { k: 'refunded', label: '환불' },
  { k: 'failed', label: '실패' },
]

export default function AdminPayments() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams(); if (status) p.set('status', status)
    api(`/api/admin/payments?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [status])

  const release = async (id) => {
    if (!confirm('관리자 권한으로 정산을 실행합니다. 계속할까요?')) return
    await api(`/api/admin/payments/${id}/release`, { method: 'POST' })
    load()
  }
  const refund = async (id) => {
    const reason = prompt('환불 사유 (선택):', '')
    if (reason === null) return
    await api(`/api/admin/payments/${id}/refund`, { method: 'POST', body: { reason } })
    load()
  }

  return (
    <>
      <PageHeader title="결제 관리" subtitle="전체 에스크로·정산 내역 · 강제 릴리즈 / 환불" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card className="mb-5">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((s) => (
              <button key={s.k} onClick={() => setStatus(s.k)}
                className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${status === s.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <div className="grid grid-cols-[1.2fr_1fr_1fr_110px_110px_200px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280]">
            <div>캠페인</div>
            <div>브랜드</div>
            <div>크리에이터</div>
            <div>금액</div>
            <div>상태</div>
            <div>액션</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.map((p) => (
            <div key={p.id} className="grid grid-cols-[1.2fr_1fr_1fr_110px_110px_200px] px-5 py-3 border-b border-[#F1F2F6] items-center text-[13px]">
              <div className="font-bold text-[#0B0B1A] truncate">{p.campaign_title}</div>
              <div className="text-[#333452] truncate">{p.company_name || '-'}</div>
              <div className="text-[#333452] truncate">{p.creator_name || '-'}</div>
              <div className="text-[#0B0B1A] font-bold">₩{Number(p.amount).toLocaleString()}</div>
              <div><Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge></div>
              <div className="flex gap-1">
                {p.status === 'paid' && (
                  <button onClick={() => release(p.id)} className="h-8 px-2.5 rounded-lg bg-[#ECFDF3] text-[#17804D] text-[11.5px] font-bold">정산 실행</button>
                )}
                {(p.status === 'paid' || p.status === 'pending') && (
                  <button onClick={() => refund(p.id)} className="h-8 px-2.5 rounded-lg bg-[#FFE4E4] text-[#C43434] text-[11.5px] font-bold">환불</button>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
