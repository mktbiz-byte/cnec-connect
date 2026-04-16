import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Users, Megaphone, Wallet, Instagram, FileVideo, Bell, ShieldCheck, Activity } from 'lucide-react'

function pickN(rows, key, val) { return rows.find((r) => r[key] === val)?.n || 0 }

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api('/api/admin/summary').then(setData).finally(() => setLoading(false))
  }, [])

  const creators = pickN(data?.users || [], 'role', 'creator')
  const brands = pickN(data?.users || [], 'role', 'business')
  const activeCampaigns = pickN(data?.campaigns || [], 'status', 'recruiting') + pickN(data?.campaigns || [], 'status', 'in_progress')
  const escrowHeld = Number((data?.payments || []).find((p) => p.status === 'paid')?.total || 0)
  const releasedTotal = Number((data?.payments || []).find((p) => p.status === 'released')?.total || 0)
  const pendingContent = data?.content?.pending || 0

  return (
    <>
      <PageHeader title="관리자 대시보드" subtitle="플랫폼 전체 지표와 최근 활동" />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat icon={Users} label="크리에이터" value={creators.toLocaleString()} />
              <Stat icon={Users} label="브랜드" value={brands.toLocaleString()} />
              <Stat icon={Megaphone} label="활성 캠페인" value={activeCampaigns.toLocaleString()} />
              <Stat icon={Wallet} label="에스크로 보관액" value={`₩${escrowHeld.toLocaleString()}`} />
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat icon={Wallet} label="총 정산 완료액" value={`₩${releasedTotal.toLocaleString()}`} tone="success" />
              <Stat icon={FileVideo} label="콘텐츠 승인 대기" value={pendingContent.toLocaleString()} tone="warn" link="/app/admin/content" />
              <Stat icon={Instagram} label="임포트된 크리에이터" value={(data?.imported?.total || 0).toLocaleString()} link="/app/admin/imports" />
              <Stat icon={ShieldCheck} label="매칭 완료" value={(data?.imported?.matched || 0).toLocaleString()} link="/app/admin/imports" />
            </div>

            <div className="mt-8 grid lg:grid-cols-3 gap-5">
              <Card>
                <h3 className="text-[16px] font-extrabold">사용자 분포</h3>
                <div className="mt-4 space-y-2">
                  {(data?.users || []).map((u) => (
                    <div key={u.role} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-[#6B7280]">{u.role}</span>
                      <b className="text-[#0B0B1A]">{u.n.toLocaleString()}</b>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="text-[16px] font-extrabold">캠페인 상태</h3>
                <div className="mt-4 space-y-2">
                  {(data?.campaigns || []).map((u) => (
                    <div key={u.status} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-[#6B7280]">{u.status}</span>
                      <b className="text-[#0B0B1A]">{u.n.toLocaleString()}</b>
                    </div>
                  ))}
                  {(data?.campaigns || []).length === 0 && <div className="text-[13px] text-[#6B7280]">데이터 없음</div>}
                </div>
              </Card>
              <Card>
                <h3 className="text-[16px] font-extrabold">지원 상태</h3>
                <div className="mt-4 space-y-2">
                  {(data?.applications || []).map((u) => (
                    <div key={u.status} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-[#6B7280]">{u.status}</span>
                      <b className="text-[#0B0B1A]">{u.n.toLocaleString()}</b>
                    </div>
                  ))}
                  {(data?.applications || []).length === 0 && <div className="text-[13px] text-[#6B7280]">데이터 없음</div>}
                </div>
              </Card>
            </div>

            <Card className="mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#5B47FB]" />
                  <h3 className="text-[16px] font-extrabold">최근 관리자 활동</h3>
                </div>
                <Button as={Link} to="/app/admin/activity" size="sm" variant="soft">전체 보기</Button>
              </div>
              {(data?.recentActivity || []).length === 0 ? (
                <div className="py-8 text-center text-[#6B7280] text-[13px]">활동 기록 없음</div>
              ) : (
                <ul className="mt-4 divide-y divide-[#F1F2F6]">
                  {(data?.recentActivity || []).slice(0, 6).map((a) => (
                    <li key={a.id} className="py-3 flex items-center justify-between text-[13px]">
                      <span className="text-[#0B0B1A] font-semibold">{a.action}</span>
                      <span className="text-[11.5px] text-[#6B7280]">{a.target_type || '-'} · {new Date(a.created_at).toLocaleString('ko-KR')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <Card as={Link} to="/app/admin/broadcast" hover>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F3F1FF] text-[#4733D6] flex items-center justify-center"><Bell size={20} /></div>
                  <div>
                    <div className="font-bold text-[#0B0B1A]">공지·알림 발송</div>
                    <div className="text-[12.5px] text-[#6B7280]">사용자 그룹에게 일괄 알림</div>
                  </div>
                </div>
              </Card>
              <Card as={Link} to="/app/admin/imports" hover>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F3F1FF] text-[#4733D6] flex items-center justify-center"><Instagram size={20} /></div>
                  <div>
                    <div className="font-bold text-[#0B0B1A]">인스타 매칭 데이터</div>
                    <div className="text-[12.5px] text-[#6B7280]">CSV 임포트 · 핸들 조회</div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  )
}

function Stat({ icon: Icon, label, value, tone, link }) {
  const toneCls = tone === 'success' ? 'bg-[#ECFDF3] text-[#17804D]'
    : tone === 'warn' ? 'bg-[#FFF4DE] text-[#8A5A00]'
    : 'bg-[#F3F1FF] text-[#4733D6]'
  const Wrapper = link ? Link : 'div'
  return (
    <Wrapper to={link} className={`bg-white border border-[#EEF0F4] rounded-[18px] p-5 flex items-center gap-4 ${link ? 'hover:shadow-card transition' : ''}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneCls}`}><Icon size={20} /></div>
      <div>
        <div className="text-[12px] font-semibold text-[#6B7280]">{label}</div>
        <div className="mt-0.5 text-[18px] font-extrabold text-[#0B0B1A] tracking-tight">{value}</div>
      </div>
    </Wrapper>
  )
}
