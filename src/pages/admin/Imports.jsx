import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Upload, Search, Link2, RefreshCw } from 'lucide-react'

function parseCSV(text) {
  // 간단한 CSV 파서 (헤더 있는 쉼표/탭 구분 + 따옴표 처리)
  const lines = text.trim().split(/\r?\n/)
  if (lines.length === 0) return []
  const sep = lines[0].includes('\t') ? '\t' : ','
  const parseLine = (line) => {
    const out = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') { inQ = !inQ; continue }
      if (c === sep && !inQ) { out.push(cur); cur = ''; continue }
      cur += c
    }
    out.push(cur)
    return out.map((s) => s.trim())
  }
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const cols = parseLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = cols[i] || '' })
    return obj
  })
}

export default function AdminImports() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('cnec-legacy')
  const [csvText, setCsvText] = useState('')
  const [lookupInput, setLookupInput] = useState('')
  const [lookupResult, setLookupResult] = useState(null)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (filter === 'matched') p.set('onlyMatched', 'true')
    if (filter === 'unmatched') p.set('onlyUnmatched', 'true')
    api(`/api/admin/imports?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [q, filter])

  const onFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    setCsvText(text)
  }

  const importNow = async () => {
    if (!csvText.trim()) return alert('CSV를 먼저 붙여넣거나 파일을 선택하세요.')
    const parsed = parseCSV(csvText)
    if (parsed.length === 0) return alert('파싱 가능한 행이 없습니다.')
    const r = await api('/api/admin/imports', { method: 'POST', body: { source, rows: parsed } })
    alert(`${r.inserted}건 임포트 완료`)
    setCsvText('')
    load()
  }

  const runMatch = async () => {
    const r = await api('/api/admin/imports/match', { method: 'POST' })
    alert(`${r.matched}건 매칭 완료`)
    load()
  }

  const lookup = async () => {
    if (!lookupInput.trim()) return
    const q = encodeURIComponent(lookupInput.trim())
    const r = await api(`/api/admin/lookup?handle=${q}`)
    setLookupResult(r)
  }

  return (
    <>
      <PageHeader
        title="크리에이터 데이터 임포트"
        subtitle="인스타 핸들 ↔ 폰·이메일 매칭. 기존 CNEC Railway 데이터·CSV를 업로드해 연결합니다."
        actions={<Button onClick={runMatch} variant="soft" leftIcon={<RefreshCw size={14} />}>가입자와 자동 매칭</Button>}
      />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-[#5B47FB]" />
              <h3 className="text-[16px] font-extrabold">CSV 임포트</h3>
            </div>
            <p className="mt-2 text-[12.5px] text-[#6B7280] leading-relaxed">
              헤더는 <code className="bg-[#F3F1FF] text-[#4733D6] px-1 rounded">instagram_handle</code>,
              <code className="bg-[#F3F1FF] text-[#4733D6] px-1 rounded mx-1">email</code>,
              <code className="bg-[#F3F1FF] text-[#4733D6] px-1 rounded">phone</code>,
              <code className="bg-[#F3F1FF] text-[#4733D6] px-1 rounded mx-1">name</code>,
              <code className="bg-[#F3F1FF] text-[#4733D6] px-1 rounded">followers</code>,
              <code className="bg-[#F3F1FF] text-[#4733D6] px-1 rounded ml-1">source_id</code> 를 지원합니다.
              쉼표 또는 탭 구분 가능.
            </p>
            <div className="mt-4 grid md:grid-cols-[1fr_160px] gap-3 items-end">
              <Input label="소스 이름" value={source} onChange={(e) => setSource(e.target.value)} placeholder="예: cnec-legacy, excel-2024" />
              <input type="file" accept=".csv,text/csv,text/plain" onChange={onFile}
                className="h-12 rounded-[12px] border border-[#E5E7EB] px-3 text-[13px]" />
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={6}
              placeholder="instagram_handle,email,phone,name,followers&#10;sora_daily,sora@example.com,010-1234-5678,소라,245000"
              className="mt-3 w-full rounded-[12px] border border-[#E5E7EB] p-3 text-[12.5px] font-mono focus:border-[#5B47FB] focus:outline-none"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={importNow}>임포트 실행</Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Search size={16} className="text-[#5B47FB]" />
              <h3 className="text-[16px] font-extrabold">인스타 핸들로 연락처 조회</h3>
            </div>
            <p className="mt-2 text-[12.5px] text-[#6B7280]">
              인스타 URL 또는 <code className="bg-[#F3F4F6] px-1 rounded">@handle</code> 입력 시 임포트된 데이터에서 폰·이메일을 조회합니다.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="https://instagram.com/sora_daily"
                className="flex-1 h-12 px-4 rounded-[12px] border border-[#E5E7EB] text-[14px]"
              />
              <Button onClick={lookup} leftIcon={<Link2 size={14} />}>조회</Button>
            </div>
            {lookupResult && (
              <div className="mt-4 p-4 rounded-xl bg-[#FAFAFB] text-[13px]">
                <div className="text-[11.5px] font-semibold text-[#6B7280]">검색 핸들</div>
                <div className="font-bold text-[#0B0B1A]">@{lookupResult.handle}</div>
                {lookupResult.data.length === 0 ? (
                  <div className="mt-3 text-[#6B7280]">해당 핸들의 데이터가 없습니다.</div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {lookupResult.data.map((r) => (
                      <li key={r.id} className="rounded-lg bg-white p-3 border border-[#EEF0F4]">
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                          <span className="font-semibold">{r.source}</span>
                          <span>· {new Date(r.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="mt-1 text-[14px] font-bold text-[#0B0B1A]">{r.name || '-'}</div>
                        <div className="mt-0.5 text-[12.5px] text-[#333452]">
                          📧 {r.email || '-'} · 📞 {r.phone || '-'} {r.followers ? `· 팔로워 ${Number(r.followers).toLocaleString()}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>
        </div>

        <Card padded={false}>
          <div className="px-6 py-5 border-b border-[#F1F2F6] flex items-center gap-3">
            <h3 className="text-[16px] font-extrabold flex-1">임포트된 데이터</h3>
            <div className="flex gap-1">
              {[
                { k: 'all', label: '전체' },
                { k: 'matched', label: '매칭됨' },
                { k: 'unmatched', label: '미매칭' },
              ].map((f) => (
                <button key={f.k} onClick={() => setFilter(f.k)}
                  className={`h-8 px-3 rounded-full text-[12px] font-semibold border transition ${filter === f.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="w-56">
              <Input leftAddon={<Search size={14} />} placeholder="핸들/이메일/폰 검색" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_120px_110px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280]">
            <div>인스타</div>
            <div>이메일</div>
            <div>폰</div>
            <div>이름</div>
            <div>소스</div>
            <div>매칭</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">임포트된 데이터가 없습니다.</div>
          ) : rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_120px_110px] px-5 py-3 border-b border-[#F1F2F6] items-center text-[13px]">
              <div className="font-bold text-[#0B0B1A] truncate">@{r.instagram_handle || '-'}</div>
              <div className="text-[#333452] truncate">{r.email || '-'}</div>
              <div className="text-[#333452] truncate">{r.phone || '-'}</div>
              <div className="text-[#6B7280] truncate">{r.name || '-'}</div>
              <div className="text-[11.5px] text-[#6B7280]">{r.source}</div>
              <div>
                {r.matched_user_id ? (
                  <Badge tone="success">{r.matched_display_name || '매칭'}</Badge>
                ) : (
                  <Badge tone="neutral">미매칭</Badge>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
