import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'

const STATUSES = [
  { k: '', label: '전체' },
  { k: 'pending', label: '대기' },
  { k: 'accepted', label: '확정' },
  { k: 'rejected', label: '거절' },
  { k: 'withdrawn', label: '철회' },
]

const TONE = { pending: 'warn', accepted: 'success', rejected: 'danger', withdrawn: 'neutral' }

export default function AdminApplications() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams(); if (status) p.set('status', status)
    api(`/api/admin/applications?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [status])

  const force = async (id, next) => {
    if (!confirm(`관리자 권한으로 상태를 "${next}"로 변경합니다. 계속할까요?`)) return
    await api(`/api/admin/applications/${id}`, { method: 'PATCH', body: { status: next } })
    load()
  }

  return (
    <>
      <PageHeader title="지원 관리" subtitle="모든 캠페인 지원 조회 · 강제 상태 변경" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card className="mb-5">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button key={s.k} onClick={() => setStatus(s.k)}
                className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${status === s.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <div className="grid grid-cols-[1.4fr_1fr_1fr_100px_240px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280]">
            <div>캠페인</div>
            <div>크리에이터</div>
            <div>브랜드</div>
            <div>상태</div>
            <div>액션</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">지원이 없습니다.</div>
          ) : rows.map((a) => (
            <div key={a.id} className="grid grid-cols-[1.4fr_1fr_1fr_100px_240px] px-5 py-3 border-b border-[#F1F2F6] items-center text-[13px]">
              <div className="font-bold text-[#0B0B1A] truncate">{a.campaign_title}</div>
              <div className="text-[#333452] truncate">{a.display_name} <span className="text-[#9CA3AF]">@{a.handle}</span></div>
              <div className="text-[#333452] truncate">{a.company_name || '-'}</div>
              <div><Badge tone={TONE[a.status]}>{a.status}</Badge></div>
              <div className="flex gap-1">
                <button onClick={() => force(a.id, 'accepted')} className="h-8 px-2.5 rounded-lg bg-[#ECFDF3] text-[#17804D] text-[11.5px] font-bold hover:bg-[#D1FADF]">확정</button>
                <button onClick={() => force(a.id, 'rejected')} className="h-8 px-2.5 rounded-lg bg-[#FFE4E4] text-[#C43434] text-[11.5px] font-bold hover:bg-[#FFD0D0]">거절</button>
                <button onClick={() => force(a.id, 'pending')} className="h-8 px-2.5 rounded-lg bg-[#FFF4DE] text-[#8A5A00] text-[11.5px] font-bold hover:bg-[#FFE8BD]">대기로</button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
