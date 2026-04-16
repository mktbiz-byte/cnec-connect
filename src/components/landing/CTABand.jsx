import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function CTABand() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative rounded-[32px] p-10 md:p-16 overflow-hidden bg-gradient-to-br from-[#F2EFFF] via-white to-[#DEFFF8] border border-[#EEF0F4]">
          <div
            className="absolute -top-24 -right-16 w-96 h-96 rounded-full blur-3xl opacity-50 pointer-events-none"
            style={{ background: 'radial-gradient(closest-side, #9C8AFF, transparent)' }}
          />
          <div className="relative max-w-2xl">
            <div className="eyebrow">7일 무료 체험</div>
            <h3 className="mt-3 display-2">
              지금 바로 <span className="gradient-text">CNEC Connect</span>를 써보세요.
            </h3>
            <p className="mt-4 text-[16.5px] text-[#333452]">
              신용카드 등록 없이 7일 무료로 캠페인 생성부터 지원, 메시지까지 전 과정을 체험할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/signup/business" size="xl" variant="primary" rightIcon={<ArrowRight size={18} />}>
                브랜드로 무료 체험
              </Button>
              <Button as={Link} to="/signup/creator" size="xl" variant="outline">
                크리에이터로 가입
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
