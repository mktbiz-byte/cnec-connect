import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Card'
import { api } from '@/lib/api'

const STATUS_LABEL = { pending: '검토 중', accepted: '확정', rejected: '거절', withdrawn: '철회' }
const STATUS_TONE = { pending: 'warn', accepted: 'success', rejected: 'danger', withdrawn: 'neutral' }

export default function Applications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/applications/mine').then((r) => setApps(r.data || [])).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="내 지원 현황" subtitle="지원한 캠페인의 진행 상황을 확인하세요." />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : apps.length === 0 ? (
          <div className="py-24 text-center text-[#6B7280]">아직 지원한 캠페인이 없습니다. <Link to="/app/creator/campaigns" className="text-[#5B47FB] font-bold">캠페인 탐색하기 →</Link></div>
        ) : (
          <div className="bg-white border border-[#EEF0F4] rounded-[18px] overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_120px_120px] px-5 py-3 border-b border-[#F1F2F6] text-[12px] font-bold text-[#6B7280] bg-[#FAFAFB]">
              <div>캠페인</div>
              <div>예산 제안</div>
              <div>지원일</div>
              <div>상태</div>
            </div>
            {apps.map((a) => (
              <Link to={`/campaigns/${a.campaign_id}`} key={a.id} className="grid grid-cols-[1fr_120px_120px_120px] px-5 py-4 border-b border-[#F1F2F6] hover:bg-[#FAFAFB] items-center text-[13.5px]">
                <div className="min-w-0">
                  <div className="font-bold text-[#0B0B1A] truncate">{a.campaign_title}</div>
                  <div className="text-[11.5px] text-[#6B7280]">{a.company_name}</div>
                </div>
                <div className="text-[#0B0B1A] font-semibold">{a.proposed_budget ? `${a.proposed_budget.toLocaleString()}원` : '-'}</div>
                <div className="text-[#6B7280]">{new Date(a.applied_at).toLocaleDateString('ko-KR')}</div>
                <div><Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
