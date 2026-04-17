import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { MessageCircle, Check, X, Copy, ExternalLink } from 'lucide-react'

const STATUSES = [
  { k: '', label: '전체' },
  { k: 'ready', label: '발송 대기' },
  { k: 'sent_manual', label: '수동 발송됨' },
  { k: 'failed', label: '실패' },
  { k: 'cancelled', label: '취소' },
]
const TONE = { draft: 'neutral', ready: 'brand', sent_manual: 'success', failed: 'danger', cancelled: 'neutral' }

export default function AdminDMQueue() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams(); if (status) p.set('status', status)
    api(`/api/discovery/dm/queue?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [status])

  const markSent = async (id) => {
    await api(`/api/discovery/dm/queue/${id}/status`, { method: 'PATCH', body: { status: 'sent_manual', note: '수동 발송 완료' } })
    load()
  }
  const cancel = async (id) => {
    await api(`/api/discovery/dm/queue/${id}/status`, { method: 'PATCH', body: { status: 'cancelled' } })
    load()
  }
  const copyMessage = (msg) => {
    navigator.clipboard?.writeText(msg)
    alert('메시지가 클립보드에 복사되었습니다. 인스타/X 앱에서 직접 붙여넣으세요.')
  }

  const readyCount = rows.filter((r) => r.status === 'ready').length

  return (
    <>
      <PageHeader
        title="DM 발송 큐"
        subtitle="인스타그램/X DM 수동 보조 발송 · 자동 발송은 TOS 리스크로 수동 모드 운영"
      />
      <div className="px-6 md:px-10 py-6 max-w-[1280px] mx-auto">
        <div className="mb-4 p-4 rounded-xl bg-[#FFF4DE] border border-[#FFE8BD] text-[13px] text-[#8A5A00]">
          <b>수동 보조 모드</b> — Instagram/X는 자동 DM 발송을 금지합니다.
          이 큐는 메시지를 미리 작성·복사해두고, 관리자가 직접 앱에서 붙여넣어 발송한 뒤 "발송 완료"로 표시하는 워크플로우입니다.
        </div>

        <Card className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <button key={s.k} onClick={() => setStatus(s.k)}
                className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${status === s.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                {s.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className="text-[13px] text-[#6B7280]">대기 <b className="text-[#0B0B1A]">{readyCount}</b>건</div>
          </div>
        </Card>

        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <Card className="py-16 text-center text-[#6B7280]">큐가 비어있습니다. Discovery 검색에서 DM 큐를 등록하세요.</Card>
        ) : (
          <div className="space-y-3">
            {rows.map((d) => (
              <Card key={d.id}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B47FB] text-white flex items-center justify-center font-bold shrink-0">
                    <MessageCircle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#0B0B1A]">@{d.handle}</span>
                      <span className="text-[11px] font-bold uppercase text-[#4733D6] bg-[#F3F1FF] px-1.5 rounded">{d.platform}</span>
                      <Badge tone={TONE[d.status]}>{d.status}</Badge>
                      {d.campaign_title && <span className="text-[11.5px] text-[#6B7280]">캠페인: {d.campaign_title}</span>}
                    </div>
                    <div className="mt-2 p-3 rounded-xl bg-[#FAFAFB] text-[13px] text-[#333452] whitespace-pre-wrap">{d.message}</div>
                    <div className="mt-1 text-[11px] text-[#9CA3AF]">{new Date(d.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {d.status === 'ready' && (
                      <>
                        <Button size="sm" variant="outline" leftIcon={<Copy size={12} />} onClick={() => copyMessage(d.message)}>
                          복사
                        </Button>
                        <a href={`https://instagram.com/${d.handle}`} target="_blank" rel="noreferrer"
                          className="h-9 px-3 rounded-lg bg-[#F3F4F6] text-[#333452] text-[12px] font-bold inline-flex items-center gap-1">
                          <ExternalLink size={12} /> 프로필
                        </a>
                        <Button size="sm" leftIcon={<Check size={12} />} onClick={() => markSent(d.id)}>
                          발송 완료
                        </Button>
                        <Button size="sm" variant="outline" leftIcon={<X size={12} />} onClick={() => cancel(d.id)}>
                          취소
                        </Button>
                      </>
                    )}
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
