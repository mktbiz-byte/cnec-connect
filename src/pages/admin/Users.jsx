import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Search, ShieldCheck } from 'lucide-react'

const ROLES = [
  { k: '', label: '전체' },
  { k: 'creator', label: '크리에이터' },
  { k: 'business', label: '브랜드' },
  { k: 'admin', label: '관리자' },
]

export default function AdminUsers() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (role) p.set('role', role)
    api(`/api/admin/users?${p}`).then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [q, role])

  const verify = async (id) => {
    await api(`/api/admin/users/${id}/verify`, { method: 'POST' })
    load()
  }

  return (
    <>
      <PageHeader title="사용자 관리" subtitle="가입된 크리에이터·브랜드·관리자 전체 목록" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card className="mb-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <Input leftAddon={<Search size={16} />} placeholder="이메일 / 이름 / 회사명 검색" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <button key={r.k} onClick={() => setRole(r.k)}
                  className={`h-9 px-3 rounded-full text-[12.5px] font-semibold border transition ${
                    role === r.k ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'
                  }`}>{r.label}</button>
              ))}
            </div>
          </div>
        </Card>

        <Card padded={false}>
          <div className="grid grid-cols-[1fr_140px_120px_120px_120px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280]">
            <div>사용자</div>
            <div>역할</div>
            <div>가입일</div>
            <div>인증</div>
            <div></div>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">사용자가 없습니다.</div>
          ) : rows.map((u) => {
            const verified = u.role === 'creator' ? u.creator_verified : u.role === 'business' ? u.business_verified : true
            const name = u.role === 'creator' ? (u.display_name || u.handle) : u.company_name || u.email
            return (
              <div key={u.id} className="grid grid-cols-[1fr_140px_120px_120px_120px] px-5 py-3.5 border-b border-[#F1F2F6] items-center text-[13.5px]">
                <div className="min-w-0">
                  <div className="font-bold text-[#0B0B1A] truncate">{name}</div>
                  <div className="text-[11.5px] text-[#6B7280] truncate">{u.email}</div>
                </div>
                <div>
                  <Badge tone={u.role === 'admin' ? 'danger' : u.role === 'business' ? 'neutral' : 'brand'}>{u.role}</Badge>
                </div>
                <div className="text-[#6B7280]">{new Date(u.created_at).toLocaleDateString('ko-KR')}</div>
                <div>
                  {u.role !== 'admin' && (
                    <Badge tone={verified ? 'success' : 'warn'}>{verified ? '인증됨' : '미인증'}</Badge>
                  )}
                </div>
                <div className="text-right">
                  {u.role !== 'admin' && (
                    <Button size="sm" variant="soft" leftIcon={<ShieldCheck size={13} />} onClick={() => verify(u.id)}>
                      {verified ? '인증 해제' : '인증 처리'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </>
  )
}
