import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Search, ShieldCheck, Ban, Trash2 } from 'lucide-react'

const ROLES = [
  { k: '', label: '전체' },
  { k: 'creator', label: '크리에이터' },
  { k: 'business', label: '브랜드' },
  { k: 'admin', label: '관리자' },
]
const STATUS = [
  { k: '', label: '전체' },
  { k: 'false', label: '활성' },
  { k: 'true', label: '정지' },
]

export default function AdminUsers() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [suspended, setSuspended] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (role) p.set('role', role)
    if (suspended) p.set('suspended', suspended)
    api(`/api/admin/users?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [q, role, suspended])

  const verify = async (id) => { await api(`/api/admin/users/${id}/verify`, { method: 'POST' }); load() }
  const toggleSuspend = async (u) => {
    const reason = u.suspended ? null : prompt('정지 사유를 입력하세요 (선택):', '') || ''
    if (reason === null) return
    await api(`/api/admin/users/${u.id}/suspend`, { method: 'POST', body: { reason } })
    load()
  }
  const changeRole = async (id, current) => {
    const next = prompt(`역할 변경 (creator / business / admin). 현재: ${current}`, current)
    if (!next || next === current) return
    if (!['creator', 'business', 'admin'].includes(next)) return alert('잘못된 역할')
    await api(`/api/admin/users/${id}/role`, { method: 'PATCH', body: { role: next } })
    load()
  }
  const del = async (id) => {
    if (!confirm('이 사용자를 영구 삭제하시겠습니까? 연결된 데이터도 모두 삭제됩니다.')) return
    await api(`/api/admin/users/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <PageHeader title="사용자 관리" subtitle="가입자 조회·인증·정지·역할 변경" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card className="mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1">
              <Input leftAddon={<Search size={16} />} placeholder="이메일·이름·회사명 검색" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[12px] font-bold text-[#6B7280] self-center mr-1">역할</span>
              {ROLES.map((r) => (
                <button key={r.k} onClick={() => setRole(r.k)}
                  className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${role === r.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[12px] font-bold text-[#6B7280] self-center mr-1">상태</span>
              {STATUS.map((s) => (
                <button key={s.k} onClick={() => setSuspended(s.k)}
                  className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${suspended === s.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card padded={false}>
          <div className="grid grid-cols-[1fr_110px_100px_100px_200px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280]">
            <div>사용자</div>
            <div>역할</div>
            <div>상태</div>
            <div>가입일</div>
            <div>액션</div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">사용자가 없습니다.</div>
          ) : rows.map((u) => {
            const verified = u.role === 'creator' ? u.creator_verified : u.role === 'business' ? u.business_verified : true
            const name = u.role === 'creator' ? (u.display_name || u.handle) : u.company_name || u.email
            return (
              <div key={u.id} className="grid grid-cols-[1fr_110px_100px_100px_200px] px-5 py-3 border-b border-[#F1F2F6] items-center text-[13px]">
                <div className="min-w-0">
                  <div className="font-bold text-[#0B0B1A] truncate">{name}</div>
                  <div className="text-[11.5px] text-[#6B7280] truncate">{u.email}</div>
                </div>
                <div>
                  <button onClick={() => changeRole(u.id, u.role)} title="클릭해서 변경">
                    <Badge tone={u.role === 'admin' ? 'danger' : u.role === 'business' ? 'neutral' : 'brand'}>{u.role}</Badge>
                  </button>
                </div>
                <div>
                  {u.suspended ? <Badge tone="danger">정지</Badge>
                   : u.role === 'admin' ? <Badge tone="success">활성</Badge>
                   : <Badge tone={verified ? 'success' : 'warn'}>{verified ? '인증됨' : '미인증'}</Badge>}
                </div>
                <div className="text-[#6B7280] text-[12px]">{new Date(u.created_at).toLocaleDateString('ko-KR')}</div>
                <div className="flex gap-1">
                  {u.role !== 'admin' && (
                    <button onClick={() => verify(u.id)} title="인증 토글" className="h-8 px-2 rounded-lg bg-[#F3F1FF] text-[#4733D6] text-[11.5px] font-bold hover:bg-[#E5E0FF]">
                      <ShieldCheck size={12} className="inline mr-0.5" />인증
                    </button>
                  )}
                  <button onClick={() => toggleSuspend(u)} title="정지 토글" className="h-8 px-2 rounded-lg bg-[#FFF4DE] text-[#8A5A00] text-[11.5px] font-bold hover:bg-[#FFE8BD]">
                    <Ban size={12} className="inline mr-0.5" />{u.suspended ? '해제' : '정지'}
                  </button>
                  <button onClick={() => del(u.id)} title="삭제" className="h-8 px-2 rounded-lg bg-[#FFE4E4] text-[#C43434] text-[11.5px] font-bold hover:bg-[#FFD0D0]">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </>
  )
}
