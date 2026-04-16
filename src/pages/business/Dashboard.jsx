import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Card, { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'
import { FilePlus, Megaphone, Users, BarChart3 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function BusinessDashboard() {
  const { profile, user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/campaigns?mine=true').then((r) => setCampaigns(r.data || [])).finally(() => setLoading(false))
  }, [])

  const active = campaigns.filter((c) => c.status === 'recruiting' || c.status === 'in_progress').length

  return (
    <>
      <PageHeader
        title={`안녕하세요, ${profile?.company_name || user?.email} 👋`}
        subtitle="지금 진행 중인 캠페인 현황을 한눈에 확인하세요."
        actions={
          <Button as={Link} to="/app/business/campaigns/new" leftIcon={<FilePlus size={16} />}>
            새 캠페인
          </Button>
        }
      />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={Megaphone} label="활성 캠페인" value={active} />
          <Stat icon={Users} label="총 지원자" value={campaigns.reduce((s, c) => s + (c.apps_count || 0), 0)} />
          <Stat icon={BarChart3} label="평균 ROAS" value="4.2x" />
          <Stat icon={Megaphone} label="완료 캠페인" value={campaigns.filter((c) => c.status === 'completed').length} />
        </div>

        <Card className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-extrabold text-[#0B0B1A]">내 캠페인</h3>
            <Link to="/app/business/campaigns" className="text-[13px] font-semibold text-[#5B47FB]">전체 보기</Link>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
          ) : campaigns.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">
              아직 캠페인이 없습니다.
              <div className="mt-5"><Button as={Link} to="/app/business/campaigns/new">첫 캠페인 만들기</Button></div>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-[#F1F2F6]">
              {campaigns.slice(0, 6).map((c) => (
                <div key={c.id} className="py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#5B47FB]" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#0B0B1A] text-[14px] truncate">{c.title}</div>
                    <div className="text-[12px] text-[#6B7280]">{c.category} · {new Date(c.created_at).toLocaleDateString('ko-KR')}</div>
                  </div>
                  <Badge tone={c.status === 'recruiting' ? 'success' : c.status === 'completed' ? 'neutral' : 'brand'}>
                    {c.status === 'recruiting' ? '모집중' : c.status === 'completed' ? '완료' : c.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-[#EEF0F4] rounded-[18px] p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#F3F1FF] text-[#4733D6] flex items-center justify-center"><Icon size={20} /></div>
      <div>
        <div className="text-[12px] font-semibold text-[#6B7280]">{label}</div>
        <div className="mt-0.5 text-[22px] font-extrabold text-[#0B0B1A]">{value}</div>
      </div>
    </div>
  )
}
