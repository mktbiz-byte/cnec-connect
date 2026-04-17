import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Sparkles, Send, FolderPlus } from 'lucide-react'

const SUGGESTIONS = [
  '뷰티 카테고리에서 팔로워 10만 이상이고 참여율이 높은 크리에이터',
  '서울 지역의 맛집·푸드 인플루언서 추천',
  '여행 콘텐츠를 만들면서 ER 5% 이상인 크리에이터',
  '반려동물 크리에이터 중 팔로워 20만 이상',
  '운동·피트니스 인플루언서 리스트업',
  '육아 카테고리 마이크로 인플루언서 (팔로워 5만 이하)',
]

function formatN(n) {
  const v = Number(n || 0)
  if (v >= 10000) return `${(v / 10000).toFixed(v >= 100000 ? 0 : 1)}만`
  return v.toLocaleString()
}

export default function AIListup() {
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState([])
  const [reasoning, setReasoning] = useState('')
  const [method, setMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/api/discovery/listup/history').then((r) => setHistory(r.data || [])).catch(() => {})
  }, [])

  const search = async (text) => {
    const q = text || prompt
    if (!q.trim()) return
    setLoading(true); setError(null); setResults([]); setReasoning('')
    try {
      const r = await api('/api/discovery/listup', { method: 'POST', body: { prompt: q.trim() } })
      setResults(r.data || [])
      setReasoning(r.reasoning || '')
      setMethod(r.method || 'unknown')
      api('/api/discovery/listup/history').then((r) => setHistory(r.data || [])).catch(() => {})
    } catch (e) { setError(e.message || '요청 실패') }
    finally { setLoading(false) }
  }

  return (
    <>
      <PageHeader title="AI 리스트업" subtitle="자연어로 크리에이터를 찾아보세요. Gemini AI 또는 키워드 기반 매칭." />
      <div className="px-6 md:px-10 py-6 max-w-[1280px] mx-auto">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-[#5B47FB]" />
            <h3 className="text-[16px] font-extrabold">자연어 프롬프트</h3>
          </div>
          <div className="flex gap-2">
            <textarea
              value={prompt} onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); search() } }}
              rows={2} placeholder="예: 뷰티 카테고리에서 팔로워 10만 이상이고 참여율이 높은 크리에이터 추천해줘"
              className="flex-1 resize-none px-4 py-3 rounded-[12px] border border-[#E5E7EB] text-[14px] focus:border-[#5B47FB] focus:outline-none"
            />
            <Button onClick={() => search()} loading={loading} className="self-end">
              <Sparkles size={14} className="mr-1" /> 리스트업
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setPrompt(s); search(s) }}
                className="h-8 px-3 rounded-full bg-[#F3F1FF] text-[#4733D6] text-[12px] font-semibold hover:bg-[#E5E0FF] transition">
                {s}
              </button>
            ))}
          </div>
        </Card>

        {error && <div className="mt-4 text-[13px] text-[#C43434] bg-[#FFE4E4] rounded-lg p-3">{error}</div>}

        {reasoning && (
          <Card className="mt-4">
            <div className="text-[12px] font-bold text-[#6B7280] mb-1">AI 분석</div>
            <p className="text-[13.5px] text-[#333452]">{reasoning}</p>
            <Badge tone="brand" className="mt-2">{method === 'gemini' ? 'Gemini AI' : '키워드 매칭'}</Badge>
          </Card>
        )}

        {results.length > 0 && (
          <Card className="mt-4" padded={false}>
            <div className="px-6 py-4 border-b border-[#F1F2F6] flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold">추천 결과 ({results.length}명)</h3>
            </div>
            <div className="divide-y divide-[#F1F2F6]">
              {results.map((c) => (
                <div key={c.id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B47FB] text-white flex items-center justify-center font-bold">
                    {(c.name || c.handle || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] text-[#0B0B1A] truncate">{c.name} <span className="text-[#6B7280] font-normal">@{c.handle}</span></div>
                    <div className="text-[12px] text-[#6B7280]">{(c.categories || []).join(', ')} · {c.region || '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#0B0B1A]">{formatN(c.followers)}</div>
                    <div className="text-[12px] text-[#5B47FB]">ER {Number(c.er || 0).toFixed(1)}%</div>
                  </div>
                  <Link to={`/app/admin/discovery/reports/registered/${c.id}`}
                    className="h-8 px-2.5 rounded-lg bg-[#0B0B1A] text-white text-[11.5px] font-bold inline-flex items-center">
                    리포트
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="mt-6">
          <h3 className="text-[16px] font-extrabold mb-3">리스트업 히스토리</h3>
          {history.length === 0 ? (
            <div className="text-[#6B7280] text-[13px]">이전 검색이 없습니다.</div>
          ) : (
            <div className="divide-y divide-[#F1F2F6]">
              {history.slice(0, 10).map((h) => (
                <button key={h.id} onClick={() => { setPrompt(h.prompt); search(h.prompt) }}
                  className="w-full text-left py-3 flex items-center gap-3 hover:bg-[#FAFAFB]">
                  <Sparkles size={14} className="text-[#5B47FB]" />
                  <div className="flex-1 truncate text-[13.5px] text-[#0B0B1A]">{h.prompt}</div>
                  <Badge tone={h.status === 'completed' ? 'success' : 'warn'}>{h.result_count || 0}명</Badge>
                  <span className="text-[11px] text-[#6B7280]">{new Date(h.created_at).toLocaleDateString('ko-KR')}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
