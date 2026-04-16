import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone, Inbox, Wallet } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

function formatMoney(n) { return (n || 0).toLocaleString() + '원' }

const STATUS_LABEL = { pending: '검토 중', accepted: '확정', rejected: '거절', withdrawn: '철회' }
const STATUS_TONE = { pending: 'warn', accepted: 'success', rejected: 'danger', withdrawn: 'neutral' }

export default function CreatorDashboard() {
  const { profile, user } = useAuth()
  const [apps, setApps] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api('/api/applications/mine').catch(() => ({ data: [] })),
      api('/api/campaigns?status=recruiting', { auth: false }).catch(() => ({ data: [] })),
    ]).then(([a, c]) => {
      setApps(a.data || [])
      setCampaigns(c.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const pending = apps.filter((a) => a.status === 'pending').length
  const accepted = apps.filter((a) => a.status === 'accepted').length

  return (
    <>
      <PageHeader
        title={`안녕하세요, ${profile?.display_name || user?.email} 👋`}
        subtitle="오늘도 맞춤 캠페인을 확인해보세요."
        actions={
          <Button as={Link} to="/app/creator/campaigns" variant="primary" rightIcon={<ArrowRight size={16} />}>
            캠페인 탐색
          </Button>
        }
      />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={Inbox} label="지원 중" value={pending} tone="bg-[#F2EFFF] text-[#4735D1]" />
          <StatCard icon={Megaphone} label="확정된 캠페인" value={accepted} tone="bg-[#DEFFF8] text-[#006E60]" />
          <StatCard icon={Wallet} label="예상 수익" value={formatMoney(accepted * 500000)} tone="bg-[#FFF4DE] text-[#8A5A00]" />
        </div>

        <div className="mt-8 grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-extrabold text-[#0B0B1A]">최근 지원</h3>
              <Link to="/app/creator/applications" className="text-[13px] font-semibold text-[#5B47FB]">전체 보기</Link>
            </div>
            {loading ? (
              <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
            ) : apps.length === 0 ? (
              <div className="py-10 text-center text-[#6B7280] text-[13.5px]">아직 지원한 캠페인이 없습니다.</div>
            ) : (
              <div className="mt-5 divide-y divide-[#F1F2F6]">
                {apps.slice(0, 5).map((a) => (
                  <div key={a.id} className="py-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5B47FB] to-[#00C2A8]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold text-[#0B0B1A] truncate">{a.campaign_title}</div>
                      <div className="text-[11.5px] text-[#6B7280]">{a.company_name} · 지원일 {new Date(a.applied_at).toLocaleDateString('ko-KR')}</div>
                    </div>
                    <Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-extrabold text-[#0B0B1A]">추천 캠페인</h3>
              <Link to="/app/creator/campaigns" className="text-[13px] font-semibold text-[#5B47FB]">더 보기</Link>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {campaigns.slice(0, 4).map((c) => (
                <Link key={c.id} to={`/campaigns/${c.id}`} className="block p-4 rounded-[14px] border border-[#F1F2F6] hover:border-[#0B0B1A] transition">
                  <div className="text-[12px] font-bold text-[#5B47FB]">{c.category}</div>
                  <div className="mt-1 text-[14px] font-extrabold text-[#0B0B1A] line-clamp-1">{c.title}</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">{c.company_name}</div>
                </Link>
              ))}
              {campaigns.length === 0 && <div className="text-[#6B7280] text-[13px]">모집 중인 캠페인이 없습니다.</div>}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white border border-[#EEF0F4] rounded-[18px] p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}><Icon size={20} /></div>
      <div>
        <div className="text-[12px] font-semibold text-[#6B7280]">{label}</div>
        <div className="mt-0.5 text-[22px] font-extrabold text-[#0B0B1A]">{value}</div>
      </div>
    </div>
  )
}
