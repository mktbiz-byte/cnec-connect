import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { FolderPlus, Trash2, Users2 } from 'lucide-react'

export default function AdminGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [detail, setDetail] = useState(null)
  const [newName, setNewName] = useState('')

  const loadGroups = () =>
    api('/api/discovery/groups').then((r) => { setGroups(r.data || []); if (!active && r.data?.[0]) setActive(r.data[0].id) }).finally(() => setLoading(false))

  useEffect(() => { loadGroups() }, [])
  useEffect(() => {
    if (!active) { setDetail(null); return }
    api(`/api/discovery/groups/${active}`).then((r) => setDetail(r.data))
  }, [active])

  const create = async () => {
    if (!newName.trim()) return
    await api('/api/discovery/groups', { method: 'POST', body: { name: newName.trim() } })
    setNewName(''); loadGroups()
  }
  const del = async (id) => {
    if (!confirm('그룹을 삭제할까요?')) return
    await api(`/api/discovery/groups/${id}`, { method: 'DELETE' })
    setActive(null); loadGroups()
  }
  const removeMember = async (id) => {
    await api(`/api/discovery/groups/${active}/members/${id}`, { method: 'DELETE' })
    api(`/api/discovery/groups/${active}`).then((r) => setDetail(r.data))
  }

  return (
    <>
      <PageHeader title="크리에이터 그룹" subtitle="발굴한 크리에이터를 조직화하고 캠페인에 연결" />
      <div className="px-6 md:px-10 py-6 max-w-[1280px] mx-auto grid md:grid-cols-[320px_1fr] gap-5">
        <div>
          <Card className="mb-3">
            <div className="flex items-center gap-2">
              <Input placeholder="새 그룹 이름" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Button onClick={create} leftIcon={<FolderPlus size={14} />}>추가</Button>
            </div>
          </Card>
          <Card padded={false}>
            {loading ? (
              <div className="py-10 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
            ) : groups.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-[#6B7280]">그룹이 없습니다.</div>
            ) : groups.map((g) => (
              <button key={g.id} onClick={() => setActive(g.id)}
                className={`w-full text-left px-4 py-3.5 border-b border-[#F1F2F6] hover:bg-[#FAFAFB] ${active === g.id ? 'bg-[#F5F6FA]' : ''}`}>
                <div className="flex items-center gap-2">
                  <Users2 size={14} className="text-[#5B47FB]" />
                  <div className="font-bold text-[13.5px] text-[#0B0B1A] flex-1 truncate">{g.name}</div>
                  <span className="text-[11px] text-[#6B7280]">{g.member_count}명</span>
                </div>
                {g.shared && <Badge tone="brand" className="mt-1">공유됨</Badge>}
              </button>
            ))}
          </Card>
        </div>

        <div>
          {!detail ? (
            <Card className="py-20 text-center text-[#6B7280]">그룹을 선택하세요.</Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[20px] font-extrabold text-[#0B0B1A]">{detail.group.name}</h3>
                  <p className="text-[13px] text-[#6B7280]">{detail.members.length}명 · {new Date(detail.group.created_at).toLocaleDateString('ko-KR')} 생성</p>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Trash2 size={13} />} onClick={() => del(detail.group.id)}>그룹 삭제</Button>
              </div>
              <Card padded={false}>
                <div className="grid grid-cols-[2fr_1fr_1fr_100px_90px] px-5 py-3 bg-[#FAFAFB] border-b border-[#F1F2F6] text-[11.5px] font-bold text-[#6B7280]">
                  <div>크리에이터</div>
                  <div>연락처</div>
                  <div>메모</div>
                  <div>팔로워</div>
                  <div></div>
                </div>
                {detail.members.length === 0 ? (
                  <div className="py-10 text-center text-[#6B7280] text-[13px]">
                    멤버가 없습니다. Discovery 검색에서 추가하세요.
                  </div>
                ) : detail.members.map((m) => (
                  <div key={m.id} className="grid grid-cols-[2fr_1fr_1fr_100px_90px] px-5 py-3 border-b border-[#F1F2F6] items-center text-[13px]">
                    <div className="min-w-0">
                      <div className="font-bold text-[#0B0B1A] truncate">
                        {m.display_name || m.imported_name || m.handle || m.instagram_handle}
                        {m.creator_user_id && <Badge tone="success" className="ml-2">가입</Badge>}
                        {m.imported_creator_id && <Badge tone="brand" className="ml-2">임포트</Badge>}
                      </div>
                      <div className="text-[11.5px] text-[#6B7280]">@{m.handle || m.instagram_handle}</div>
                    </div>
                    <div className="text-[11.5px] text-[#333452] truncate">
                      {m.email && <div>📧 {m.email}</div>}
                      {m.phone && <div>📞 {m.phone}</div>}
                      {!m.email && !m.phone && <span className="text-[#9CA3AF]">-</span>}
                    </div>
                    <div className="text-[11.5px] text-[#6B7280] truncate">{m.note || '-'}</div>
                    <div className="font-bold text-[#0B0B1A]">{Number(m.followers_total || m.imported_followers || 0).toLocaleString()}</div>
                    <div><button onClick={() => removeMember(m.id)} className="h-8 w-8 rounded-lg bg-[#FFE4E4] text-[#C43434] inline-flex items-center justify-center"><Trash2 size={12} /></button></div>
                  </div>
                ))}
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  )
}
