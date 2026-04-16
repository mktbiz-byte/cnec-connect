import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'

const TONE = { draft: 'neutral', sent: 'brand', accepted: 'success', declined: 'danger', expired: 'neutral', cancelled: 'neutral' }
const LABEL = { draft: '초안', sent: '발송됨', accepted: '수락', declined: '거절', expired: '만료', cancelled: '취소됨' }
const STATUSES = ['', 'sent', 'accepted', 'declined', 'cancelled']

export default function AdminProposals() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams(); if (status) p.set('status', status)
    api(`/api/discovery/proposals/sent?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [status])

  const cancel = async (id) => {
    if (!confirm('제안을 취소할까요?')) return
    await api(`/api/discovery/proposals/${id}/cancel`, { method: 'POST' })
    load()
  }

  return (
    <>
      <PageHeader title="제안 관리" subtitle="크리에이터에게 보낸 제안 내역 · 수락률 · 활성화 현황" />
      <div className="px-6 md:px-10 py-6 max-w-[1280px] mx-auto">
        <Card className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setStatus('')} className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${status === '' ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>전체</button>
            {STATUSES.filter(Boolean).map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${status === s ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                {LABEL[s]}
              </button>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <div className="grid grid-cols-[1.2fr_1fr_1fr_110px_110px_130px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[11.5px] font-bold text-[#6B7280]">
            <div>대상</div>
            <div>캠페인</div>
            <div>메시지</div>
            <div>예산 제안</div>
            <div>상태</div>
            <div>액션</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">발송한 제안이 없습니다.</div>
          ) : rows.map((p) => (
            <div key={p.id} className="grid grid-cols-[1.2fr_1fr_1fr_110px_110px_130px] px-5 py-3.5 border-b border-[#F1F2F6] items-center text-[13px]">
              <div className="min-w-0">
                <div className="font-bold text-[#0B0B1A] truncate">
                  {p.creator_name || p.imported_name || p.handle || p.imported_handle}
                  {p.creator_user_id ? <Badge tone="success" className="ml-2">가입</Badge> : <Badge tone="brand" className="ml-2">임포트</Badge>}
                </div>
                <div className="text-[11.5px] text-[#6B7280] truncate">@{p.handle || p.imported_handle} · {p.imported_email || '-'}</div>
              </div>
              <div className="text-[#333452] truncate">{p.campaign_title || '-'}</div>
              <div className="text-[#6B7280] truncate">{p.body?.slice(0, 60)}{p.body?.length > 60 ? '...' : ''}</div>
              <div className="font-semibold text-[#0B0B1A]">{p.proposed_budget ? `₩${p.proposed_budget.toLocaleString()}` : '-'}</div>
              <div><Badge tone={TONE[p.status]}>{LABEL[p.status]}</Badge></div>
              <div>
                {p.status === 'sent' && (
                  <button onClick={() => cancel(p.id)} className="h-8 px-2.5 rounded-lg bg-[#FFE4E4] text-[#C43434] text-[11.5px] font-bold">제안 취소</button>
                )}
                {p.status === 'accepted' && p.campaign_id && (
                  <a href={`/app/business/campaigns/${p.campaign_id}`} className="h-8 px-2.5 rounded-lg bg-[#ECFDF3] text-[#17804D] text-[11.5px] font-bold inline-flex items-center">캠페인 보기</a>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
