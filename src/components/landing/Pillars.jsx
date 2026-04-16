import { Search, Users2, LineChart, CheckCircle2 } from 'lucide-react'
import Container from '@/components/ui/Container'

const PILLARS = [
  {
    icon: Search,
    title: '탐색',
    headline: '딱 맞는 크리에이터를 10초 만에',
    desc: '1,700만+ 프로필에서 브랜드에 맞는 크리에이터를 필터·AI 추천·유사 프로필 탐색으로 정확히 찾아냅니다.',
    bullets: ['지역/카테고리/플랫폼 복합 필터', 'AI 리스트업·유사 크리에이터', '실시간 팔로워·ER 분석'],
  },
  {
    icon: Users2,
    title: '관리',
    headline: '지원·확정·메시지·계약까지 한 화면',
    desc: '캠페인 지원부터 확정, 메시지, 계약, 콘텐츠 승인까지 모든 흐름이 CNEC Connect 안에서 끊기지 않습니다.',
    bullets: ['캠페인 마법사 4-step', '지원자 자동 매칭·랭킹', '에스크로 결제·정산 자동화'],
  },
  {
    icon: LineChart,
    title: '분석',
    headline: '성과는 실시간, 리포트는 자동',
    desc: '게시물 URL 하나로 조회수·좋아요·ER·ROAS를 자동 집계. 브랜드는 실시간 대시보드, 크리에이터는 내 정산 내역을 확인합니다.',
    bullets: ['콘텐츠 자동 트래킹', '커스텀 리포트 PDF 내보내기', '업종별 벤치마크 대시보드'],
  },
]

export default function Pillars() {
  return (
    <section id="pillars" className="py-24 sm:py-32 bg-[#FAFAFB]">
      <Container>
        <div className="max-w-3xl">
          <div className="eyebrow">탐색 · 관리 · 분석</div>
          <h2 className="display-2 mt-3 text-[#0B0B1A]">
            인플루언서 마케팅의 처음부터 끝까지,
            <br />
            하나의 플랫폼에서.
          </h2>
        </div>

        <div className="mt-14 grid gap-5">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="relative bg-white border border-[#E7E8EE] rounded-[24px] p-8 md:p-12 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-[#F3F1FF] text-[12px] font-bold text-[#4733D6]">
                    0{i + 1}. {p.title}
                  </div>
                  <h3 className="mt-4 text-[26px] md:text-[32px] font-extrabold text-[#0B0B1A] tracking-tight leading-tight">
                    {p.headline}
                  </h3>
                  <p className="mt-4 text-[15.5px] leading-relaxed text-[#4B5563] max-w-[520px]">{p.desc}</p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-[14px] text-[#0B0B1A]">
                        <CheckCircle2 size={18} className="text-[#5B47FB]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <PillarVisual icon={p.icon} index={i} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

function PillarVisual({ icon: Icon, index }) {
  return (
    <div className="relative h-[280px] md:h-[340px] rounded-[18px] bg-[#FAFAFB] border border-[#E7E8EE] overflow-hidden">
      {index === 0 && <ExploreMock />}
      {index === 1 && <ManageMock />}
      {index === 2 && <AnalyticsMock />}
      <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-[#0B0B1A] text-white inline-flex items-center justify-center">
        <Icon size={20} />
      </div>
    </div>
  )
}

function ExploreMock() {
  const items = [
    { name: '소라의 일상', tag: '뷰티', f: '245K', er: '5.2%' },
    { name: '트래블케이', tag: '여행', f: '700K', er: '4.1%' },
    { name: '피트윤', tag: '운동', f: '420K', er: '6.1%' },
    { name: '펫러버', tag: '반려동물', f: '360K', er: '7.0%' },
  ]
  return (
    <div className="p-5 pt-12">
      <div className="flex items-center gap-2">
        <div className="h-9 px-3 rounded-lg bg-white border border-[#E7E8EE] inline-flex items-center text-[12px] text-[#6B7280]">뷰티 · 카테고리</div>
        <div className="h-9 px-3 rounded-lg bg-white border border-[#E7E8EE] inline-flex items-center text-[12px] text-[#6B7280]">팔로워 10만+</div>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((it) => (
          <div key={it.name} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E7E8EE]">
            <div className="w-9 h-9 rounded-full bg-[#E5E0FF]" />
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#0B0B1A]">{it.name}</div>
              <div className="text-[11px] text-[#6B7280]">{it.tag}</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-semibold text-[#0B0B1A]">{it.f}</div>
              <div className="text-[11px] text-[#5B47FB] font-semibold">ER {it.er}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ManageMock() {
  const steps = ['지원 접수', '심사', '확정', '콘텐츠 검수', '정산']
  return (
    <div className="p-5 pt-12">
      <div className="text-[12.5px] font-bold text-[#0B0B1A]">캠페인 워크플로우</div>
      <div className="mt-4 space-y-2.5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${
                i < 3 ? 'bg-[#5B47FB] text-white' : 'bg-white border border-[#E7E8EE] text-[#9CA3AF]'
              }`}
            >
              {i + 1}
            </div>
            <div className="flex-1 text-[13px] font-semibold text-[#0B0B1A]">{s}</div>
            <div className={`text-[11px] font-bold ${i < 3 ? 'text-[#5B47FB]' : 'text-[#9CA3AF]'}`}>
              {i < 3 ? '완료' : '대기'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsMock() {
  return (
    <div className="p-5 pt-12">
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: '노출', v: '1.2M' },
          { l: 'ER', v: '5.1%' },
          { l: 'ROAS', v: '4.3x' },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-white border border-[#E7E8EE] p-3">
            <div className="text-[10.5px] text-[#6B7280]">{s.l}</div>
            <div className="text-[17px] font-extrabold text-[#0B0B1A]">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-end gap-1 h-[110px]">
        {[32, 48, 56, 68, 50, 72, 86, 74, 92, 80, 95, 100].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm bg-[#5B47FB]" style={{ height: `${h}%`, opacity: 0.3 + (h / 100) * 0.7 }} />
        ))}
      </div>
    </div>
  )
}
