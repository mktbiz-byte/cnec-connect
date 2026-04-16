import { Link } from 'react-router-dom'
import Container from './Container'
import Logo from './Logo'

const COLS = [
  {
    title: '제품',
    items: [
      { label: '크리에이터 탐색', to: '/creators/explore' },
      { label: '기능 소개', to: '/#pillars' },
      { label: '가격 안내', to: '/pricing' },
    ],
  },
  {
    title: '이용 대상',
    items: [
      { label: '브랜드·대행사', to: '/signup/business' },
      { label: '크리에이터', to: '/signup/creator' },
      { label: '공개 캠페인', to: '/#open' },
    ],
  },
  {
    title: '리소스',
    items: [
      { label: 'CNEC 소개', to: '/about' },
      { label: '고객 사례', to: '/#cases' },
      { label: '블로그', to: '#' },
    ],
  },
  {
    title: '회사',
    items: [
      { label: '이용약관', to: '#' },
      { label: '개인정보처리방침', to: '#' },
      { label: '문의하기', to: 'mailto:hello@cnec.co' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#EEF0F4] bg-[#FAFAFB]">
      <Container>
        <div className="py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Logo />
            <p className="mt-5 text-[14px] leading-relaxed text-[#6B7280] max-w-xs">
              인플루언서 마케팅의 모든 순간, CNEC Connect로.
              <br />
              크리에이터 · 브랜드를 위한 통합 플랫폼.
            </p>
            <p className="mt-6 text-[12px] text-[#9CA3AF]">© {new Date().getFullYear()} CNEC. All rights reserved.</p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold text-[#0B0B1A] mb-3.5">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((it) => (
                  <li key={it.label}>
                    {it.to.startsWith('#') || it.to.startsWith('mailto:') ? (
                      <a href={it.to} className="text-[13.5px] text-[#6B7280] hover:text-[#0B0B1A]">{it.label}</a>
                    ) : (
                      <Link to={it.to} className="text-[13.5px] text-[#6B7280] hover:text-[#0B0B1A]">{it.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </footer>
  )
}
