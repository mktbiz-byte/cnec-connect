import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { Send } from 'lucide-react'

function formatTime(s) {
  const d = new Date(s)
  return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Messages() {
  const { user } = useAuth()
  const [threads, setThreads] = useState([])
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [params, setParams] = useSearchParams()
  const activeId = params.get('t')
  const [messages, setMessages] = useState([])
  const [thread, setThread] = useState(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const scrollerRef = useRef(null)

  const loadThreads = () =>
    api('/api/threads').then((r) => setThreads(r.data || [])).finally(() => setLoadingThreads(false))

  const loadThread = (id) => {
    if (!id) return
    api(`/api/threads/${id}`).then((r) => {
      setThread(r.data.thread)
      setMessages(r.data.messages)
      queueMicrotask(() => scrollerRef.current?.scrollTo(0, scrollerRef.current.scrollHeight))
    })
  }

  useEffect(() => { loadThreads() }, [])

  useEffect(() => {
    loadThread(activeId)
    if (!activeId) return
    const t = setInterval(() => loadThread(activeId), 5000)
    return () => clearInterval(t)
  }, [activeId])

  useEffect(() => {
    if (!activeId && threads.length > 0) setParams({ t: threads[0].id }, { replace: true })
  }, [threads, activeId, setParams])

  const send = async (e) => {
    e.preventDefault()
    if (!body.trim() || !activeId) return
    setSending(true)
    try {
      await api(`/api/threads/${activeId}/messages`, { method: 'POST', body: { body: body.trim() } })
      setBody('')
      loadThread(activeId)
      loadThreads()
    } finally { setSending(false) }
  }

  const partner = (t) =>
    user?.role === 'business'
      ? { name: t.creator_name || t.creator_handle, sub: `@${t.creator_handle || ''}` }
      : { name: t.company_name || '브랜드', sub: t.campaign_title || '' }

  return (
    <>
      <PageHeader title="메시지" subtitle="지원이 확정된 상대와 자유롭게 대화하세요." />
      <div className="px-6 md:px-10 py-6 max-w-[1280px] mx-auto">
        <div className="grid md:grid-cols-[320px_1fr] gap-0 bg-white border border-[#EEF0F4] rounded-[20px] overflow-hidden min-h-[560px]">
          <aside className="border-r border-[#EEF0F4] max-h-[72vh] overflow-y-auto">
            {loadingThreads ? (
              <div className="p-10 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
            ) : threads.length === 0 ? (
              <div className="p-10 text-center text-[13px] text-[#6B7280]">대화가 아직 없습니다. 지원이 확정되면 자동으로 생성됩니다.</div>
            ) : (
              threads.map((t) => {
                const p = partner(t)
                return (
                  <button
                    key={t.id}
                    onClick={() => setParams({ t: t.id })}
                    className={cn(
                      'w-full text-left px-4 py-4 border-b border-[#F1F2F6] flex gap-3 items-start hover:bg-[#FAFAFB]',
                      activeId === t.id && 'bg-[#F5F6FA]',
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#5B47FB] text-white font-bold flex items-center justify-center">
                      {(p.name || '?')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[13.5px] text-[#0B0B1A] truncate">{p.name}</div>
                        {Number(t.unread) > 0 && (
                          <span className="text-[10px] font-bold bg-[#FF5A5A] text-white rounded-full h-4 px-1.5 inline-flex items-center">
                            {t.unread}
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-[#6B7280] truncate">{p.sub}</div>
                      <div className="mt-1 text-[12px] text-[#333452] truncate">{t.last_body || '새 대화'}</div>
                    </div>
                  </button>
                )
              })
            )}
          </aside>

          <section className="flex flex-col max-h-[72vh]">
            {!activeId || !thread ? (
              <div className="flex-1 flex items-center justify-center text-[#6B7280] text-[13.5px]">대화를 선택하세요.</div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-[#EEF0F4] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#5B47FB] text-white font-bold flex items-center justify-center">
                    {(partner(thread).name || '?')[0]}
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-[#0B0B1A]">{partner(thread).name}</div>
                    <div className="text-[11.5px] text-[#6B7280]">{partner(thread).sub}</div>
                  </div>
                </div>

                <div ref={scrollerRef} className="flex-1 overflow-y-auto p-5 space-y-2.5 bg-[#FAFAFB]">
                  {messages.map((m) => {
                    const mine = m.sender_id === user.id
                    return (
                      <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                        <div className={cn('max-w-[80%] px-3.5 py-2.5 rounded-[14px] text-[13.5px] leading-relaxed',
                          mine ? 'bg-[#0B0B1A] text-white' : 'bg-white border border-[#EEF0F4] text-[#0B0B1A]')}>
                          <div className="whitespace-pre-wrap">{m.body}</div>
                          <div className={cn('mt-1 text-[10.5px]', mine ? 'text-white/60' : 'text-[#9CA3AF]')}>
                            {formatTime(m.created_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {messages.length === 0 && <div className="text-center text-[#6B7280] text-[12.5px] py-10">첫 메시지를 남겨보세요.</div>}
                </div>

                <form onSubmit={send} className="p-4 border-t border-[#EEF0F4] bg-white flex gap-2">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e) } }}
                    rows={1}
                    placeholder="메시지를 입력하세요. (Shift+Enter 줄바꿈)"
                    className="flex-1 resize-none min-h-[44px] max-h-[140px] px-4 py-3 rounded-[12px] border border-[#E5E7EB] text-[14px] focus:border-[#5B47FB] focus:outline-none"
                  />
                  <Button type="submit" loading={sending} leftIcon={<Send size={16} />}>보내기</Button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
