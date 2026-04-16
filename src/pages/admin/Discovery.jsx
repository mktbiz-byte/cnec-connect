import { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Search, Mail, Send, FolderPlus, BadgeCheck } from 'lucide-react'

const PLATFORMS = ['', 'instagram', 'youtube', 'tiktok', 'blog']
const CATEGORIES = ['', '뷰티', '패션', '음식', '여행', '운동', 'IT', '육아', '반려동물', '라이프스타일']
const REGIONS = ['', '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '제주', '해외']
const SOURCES = [
  { k: 'all', label: '전체' },
  { k: 'registered', label: '가입 크리에이터' },
  { k: 'imported', label: '임포트(인스타)' },
]

function formatFollowers(n) {
  const v = Number(n || 0)
  if (v >= 10000) return `${(v / 10000).toFixed(v >= 100000 ? 0 : 1)}만`
  return v.toLocaleString()
}

export default function AdminDiscovery() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [filters, setFilters] = useState({
    q: '', platform: '', category: '', region: '',
    minFollowers: '', maxFollowers: '', minEr: '', maxEr: '',
    verified: '', source: 'all', hasEmail: false, sort: 'followers',
  })
  const [groups, setGroups] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [proposalOpen, setProposalOpen] = useState(false)
  const [groupOpen, setGroupOpen] = useState(false)

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }))

  const load = async () => {
    setLoading(true)
    const p = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v === '' || v === false) return
      p.set(k, v === true ? 'true' : String(v))
    })
    try {
      const r = await api(`/api/discovery/search?${p}`)
      setRows(r.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => { api('/api/discovery/groups').then((r) => setGroups(r.data || [])).catch(() => {}) }, [])
  useEffect(() => { api('/api/admin/campaigns').then((r) => setCampaigns(r.data || [])).catch(() => {}) }, [])

  const toggle = (key) => {
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
  }
  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set())
    else setSelected(new Set(rows.map((r) => keyOf(r))))
  }
  const keyOf = (r) => `${r.source}:${r.id || r.imported_id}`

  const selectedRows = useMemo(() => rows.filter((r) => selected.has(keyOf(r))), [rows, selected])

  return (
    <>
      <PageHeader
        title="Discovery · 통합 검색"
        subtitle="가입 크리에이터 + 임포트(인스타) 데이터를 필터로 발굴하고 그룹·제안·캠페인 활성화까지 연결"
      />
      <div className="px-6 md:px-10 py-6 max-w-[1400px] mx-auto">
        <Card className="mb-4">
          <div className="grid md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <Input leftAddon={<Search size={16} />} placeholder="핸들·이름·이메일 검색" value={filters.q} onChange={(e) => set('q', e.target.value)} />
            </div>
            <Select label="플랫폼" value={filters.platform} onChange={(v) => set('platform', v)} options={PLATFORMS} />
            <Select label="카테고리" value={filters.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
            <Select label="지역" value={filters.region} onChange={(v) => set('region', v)} options={REGIONS} />
          </div>

          <div className="mt-3 grid md:grid-cols-5 gap-3">
            <Num label="팔로워 min" value={filters.minFollowers} onChange={(v) => set('minFollowers', v)} />
            <Num label="팔로워 max" value={filters.maxFollowers} onChange={(v) => set('maxFollowers', v)} />
            <Num label="ER min (%)" value={filters.minEr} onChange={(v) => set('minEr', v)} step="0.1" />
            <Num label="ER max (%)" value={filters.maxEr} onChange={(v) => set('maxEr', v)} step="0.1" />
            <div>
              <div className="text-[12px] font-semibold text-[#333452] mb-1.5">정렬</div>
              <select value={filters.sort} onChange={(e) => set('sort', e.target.value)}
                className="w-full h-12 px-4 rounded-[12px] border border-[#E5E7EB] text-[14px]">
                <option value="followers">팔로워 많은 순</option>
                <option value="engagement">ER 높은 순</option>
                <option value="recent">최신순</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold text-[#6B7280] mr-1">대상</span>
            {SOURCES.map((s) => (
              <button key={s.k} onClick={() => set('source', s.k)}
                className={`h-8 px-3 rounded-full text-[12px] font-semibold border transition ${filters.source === s.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                {s.label}
              </button>
            ))}
            <label className="inline-flex items-center gap-1.5 ml-3 text-[12.5px] font-semibold text-[#333452]">
              <input type="checkbox" checked={filters.hasEmail} onChange={(e) => set('hasEmail', e.target.checked)} /> 이메일 있음(임포트)
            </label>
            <label className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#333452]">
              <input type="checkbox" checked={filters.verified === 'true'} onChange={(e) => set('verified', e.target.checked ? 'true' : '')} /> 인증됨만
            </label>
            <div className="flex-1" />
            <Button onClick={load} loading={loading}>검색</Button>
          </div>
        </Card>

        {selectedRows.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-[#0B0B1A] text-white flex items-center gap-3">
            <div className="text-[13px] font-bold">{selectedRows.length}명 선택됨</div>
            <div className="flex-1" />
            <Button variant="outline" className="!bg-white !text-[#0B0B1A]" size="sm" leftIcon={<FolderPlus size={14} />} onClick={() => setGroupOpen(true)}>그룹에 추가</Button>
            <Button variant="outline" className="!bg-white !text-[#0B0B1A]" size="sm" leftIcon={<Send size={14} />} onClick={() => setProposalOpen(true)}>제안 보내기</Button>
          </div>
        )}

        <Card padded={false}>
          <div className="grid grid-cols-[40px_2fr_1fr_1fr_100px_90px_90px_100px_180px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[11.5px] font-bold text-[#6B7280]">
            <div><input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} /></div>
            <div>크리에이터</div>
            <div>카테고리</div>
            <div>플랫폼</div>
            <div>팔로워</div>
            <div>ER</div>
            <div>상태</div>
            <div>연락처</div>
            <div>액션</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">검색 결과가 없습니다.</div>
          ) : rows.map((r) => {
            const k = keyOf(r)
            const plats = Array.isArray(r.platforms) ? r.platforms : []
            return (
              <div key={k} className="grid grid-cols-[40px_2fr_1fr_1fr_100px_90px_90px_100px_180px] px-5 py-3 border-b border-[#F1F2F6] items-center text-[13px]">
                <div><input type="checkbox" checked={selected.has(k)} onChange={() => toggle(k)} /></div>
                <div className="min-w-0">
                  <div className="font-bold text-[#0B0B1A] truncate flex items-center gap-1">
                    {r.name || r.handle || '-'}
                    {r.verified && <BadgeCheck size={13} className="text-[#5B47FB]" />}
                  </div>
                  <div className="text-[11.5px] text-[#6B7280] truncate">@{r.handle || '-'} · {r.region || '지역 미지정'}</div>
                </div>
                <div className="text-[#6B7280] text-[11.5px] truncate">{(r.categories || []).slice(0, 2).join(', ') || '-'}</div>
                <div className="flex flex-wrap gap-1">
                  {plats.slice(0, 3).map((p, i) => (
                    <span key={i} className="text-[10.5px] bg-[#F3F1FF] text-[#4733D6] px-1.5 py-0.5 rounded font-bold uppercase">{p.name}</span>
                  ))}
                </div>
                <div className="font-bold text-[#0B0B1A]">{formatFollowers(r.followers)}</div>
                <div className="text-[#0B0B1A]">{r.er ? `${Number(r.er).toFixed(1)}%` : '-'}</div>
                <div><Badge tone={r.source === 'registered' ? 'success' : 'brand'}>{r.source === 'registered' ? '가입' : '임포트'}</Badge></div>
                <div className="text-[11.5px] text-[#333452] truncate">
                  {r.email && <div className="truncate">📧 {r.email}</div>}
                  {r.phone && <div className="truncate">📞 {r.phone}</div>}
                  {!r.email && !r.phone && <span className="text-[#9CA3AF]">-</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelected(new Set([k])); setProposalOpen(true) }} className="h-8 px-2.5 rounded-lg bg-[#F3F1FF] text-[#4733D6] text-[11.5px] font-bold">
                    <Send size={11} className="inline mr-0.5" />제안
                  </button>
                  <button onClick={() => { setSelected(new Set([k])); setGroupOpen(true) }} className="h-8 px-2.5 rounded-lg bg-[#F3F4F6] text-[#333452] text-[11.5px] font-bold">
                    <FolderPlus size={11} className="inline mr-0.5" />그룹
                  </button>
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      {proposalOpen && (
        <ProposalModal
          targets={selectedRows}
          campaigns={campaigns}
          onClose={() => setProposalOpen(false)}
          onSent={() => { setProposalOpen(false); setSelected(new Set()) }}
        />
      )}
      {groupOpen && (
        <GroupModal
          targets={selectedRows}
          groups={groups}
          onClose={() => setGroupOpen(false)}
          onSaved={() => { setGroupOpen(false); setSelected(new Set()); api('/api/discovery/groups').then((r) => setGroups(r.data || [])) }}
        />
      )}
    </>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <div className="text-[12px] font-semibold text-[#333452] mb-1.5">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-12 px-4 rounded-[12px] border border-[#E5E7EB] text-[14px]">
        {options.map((o) => <option key={o} value={o}>{o || '전체'}</option>)}
      </select>
    </div>
  )
}

function Num({ label, value, onChange, step }) {
  return (
    <div>
      <div className="text-[12px] font-semibold text-[#333452] mb-1.5">{label}</div>
      <input type="number" step={step} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-[12px] border border-[#E5E7EB] text-[14px]" />
    </div>
  )
}

function ProposalModal({ targets, campaigns, onClose, onSent }) {
  const [campaignId, setCampaignId] = useState('')
  const [subject, setSubject] = useState('캠페인 제안')
  const [body, setBody] = useState('안녕하세요, 저희 캠페인에 맞는 크리에이터로 판단되어 제안드립니다.')
  const [budget, setBudget] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const send = async () => {
    setSending(true); setError(null)
    try {
      const creatorUserIds = targets.filter((t) => t.source === 'registered').map((t) => t.id)
      const importedCreatorIds = targets.filter((t) => t.source === 'imported').map((t) => t.imported_id)
      await api('/api/discovery/proposals', {
        method: 'POST',
        body: {
          campaignId: campaignId || undefined,
          subject, body,
          proposedBudget: budget ? Number(budget) : undefined,
          channel: 'in_app',
          creatorUserIds, importedCreatorIds,
        },
      })
      onSent()
      alert(`${targets.length}명에게 제안을 발송했습니다.`)
    } catch (e) { setError(e.message || '발송 실패') }
    finally { setSending(false) }
  }

  return (
    <Modal onClose={onClose} title={`${targets.length}명에게 제안 보내기`}>
      <div className="space-y-3">
        <div>
          <div className="text-[12.5px] font-semibold text-[#333452] mb-1.5">연결할 캠페인 (선택)</div>
          <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}
            className="w-full h-11 px-3 rounded-[12px] border border-[#E5E7EB] text-[14px]">
            <option value="">연결 안 함 (단순 제안)</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <p className="mt-1 text-[11.5px] text-[#6B7280]">캠페인 연결 시, 수락하면 해당 캠페인 지원자로 자동 등록됩니다.</p>
        </div>
        <Input label="제목" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Input as="textarea" label="메시지" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
        <Input label="제안 예산 (원, 선택)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
        {error && <div className="text-[13px] text-[#C43434]">{error}</div>}
        <div className="text-[11.5px] text-[#6B7280]">
          ※ 가입 크리에이터에게는 앱 내 알림 + 메시지로 전달됩니다. 임포트된(미가입) 대상은 이메일·DM 발송이 별도 Phase에서 지원됩니다(현재는 로그만 저장).
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={send} loading={sending}>제안 발송</Button>
        </div>
      </div>
    </Modal>
  )
}

function GroupModal({ targets, groups, onClose, onSaved }) {
  const [groupId, setGroupId] = useState('')
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      let gid = groupId
      if (!gid) {
        if (!newName) { alert('그룹 이름을 입력하거나 기존 그룹을 선택하세요'); return }
        const r = await api('/api/discovery/groups', { method: 'POST', body: { name: newName } })
        gid = r.data.id
      }
      for (const t of targets) {
        await api(`/api/discovery/groups/${gid}/members`, {
          method: 'POST',
          body: t.source === 'registered' ? { creatorUserId: t.id } : { importedCreatorId: t.imported_id },
        }).catch(() => {})
      }
      onSaved()
      alert(`${targets.length}명을 그룹에 추가했습니다.`)
    } finally { setSaving(false) }
  }

  return (
    <Modal onClose={onClose} title={`${targets.length}명을 그룹에 추가`}>
      <div className="space-y-3">
        <div>
          <div className="text-[12.5px] font-semibold text-[#333452] mb-1.5">기존 그룹</div>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}
            className="w-full h-11 px-3 rounded-[12px] border border-[#E5E7EB] text-[14px]">
            <option value="">선택 안 함 (새로 만들기)</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.member_count}명)</option>)}
          </select>
        </div>
        {!groupId && <Input label="새 그룹 이름" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="예: 뷰티 상위 타겟" />}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={save} loading={saving}>추가</Button>
        </div>
      </div>
    </Modal>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] shadow-elevated max-w-[520px] w-full">
        <div className="px-6 py-4 border-b border-[#F1F2F6] flex items-center justify-between">
          <h3 className="text-[16px] font-extrabold">{title}</h3>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#0B0B1A]">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
