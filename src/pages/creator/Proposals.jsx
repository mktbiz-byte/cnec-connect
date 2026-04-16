import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Check, X, Send } from 'lucide-react'

const TONE = { sent: 'brand', accepted: 'success', declined: 'neutral', cancelled: 'neutral', expired: 'neutral' }
const LABEL = { sent: '새 제안', accepted: '수락함', declined: '거절함', cancelled: '취소됨', expired: '만료' }

export default function CreatorProposals() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    api('/api/discovery/proposals/inbox').then((r) => setRows(r.data || [])).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const respond = async (id, status) => {
    const message = status === 'accepted' ? prompt('수락 메시지 (선택)', '제안에 감사드립니다. 함께하고 싶습니다.') : prompt('거절 사유 (선택)', '')
    if (message === null) return
    await api(`/api/discovery/proposals/${id}/respond`, { method: 'PATCH', body: { status, message } })
    load()
  }

  return (
    <>
      <PageHeader title="받은 제안" subtitle="브랜드·관리자로부터 받은 캠페인 제안" />
      <div className="px-6 md:px-10 py-8 max-w-[980px] mx-auto">
        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <Card className="py-16 text-center text-[#6B7280]">받은 제안이 없습니다.</Card>
        ) : (
          <div className="space-y-3">
            {rows.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Send size={13} className="text-[#5B47FB]" />
                      <span className="text-[11.5px] font-bold text-[#6B7280]">{p.company_name || p.from_email || '브랜드'}</span>
                      <Badge tone={TONE[p.status]}>{LABEL[p.status]}</Badge>
                      <span className="text-[11.5px] text-[#6B7280]">{new Date(p.created_at).toLocaleString('ko-KR')}</span>
                    </div>
                    <h3 className="mt-2 text-[16px] font-extrabold text-[#0B0B1A]">{p.subject || '캠페인 제안'}</h3>
                    {p.campaign_title && (
                      <div className="mt-1 text-[13px] text-[#4733D6]">
                        캠페인: {p.campaign_title}
                        {(p.budget_min || p.budget_max) && <span className="ml-2 text-[#6B7280]">· 예산 ₩{Number(p.budget_min || 0).toLocaleString()} ~ ₩{Number(p.budget_max || 0).toLocaleString()}</span>}
                      </div>
                    )}
                    <p className="mt-3 text-[13.5px] text-[#333452] whitespace-pre-wrap leading-relaxed">{p.body}</p>
                    {p.proposed_budget && <div className="mt-2 text-[13px] font-bold text-[#0B0B1A]">제안 예산: ₩{p.proposed_budget.toLocaleString()}</div>}
                  </div>
                  {p.status === 'sent' && (
                    <div className="flex flex-col gap-2">
                      <Button size="sm" leftIcon={<Check size={13} />} onClick={() => respond(p.id, 'accepted')}>수락</Button>
                      <Button size="sm" variant="outline" leftIcon={<X size={13} />} onClick={() => respond(p.id, 'declined')}>거절</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
