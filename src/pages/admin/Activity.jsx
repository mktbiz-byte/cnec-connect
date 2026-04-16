import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import { api } from '@/lib/api'

const LABEL = {
  verify_toggle: '인증 토글', suspend: '정지', unsuspend: '정지 해제',
  role_change: '역할 변경', delete_user: '사용자 삭제',
  campaign_status: '캠페인 상태 변경', delete_campaign: '캠페인 삭제',
  application_force: '지원 강제 변경', content_approve: '콘텐츠 승인',
  content_reject: '콘텐츠 반려', content_delete: '콘텐츠 삭제',
  force_release: '정산 강제 실행', refund: '환불', broadcast: '공지 발송',
}

export default function AdminActivity() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/admin/activity').then((r) => setRows(r.data || [])).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="활동 피드" subtitle="관리자가 수행한 최근 100건의 액션 로그" />
      <div className="px-6 md:px-10 py-8 max-w-[980px] mx-auto">
        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <Card className="py-16 text-center text-[#6B7280]">활동 기록이 없습니다.</Card>
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-[#F1F2F6]">
              {rows.map((a) => (
                <li key={a.id} className="px-6 py-4 flex items-start gap-4">
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-[#5B47FB]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px]">
                      <b className="text-[#0B0B1A]">{LABEL[a.action] || a.action}</b>
                      <span className="text-[#6B7280]"> · {a.target_type || '-'}</span>
                      {a.meta && Object.keys(a.meta).length > 0 && (
                        <span className="text-[12px] text-[#9CA3AF] ml-2">{JSON.stringify(a.meta)}</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-[#6B7280]">{a.actor_email || '-'} · {new Date(a.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  )
}
