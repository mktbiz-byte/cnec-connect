import { Link } from 'react-router-dom'
import { Building2, UserRound, ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function DualCTA() {
  return (
    <section id="solutions" className="py-24 sm:py-32">
      <Container>
        <div className="max-w-3xl">
          <div className="eyebrow">기업 · 크리에이터</div>
          <h2 className="display-2 mt-3">
            누구에게나, 가장 효율적인 방식.
          </h2>
          <p className="mt-4 text-[16px] text-[#6B7280]">
            기업과 크리에이터 각각의 입장에서 꼭 필요한 기능만, 가장 빠른 흐름으로 설계했습니다.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          <Card
            accent="bg-gradient-to-br from-[#1A0F5C] via-[#2A1E7A] to-[#5B47FB]"
            icon={Building2}
            eyebrow="FOR BRANDS"
            title="브랜드에 맞는 크리에이터를 발견하고, 성과까지 한 번에."
            items={[
              '고급 필터로 인플루언서 검색',
              '캠페인 마법사로 5분 안에 발행',
              '지원자 관리·메시지·결제 통합',
              '실시간 성과 트래킹·리포트',
            ]}
            ctaTo="/signup/business"
            ctaLabel="브랜드로 시작하기"
          />
          <Card
            accent="bg-gradient-to-br from-[#003F3A] via-[#007469] to-[#00C2A8]"
            icon={UserRound}
            eyebrow="FOR CREATORS"
            title="맞춤 캠페인을 제안받고, 안전하게 정산받으세요."
            items={[
              '나에게 맞는 캠페인 자동 매칭',
              '1-클릭 지원 + 포트폴리오 노출',
              '에스크로 보호로 안전한 정산',
              '성과 기반 추천으로 다음 기회',
            ]}
            ctaTo="/signup/creator"
            ctaLabel="크리에이터로 시작하기"
          />
        </div>
      </Container>
    </section>
  )
}

function Card({ accent, icon: Icon, eyebrow, title, items, ctaTo, ctaLabel }) {
  return (
    <div className={`relative rounded-[28px] p-8 md:p-10 text-white overflow-hidden ${accent}`}>
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-white/10 border border-white/20 text-[11.5px] font-bold tracking-wider">
          <Icon size={14} /> {eyebrow}
        </div>
        <h3 className="mt-5 text-[28px] md:text-[32px] font-extrabold leading-tight tracking-tight">{title}</h3>
        <ul className="mt-6 flex flex-col gap-2.5">
          {items.map((it) => (
            <li key={it} className="flex items-center gap-2 text-[14.5px] text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              {it}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button as={Link} to={ctaTo} variant="secondary" className="!bg-white !text-[#0B0B1A] hover:!bg-[#F3F4F6]" rightIcon={<ArrowRight size={16} />}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
