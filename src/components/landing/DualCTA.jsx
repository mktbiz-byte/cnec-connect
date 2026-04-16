import { Link } from 'react-router-dom'
import { Building2, UserRound, ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function DualCTA() {
  return (
    <section id="solutions" className="py-24 sm:py-32 bg-white">
      <Container>
        <div className="max-w-3xl">
          <div className="eyebrow">기업 · 크리에이터</div>
          <h2 className="display-2 mt-3 text-[#0B0B1A]">누구에게나, 가장 효율적인 방식.</h2>
          <p className="mt-4 text-[16px] text-[#6B7280]">
            기업과 크리에이터 각각의 입장에서 꼭 필요한 기능만, 가장 빠른 흐름으로 설계했습니다.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          <Card
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
            dark
          />
          <Card
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

function Card({ dark, icon: Icon, eyebrow, title, items, ctaTo, ctaLabel }) {
  const base = dark
    ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]'
    : 'bg-white text-[#0B0B1A] border-[#E7E8EE]'
  return (
    <div className={`relative rounded-[24px] p-8 md:p-10 border ${base}`}>
      <div
        className={`inline-flex items-center gap-2 h-7 px-3 rounded-full text-[11px] font-bold tracking-[0.12em] ${
          dark ? 'bg-white/10 text-white' : 'bg-[#F3F1FF] text-[#4733D6]'
        }`}
      >
        <Icon size={14} /> {eyebrow}
      </div>
      <h3 className={`mt-5 text-[26px] md:text-[30px] font-extrabold leading-tight tracking-tight ${dark ? 'text-white' : 'text-[#0B0B1A]'}`}>
        {title}
      </h3>
      <ul className={`mt-6 flex flex-col gap-2.5 text-[14.5px] ${dark ? 'text-white/85' : 'text-[#4B5563]'}`}>
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white' : 'bg-[#5B47FB]'}`} />
            {it}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button
          as={Link}
          to={ctaTo}
          variant={dark ? 'secondary' : 'primary'}
          className={dark ? '!bg-white !text-[#0B0B1A] hover:!bg-[#F3F4F6]' : ''}
          rightIcon={<ArrowRight size={16} />}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}
