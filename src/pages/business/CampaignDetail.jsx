import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

export default function CampaignDetail() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = () => {
    setLoading(true)
    Promise.all([
      api(`/api/campaigns/${id}`, { auth: false }),
      api(`/api/campaigns/${id}/applications`).catch(() => ({ data: [] })),
    ])
      .then(([c, a]) => { setCampaign(c.data); setApps(a.data || []) })
      .finally(() => setLoading(false))
  }

  useEffect(reload, [id])

  const decide = async (appId, status) => {
    await api(`/api/applications/${appId}/decision`, { method: 'PATCH', body: { status } })
    reload()
  }

  const payEscrow = async (app) => {
    const defaultAmount = app.proposed_budget || campaign.budget_min || 0
    const raw = prompt(`에스크로로 결제할 금액(원)을 입력하세요.`, String(defaultAmount))
    if (!raw) return
    const amount = Number(raw)
    if (!Number.isFinite(amount) || amount <= 0) { alert('올바른 금액을 입력하세요.'); return }
    try {
      await api('/api/payments/intent', { method: 'POST', body: { applicationId: app.id, amount } })
      alert('에스크로 결제가 생성되었습니다. 결제·정산 페이지에서 관리하세요.')
    } catch (e) {
      alert('결제 생성에 실패했습니다: ' + e.message)
    }
  }

  if (loading) return <div className="py-24 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
  if (!campaign) return <div className="py-24 text-center text-[#6B7280]">캠페인을 찾을 수 없습니다.</div>

  return (
    <>
      <PageHeader title={campaign.title} subtitle={`${campaign.category} · ${campaign.company_name}`} />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-[16px] font-extrabold">상세 내용</h3>
          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[#333452]">{campaign.description}</p>
          {campaign.requirements && (
            <div className="mt-6 p-4 rounded-xl bg-[#FAFAFB] text-[13.5px]">
              <div className="font-bold text-[#0B0B1A] mb-1">요구사항</div>
              <div className="text-[#333452] whitespace-pre-wrap">{campaign.requirements}</div>
            </div>
          )}
        </Card>
        <Card>
          <h3 className="text-[16px] font-extrabold">캠페인 정보</h3>
          <dl className="mt-4 text-[13.5px] space-y-2">
            <Row k="상태"><Badge tone={campaign.status === 'recruiting' ? 'success' : 'neutral'}>{campaign.status}</Badge></Row>
            <Row k="예산">{(campaign.budget_min || 0).toLocaleString()} ~ {(campaign.budget_max || 0).toLocaleString()}원</Row>
            <Row k="모집 인원">{campaign.recruit_count}명</Row>
            <Row k="플랫폼">{(campaign.platforms || []).join(', ') || '-'}</Row>
            <Row k="기간">{campaign.start_date || '-'} ~ {campaign.end_date || '-'}</Row>
            <Row k="지원 마감">{campaign.apply_deadline || '-'}</Row>
          </dl>
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-extrabold">지원자 ({apps.length})</h3>
          </div>
          {apps.length === 0 ? (
            <div className="mt-6 py-10 text-center text-[#6B7280]">아직 지원자가 없습니다.</div>
          ) : (
            <div className="mt-5 divide-y divide-[#F1F2F6]">
              {apps.map((a) => (
                <div key={a.id} className="py-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5B47FB] to-[#00C2A8] text-white flex items-center justify-center font-bold">
                    {a.display_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] text-[#0B0B1A]">{a.display_name} <span className="text-[12px] font-normal text-[#6B7280]">@{a.handle}</span></div>
                    <div className="text-[12px] text-[#6B7280]">팔로워 {Number(a.followers_total || 0).toLocaleString()} · ER {Number(a.engagement_rate || 0).toFixed(1)}%</div>
                    {a.message && <div className="mt-1 text-[12.5px] text-[#333452] line-clamp-2">{a.message}</div>}
                  </div>
                  <div className="text-right">
                    <Badge tone={a.status === 'pending' ? 'warn' : a.status === 'accepted' ? 'success' : 'danger'}>
                      {a.status === 'pending' ? '검토중' : a.status === 'accepted' ? '확정' : '거절'}
                    </Badge>
                    {a.status === 'pending' && (
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="primary" onClick={() => decide(a.id, 'accepted')}>확정</Button>
                        <Button size="sm" variant="outline" onClick={() => decide(a.id, 'rejected')}>거절</Button>
                      </div>
                    )}
                    {a.status === 'accepted' && (
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="soft" onClick={() => payEscrow(a)}>에스크로 결제</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function Row({ k, children }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#6B7280]">{k}</dt>
      <dd className="text-[#0B0B1A] font-semibold">{children}</dd>
    </div>
  )
}
