import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { Search, Trash2 } from 'lucide-react'

const STATUSES = ['draft', 'recruiting', 'in_progress', 'completed', 'closed']

export default function AdminCampaigns() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (q) p.set('q', q); if (status) p.set('status', status)
    api(`/api/admin/campaigns?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [q, status])

  const setCampaignStatus = async (id, newStatus) => {
    if (!confirm(`상태를 "${newStatus}"로 변경하시겠습니까?`)) return
    await api(`/api/admin/campaigns/${id}/status`, { method: 'PATCH', body: { status: newStatus } })
    load()
  }
  const del = async (id) => {
    if (!confirm('이 캠페인을 영구 삭제하시겠습니까? 연결된 지원·결제 전부 삭제됩니다.')) return
    await api(`/api/admin/campaigns/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <PageHeader title="캠페인 관리" subtitle="모든 브랜드 캠페인 조회·상태 변경·삭제" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card className="mb-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1"><Input leftAddon={<Search size={16} />} placeholder="캠페인·브랜드 검색" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setStatus('')} className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${status === '' ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>전체</button>
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${status === s ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card padded={false}>
          <div className="grid grid-cols-[1.4fr_1fr_110px_110px_90px_160px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280]">
            <div>캠페인</div>
            <div>브랜드</div>
            <div>카테고리</div>
            <div>상태</div>
            <div>지원자</div>
            <div>액션</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.map((c) => (
            <div key={c.id} className="grid grid-cols-[1.4fr_1fr_110px_110px_90px_160px] px-5 py-3 border-b border-[#F1F2F6] items-center text-[13px]">
              <div className="font-bold text-[#0B0B1A] truncate">{c.title}</div>
              <div className="text-[#333452] truncate">{c.company_name}</div>
              <div className="text-[#6B7280]">{c.category}</div>
              <div><Badge tone={c.status === 'recruiting' ? 'success' : 'neutral'}>{c.status}</Badge></div>
              <div className="text-[#0B0B1A] font-bold">{c.app_count}</div>
              <div className="flex gap-1">
                <select
                  value={c.status}
                  onChange={(e) => setCampaignStatus(c.id, e.target.value)}
                  className="h-8 px-2 rounded-lg bg-white border border-[#E5E7EB] text-[11.5px]"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => del(c.id)} title="삭제" className="h-8 w-8 rounded-lg bg-[#FFE4E4] text-[#C43434] inline-flex items-center justify-center">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
