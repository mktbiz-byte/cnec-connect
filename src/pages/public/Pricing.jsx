import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

const PLANS = [
  {
    name: 'Starter',
    price: '무료',
    period: '',
    desc: '첫 캠페인을 시작하는 브랜드',
    features: ['활성 캠페인 1건', '크리에이터 검색', '기본 리포트', '이메일 지원'],
    cta: '무료로 시작',
    to: '/signup/business',
  },
  {
    name: 'Growth',
    price: '₩290,000',
    period: '/월',
    desc: '성장하는 브랜드·대행사',
    features: [
      '활성 캠페인 10건',
      '고급 필터·AI 추천',
      '메시지·결제·정산 자동화',
      '콘텐츠 트래킹 대시보드',
      '우선 지원',
    ],
    cta: '7일 무료 체험',
    to: '/signup/business',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '맞춤',
    period: '',
    desc: '엔터프라이즈 · 글로벌 브랜드',
    features: [
      '무제한 캠페인',
      '전담 매니저',
      'API · SSO · 권한 관리',
      '커스텀 리포트·데이터 연동',
    ],
    cta: '도입 상담',
    to: 'mailto:sales@cnec.co',
  },
]

export default function Pricing() {
  return (
    <>
      <section className="pt-20 pb-16 gradient-bg">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <div className="eyebrow">PRICING</div>
            <h1 className="display-2 mt-3">팀 규모에 맞는 요금제.</h1>
            <p className="mt-4 text-[16px] text-[#6B7280]">7일 동안 모든 기능을 무료로 써보세요. 언제든 업그레이드·취소할 수 있습니다.</p>
          </div>
        </Container>
      </section>

      <Container className="py-10 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-[24px] p-8 border ${
                p.highlighted
                  ? 'bg-[#0B0B1A] text-white border-[#0B0B1A] shadow-elevated scale-[1.02]'
                  : 'bg-white border-[#EEF0F4]'
              }`}
            >
              {p.highlighted && (
                <div className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-gradient-to-r from-[#5B47FB] to-[#00C2A8] text-white text-[11px] font-bold">
                  가장 인기
                </div>
              )}
              <div className={`mt-3 text-[22px] font-extrabold ${p.highlighted ? 'text-white' : 'text-[#0B0B1A]'}`}>{p.name}</div>
              <div className={`mt-1 text-[13px] ${p.highlighted ? 'text-white/70' : 'text-[#6B7280]'}`}>{p.desc}</div>
              <div className="mt-6 flex items-end gap-1">
                <div className={`text-[36px] font-extrabold tracking-tight ${p.highlighted ? 'text-white' : 'text-[#0B0B1A]'}`}>{p.price}</div>
                <div className={`pb-2 text-[13px] ${p.highlighted ? 'text-white/60' : 'text-[#6B7280]'}`}>{p.period}</div>
              </div>
              <ul className={`mt-6 flex flex-col gap-2.5 text-[14px] ${p.highlighted ? 'text-white/90' : 'text-[#333452]'}`}>
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check size={16} className={p.highlighted ? 'text-[#00E8C8] mt-0.5' : 'text-[#00C2A8] mt-0.5'} /> {f}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  as={p.to.startsWith('mailto:') ? 'a' : Link}
                  to={p.to.startsWith('mailto:') ? undefined : p.to}
                  href={p.to.startsWith('mailto:') ? p.to : undefined}
                  variant={p.highlighted ? 'primary' : 'outline'}
                  size="lg"
                  fullWidth
                  className={p.highlighted ? '!bg-white !text-[#0B0B1A] hover:!bg-[#F3F4F6]' : ''}
                >
                  {p.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  )
}
