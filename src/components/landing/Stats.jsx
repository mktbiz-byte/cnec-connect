import Container from '@/components/ui/Container'

const STATS = [
  { value: '16,000+', label: '사용 브랜드' },
  { value: '1,700만+', label: '크리에이터 DB' },
  { value: '4.0x', label: '평균 ROAS' },
  { value: '40%', label: '운영 리소스 절감' },
  { value: '25%', label: '비용 절감' },
]

export default function Stats() {
  return (
    <section className="py-16 sm:py-20 border-y border-[#EEF0F4] bg-white">
      <Container>
        <div className="eyebrow">말보다 결과로 증명합니다</div>
        <h2 className="display-2 mt-3">숫자로 보는 CNEC Connect</h2>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="border-t border-[#EEF0F4] pt-5">
              <div className="text-[36px] md:text-[44px] font-extrabold text-[#0B0B1A] tracking-tight">
                {s.value}
              </div>
              <div className="mt-2 text-[13.5px] text-[#6B7280]">{s.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
