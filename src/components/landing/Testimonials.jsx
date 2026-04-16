import Container from '@/components/ui/Container'

const QUOTES = [
  {
    who: '김OO 마케팅 매니저',
    company: 'K뷰티 브랜드',
    q: '크리에이터 리스팅부터 정산까지 한 곳에서 끝납니다. 엑셀·카톡으로 하던 관리가 통합되니 팀 리소스가 40% 줄었습니다.',
  },
  {
    who: '이OO 퍼포먼스 리드',
    company: '글로벌 D2C',
    q: '데이터 기반으로 크리에이터를 선정할 수 있어서, 시즌마다 ROAS가 3배 이상 개선됐습니다.',
  },
  {
    who: '박OO 브랜드 매니저',
    company: '생활용품 스타트업',
    q: '공개 캠페인으로 지원받고, 진행 상황을 실시간으로 볼 수 있어요. 소규모 팀에 꼭 필요한 도구입니다.',
  },
]

const LOGOS = ['OLIVE', 'COSRX', 'MURAKAMI', 'NEXON', 'BASKIN', 'LOTTE', 'INNOCEAN', 'CJ']

export default function Testimonials() {
  return (
    <section id="cases" className="py-24 sm:py-32 bg-[#0B0B1A] text-white">
      <Container>
        <div className="max-w-3xl">
          <div className="eyebrow !text-[#9C8AFF]">고객의 이야기</div>
          <h2 className="display-2 mt-3 text-white">
            <span className="gradient-text">결과로</span> 증명된 플랫폼.
          </h2>
          <p className="mt-4 text-[16px] text-white/70">
            규모에 상관없이, 1인 크리에이터부터 엔터프라이즈까지 CNEC Connect를 선택합니다.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {QUOTES.map((t) => (
            <blockquote key={t.who} className="rounded-[22px] bg-white/5 border border-white/10 p-7">
              <div className="text-[15.5px] leading-relaxed text-white/90">“{t.q}”</div>
              <footer className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B47FB] to-[#00C2A8]" />
                <div>
                  <div className="text-[13px] font-bold">{t.who}</div>
                  <div className="text-[11.5px] text-white/60">{t.company}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-white/10">
          <div className="text-[12.5px] font-semibold text-white/50 text-center">이미 함께하고 있는 브랜드</div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-5 items-center">
            {LOGOS.map((l) => (
              <div
                key={l}
                className="h-11 flex items-center justify-center text-[13px] font-extrabold tracking-[0.16em] text-white/60 hover:text-white transition"
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
