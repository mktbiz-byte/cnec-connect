import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Container from '@/components/ui/Container'
import Card, { Badge } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

function formatMoney(n) { return `${(n || 0).toLocaleString()}원` }

export default function PublicCampaignDetail() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [budget, setBudget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api(`/api/campaigns/${id}`, { auth: false })
      .then((r) => setCampaign(r.data))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false))
  }, [id])

  const apply = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login/creator'); return }
    if (user.role !== 'creator') { setError('크리에이터 계정으로 지원할 수 있습니다.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await api('/api/applications', {
        method: 'POST',
        body: { campaignId: id, message: msg || undefined, proposedBudget: budget ? Number(budget) : undefined },
      })
      setResult('ok')
    } catch (err) {
      if (err.message === 'ALREADY_APPLIED') setResult('already')
      else setError('지원에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="py-24 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
  if (!campaign) return <Container className="py-24 text-center"><h1 className="display-2">캠페인을 찾을 수 없습니다</h1></Container>

  return (
    <>
      <section className="gradient-bg pt-16 pb-10">
        <Container>
          <Badge tone="brand">{campaign.category}</Badge>
          <h1 className="display-2 mt-3">{campaign.title}</h1>
          <div className="mt-3 text-[14.5px] text-[#6B7280]">{campaign.company_name}</div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-[16px] font-extrabold">상세 내용</h3>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[14.5px] text-[#333452]">{campaign.description}</p>
            </Card>
            {campaign.requirements && (
              <Card>
                <h3 className="text-[16px] font-extrabold">요구사항</h3>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[14.5px] text-[#333452]">{campaign.requirements}</p>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-[16px] font-extrabold">캠페인 정보</h3>
              <dl className="mt-4 text-[13.5px] space-y-2">
                <Row k="예산">{formatMoney(campaign.budget_min)} ~ {formatMoney(campaign.budget_max)}</Row>
                <Row k="모집">{campaign.recruit_count}명</Row>
                <Row k="플랫폼">{(campaign.platforms || []).join(', ') || '-'}</Row>
                <Row k="기간">{campaign.start_date || '-'} ~ {campaign.end_date || '-'}</Row>
                <Row k="지원 마감">{campaign.apply_deadline || '-'}</Row>
              </dl>
            </Card>

            <Card>
              <h3 className="text-[16px] font-extrabold">지원하기</h3>
              {result === 'ok' ? (
                <div className="mt-4 p-4 rounded-xl bg-[#DEFFE5] text-[#0E7A3C] text-[13.5px]">지원이 접수되었습니다. 결과는 이메일과 대시보드에서 확인할 수 있습니다.</div>
              ) : result === 'already' ? (
                <div className="mt-4 p-4 rounded-xl bg-[#FFF4DE] text-[#8A5A00] text-[13.5px]">이미 지원한 캠페인입니다.</div>
              ) : (
                <form onSubmit={apply} className="mt-4 space-y-3">
                  <Input as="textarea" label="지원 메시지 (선택)" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="브랜드에 어필할 포인트를 짧게 적어주세요." />
                  <Input label="희망 예산 (원, 선택)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="예: 800000" />
                  {error && <div className="text-[13px] text-[#FF5A5A]">{error}</div>}
                  {user ? (
                    <Button type="submit" size="lg" fullWidth loading={submitting}>지원하기</Button>
                  ) : (
                    <Button as={Link} to="/login/creator" size="lg" fullWidth>지원하려면 로그인</Button>
                  )}
                </form>
              )}
            </Card>
          </div>
        </div>
      </Container>
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
