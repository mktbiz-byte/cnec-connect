import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function Hero() {
  return (
    <section className="relative pt-16 pb-28 sm:pt-24 sm:pb-36 hero-gradient overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

      <Container className="relative">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full bg-white border border-[#E7E8EE] text-[#4733D6] text-[12.5px] font-semibold shadow-card">
              <Sparkles size={14} className="text-[#5B47FB]" />
              피처링 × CNEC — 업그레이드된 크리에이터 마케팅 플랫폼
            </div>
            <h1 className="display-1 mt-6 text-[#0B0B1A]">
              인플루언서 마케팅의 모든 순간,
              <br />
              <span className="text-[#5B47FB]">CNEC Connect</span>로<br />
              연결하고 증명합니다.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-[#4B5563] max-w-[560px]">
              1,700만+ 크리에이터 DB, 캠페인 지원·관리·메시지·결제·콘텐츠 트래킹까지.
              기업과 크리에이터가 한 플랫폼에서 유기적으로 연결됩니다.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button as={Link} to="/signup/business" size="xl" variant="primary" rightIcon={<ArrowRight size={18} />}>
                7일 무료 체험
              </Button>
              <Button as={Link} to="/signup/creator" size="xl" variant="outline">
                크리에이터로 시작하기
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-[13px] text-[#6B7280]">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="w-7 h-7 rounded-full border-2 border-white bg-[#E5E0FF]" />
                ))}
              </div>
              <span>
                <b className="text-[#0B0B1A]">16,000+</b> 브랜드가 사용 중
              </span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </Container>
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="relative rounded-[24px] bg-white border border-[#E7E8EE] shadow-elevated overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F1F2F6] flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
          <span className="ml-3 text-[12px] text-[#9CA3AF]">app.cnec.co / dashboard</span>
        </div>
        <div className="p-6 space-y-4 bg-[#FAFAFB]">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '활성 캠페인', value: '28' },
              { label: '지원자', value: '1,204' },
              { label: '평균 ROAS', value: '4.2x' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-[#E7E8EE]">
                <div className="text-[11px] font-semibold text-[#6B7280]">{s.label}</div>
                <div className="mt-1 text-[22px] font-extrabold text-[#0B0B1A] tracking-tight">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E7E8EE]">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[14px] text-[#0B0B1A]">캠페인 성과 · 지난 30일</div>
              <div className="text-[11px] text-[#6B7280]">실시간 업데이트</div>
            </div>
            <div className="mt-4 flex items-end gap-2 h-[132px]">
              {[42, 58, 70, 55, 78, 90, 65, 82, 95, 73, 88, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-[#5B47FB]"
                  style={{ height: `${h}%`, opacity: 0.35 + (h / 100) * 0.65 }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniCreator name="소라의 일상" tag="뷰티" count="245K" />
            <MiniCreator name="피트윤" tag="운동" count="420K" />
          </div>
        </div>
      </div>

      <div className="absolute -left-6 -bottom-6 hidden sm:block bg-white rounded-2xl border border-[#E7E8EE] shadow-elevated p-4 w-56">
        <div className="text-[11px] text-[#6B7280] font-semibold">신규 지원</div>
        <div className="mt-1.5 text-[13px] font-bold text-[#0B0B1A]">여름 립밤 체험단</div>
        <div className="mt-1 text-[12px] text-[#6B7280]">크리에이터 12명 지원 완료</div>
        <div className="mt-3 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
          <div className="h-full w-3/5 rounded-full bg-[#5B47FB]" />
        </div>
      </div>
    </div>
  )
}

function MiniCreator({ name, tag, count }) {
  return (
    <div className="bg-white rounded-xl p-3.5 border border-[#E7E8EE] flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#E5E0FF]" />
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-[#0B0B1A] truncate">{name}</div>
        <div className="text-[11px] text-[#6B7280]">
          {tag} · {count} 팔로워
        </div>
      </div>
    </div>
  )
}
