import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

const STATUS_LABEL = { pending: '대기', paid: '에스크로 보관', released: '정산 완료', refunded: '환불', failed: '실패' }
const STATUS_TONE = { pending: 'warn', paid: 'brand', released: 'success', refunded: 'neutral', failed: 'danger' }

function formatMoney(n) { return `₩${Number(n || 0).toLocaleString()}` }

export default function BusinessPayments() {
  const [rows, setRows] = useState([])
  const [provider, setProvider] = useState('mock')
  const [loading, setLoading] = useState(true)

  const load = () =>
    api('/api/payments/mine')
      .then((r) => { setRows(r.data || []); setProvider(r.provider || 'mock') })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const release = async (id) => {
    if (!confirm('작업 완료를 확인하고 크리에이터에게 정산을 진행합니다. 계속할까요?')) return
    await api(`/api/payments/${id}/release`, { method: 'POST' })
    load()
  }

  const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0)
  const held = rows.filter((r) => r.status === 'paid').reduce((s, r) => s + Number(r.amount || 0), 0)
  const released = rows.filter((r) => r.status === 'released').reduce((s, r) => s + Number(r.amount || 0), 0)

  return (
    <>
      <PageHeader
        title="결제 · 정산"
        subtitle={`에스크로 결제와 정산 내역 · 현재 결제 수단: ${provider.toUpperCase()}`}
      />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          <Stat label="총 결제 금액" value={formatMoney(total)} tone="bg-[#F2EFFF] text-[#4735D1]" />
          <Stat label="에스크로 보관" value={formatMoney(held)} tone="bg-[#FFF4DE] text-[#8A5A00]" />
          <Stat label="정산 완료" value={formatMoney(released)} tone="bg-[#DEFFE5] text-[#0E7A3C]" />
        </div>

        <Card className="mt-8" padded={false}>
          <div className="px-6 py-5 border-b border-[#F1F2F6]"><h3 className="text-[16px] font-extrabold">결제 내역</h3></div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">결제 내역이 없습니다. 지원자를 확정한 후 결제를 진행하세요.</div>
          ) : (
            <div className="divide-y divide-[#F1F2F6]">
              {rows.map((r) => (
                <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] text-[#0B0B1A] truncate">{r.campaign_title}</div>
                    <div className="text-[12px] text-[#6B7280]">
                      크리에이터: {r.creator_name ? `${r.creator_name} (@${r.creator_handle})` : '-'} · {new Date(r.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-[14.5px] font-extrabold text-[#0B0B1A]">{formatMoney(r.amount)}</div>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  {r.status === 'paid' && (
                    <Button size="sm" onClick={() => release(r.id)}>정산 진행</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className="bg-white border border-[#EEF0F4] rounded-[18px] p-5">
      <div className={`inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-bold ${tone}`}>{label}</div>
      <div className="mt-3 text-[28px] font-extrabold text-[#0B0B1A] tracking-tight">{value}</div>
    </div>
  )
}
