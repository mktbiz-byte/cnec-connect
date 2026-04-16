import Container from '@/components/ui/Container'

export default function About() {
  return (
    <>
      <section className="pt-20 pb-12 gradient-bg">
        <Container>
          <div className="max-w-3xl">
            <div className="eyebrow">WHY CNEC</div>
            <h1 className="display-2 mt-3">크리에이터 경제의 다음 표준을 만듭니다.</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-[#333452]">
              CNEC Connect는 피처링의 데이터·성과 분석 노하우와, CNEC의 크리에이터 네트워크를 결합해
              <br /> 브랜드와 크리에이터가 더 투명하고 효율적으로 협업하는 기반을 제공합니다.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { t: '데이터로 증명', d: '모든 캠페인은 실시간 성과 데이터로 검증됩니다. ROAS·ER·도달을 숫자로 확인하세요.' },
            { t: '통합된 경험', d: '탐색·지원·계약·정산·트래킹까지 한 플랫폼에서 끊김 없이.' },
            { t: '양쪽 모두 공정', d: '에스크로 결제와 투명한 매칭으로 크리에이터·브랜드 모두를 보호합니다.' },
          ].map((x) => (
            <div key={x.t} className="p-8 rounded-[22px] bg-white border border-[#EEF0F4]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B47FB] to-[#00C2A8]" />
              <h3 className="mt-5 text-[20px] font-extrabold text-[#0B0B1A]">{x.t}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[#6B7280]">{x.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </>
  )
}
