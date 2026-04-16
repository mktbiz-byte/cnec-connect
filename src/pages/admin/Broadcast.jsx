import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Send } from 'lucide-react'

const TARGETS = [
  { k: 'all', label: '전체 사용자' },
  { k: 'creator', label: '크리에이터만' },
  { k: 'business', label: '브랜드만' },
]

export default function AdminBroadcast() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [link, setLink] = useState('')
  const [target, setTarget] = useState('all')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const send = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    if (!confirm(`"${TARGETS.find((t) => t.k === target).label}"에게 알림을 발송합니다. 계속할까요?`)) return
    setSending(true)
    setError(null)
    setResult(null)
    try {
      const r = await api('/api/admin/broadcast', {
        method: 'POST',
        body: { title: title.trim(), body: body.trim() || undefined, link: link.trim() || undefined, target },
      })
      setResult(r.sent)
      setTitle(''); setBody(''); setLink('')
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  return (
    <>
      <PageHeader title="공지 · 알림 발송" subtitle="사용자 그룹에게 알림을 일괄 발송합니다." />
      <div className="px-6 md:px-10 py-8 max-w-[720px] mx-auto">
        <Card>
          <form onSubmit={send} className="space-y-4">
            <div>
              <div className="text-[13px] font-semibold text-[#333452] mb-1.5">받는 대상</div>
              <div className="flex flex-wrap gap-2">
                {TARGETS.map((t) => (
                  <button type="button" key={t.k} onClick={() => setTarget(t.k)}
                    className={`h-10 px-4 rounded-full text-[13px] font-semibold border transition ${target === t.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Input label="제목" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 서비스 점검 안내" required />
            <Input as="textarea" label="내용 (선택)" value={body} onChange={(e) => setBody(e.target.value)} placeholder="알림 본문을 입력하세요." />
            <Input label="링크 (선택)" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/app/creator/campaigns 또는 https://..." />

            {error && <div className="text-[13px] text-[#C43434] bg-[#FFE4E4] rounded-lg p-3">{error}</div>}
            {result !== null && <div className="text-[13px] text-[#17804D] bg-[#ECFDF3] rounded-lg p-3">✓ {result.toLocaleString()}명에게 발송 완료</div>}

            <div className="flex justify-end pt-2">
              <Button type="submit" size="lg" loading={sending} leftIcon={<Send size={16} />}>알림 발송</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
