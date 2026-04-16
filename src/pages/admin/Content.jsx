import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'
import { Check, X, Trash2, ExternalLink } from 'lucide-react'

const FILTERS = [
  { k: '', label: '전체' },
  { k: 'false', label: '대기' },
  { k: 'true', label: '승인됨' },
]

export default function AdminContent() {
  const [rows, setRows] = useState([])
  const [approved, setApproved] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams(); if (approved) p.set('approved', approved)
    api(`/api/admin/content?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [approved])

  const moderate = async (id, approve) => {
    await api(`/api/admin/content/${id}`, { method: 'PATCH', body: { approved: approve } })
    load()
  }
  const del = async (id) => {
    if (!confirm('콘텐츠를 삭제할까요?')) return
    await api(`/api/admin/content/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <PageHeader title="콘텐츠 모더레이션" subtitle="크리에이터가 제출한 게시물 승인·반려·삭제" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card className="mb-5">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((s) => (
              <button key={s.k} onClick={() => setApproved(s.k)}
                className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${approved === s.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </Card>

        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <Card className="py-16 text-center text-[#6B7280]">콘텐츠가 없습니다.</Card>
        ) : (
          <div className="space-y-3">
            {rows.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase text-[#5B47FB]">{p.platform}</span>
                      <Badge tone={p.approved ? 'success' : 'warn'}>{p.approved ? '승인' : '대기'}</Badge>
                      <span className="text-[11.5px] text-[#6B7280]">{new Date(p.created_at).toLocaleString('ko-KR')}</span>
                    </div>
                    <div className="mt-1.5 font-bold text-[14.5px] text-[#0B0B1A] truncate">{p.campaign_title}</div>
                    <div className="text-[12.5px] text-[#6B7280] truncate">@{p.creator_handle} ({p.creator_name}) · 브랜드: {p.company_name}</div>
                    <a href={p.post_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[12px] text-[#5B47FB] break-all">
                      <ExternalLink size={11} /> {p.post_url}
                    </a>
                    <div className="mt-2 grid grid-cols-4 gap-3 text-[11.5px] text-[#6B7280] max-w-md">
                      <span>조회 <b className="text-[#0B0B1A]">{(p.views || 0).toLocaleString()}</b></span>
                      <span>좋아요 <b className="text-[#0B0B1A]">{(p.likes || 0).toLocaleString()}</b></span>
                      <span>댓글 <b className="text-[#0B0B1A]">{(p.comments || 0).toLocaleString()}</b></span>
                      <span>공유 <b className="text-[#0B0B1A]">{(p.shares || 0).toLocaleString()}</b></span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {!p.approved && (
                      <button onClick={() => moderate(p.id, true)} className="h-9 px-3 rounded-lg bg-[#ECFDF3] text-[#17804D] text-[12px] font-bold inline-flex items-center gap-1">
                        <Check size={13} /> 승인
                      </button>
                    )}
                    {p.approved && (
                      <button onClick={() => moderate(p.id, false)} className="h-9 px-3 rounded-lg bg-[#FFF4DE] text-[#8A5A00] text-[12px] font-bold inline-flex items-center gap-1">
                        <X size={13} /> 반려
                      </button>
                    )}
                    <button onClick={() => del(p.id)} className="h-9 w-9 rounded-lg bg-[#FFE4E4] text-[#C43434] inline-flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
