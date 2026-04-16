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
    <section className="py-20 sm:py-24 bg-white border-y border-[#E7E8EE]">
      <Container>
        <div className="max-w-3xl">
          <div className="eyebrow">말보다 결과로 증명합니다</div>
          <h2 className="display-2 mt-3 text-[#0B0B1A]">숫자로 보는 CNEC Connect</h2>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="border-t border-[#E7E8EE] pt-6">
              <div className="text-[34px] md:text-[42px] font-extrabold text-[#0B0B1A] tracking-tight">
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
