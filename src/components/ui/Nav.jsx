import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import Button from './Button'
import Container from './Container'
import { cn } from '@/lib/cn'
import { useAuth } from '@/context/AuthContext'
import { Menu, X } from 'lucide-react'

const MENU = [
  { to: '/#solutions', label: '솔루션' },
  { to: '/#pillars', label: '기능' },
  { to: '/pricing', label: '가격' },
  { to: '/creators/explore', label: '크리에이터 탐색' },
  { to: '/about', label: '왜 CNEC' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const appHome = user?.role === 'admin' ? '/app/admin' : user?.role === 'business' ? '/app/business' : '/app/creator'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all',
        scrolled ? 'glass border-b border-[#EEF0F4]' : 'bg-transparent',
      )}
    >
      <Container>
        <div className="h-16 sm:h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" aria-label="CNEC Connect">
              <Logo />
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {MENU.map((m) => (
                <a
                  key={m.to}
                  href={m.to}
                  className="px-3.5 h-9 inline-flex items-center rounded-[10px] text-[14px] font-semibold text-[#333452] hover:bg-[#F3F4F6]"
                >
                  {m.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button as={Link} to={appHome} variant="secondary" size="sm">
                대시보드로 이동
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  로그인
                </Button>
                <Button as={Link} to="/signup/business" variant="outline" size="sm">
                  도입 문의
                </Button>
                <Button as={Link} to="/signup/creator" variant="primary" size="sm">
                  크리에이터 가입
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-[10px] text-[#0B0B1A] hover:bg-[#F3F4F6]"
            onClick={() => setOpen((v) => !v)}
            aria-label="메뉴"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-1 border-t border-[#EEF0F4] pt-3">
              {MENU.map((m) => (
                <a
                  key={m.to}
                  href={m.to}
                  className="h-11 px-3 inline-flex items-center rounded-[10px] text-[15px] font-semibold text-[#333452] hover:bg-[#F3F4F6]"
                  onClick={() => setOpen(false)}
                >
                  {m.label}
                </a>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {user ? (
                  <Button as={Link} to={appHome} variant="primary" size="md" fullWidth>
                    대시보드
                  </Button>
                ) : (
                  <>
                    <Button as={Link} to="/login" variant="outline" size="md" fullWidth>로그인</Button>
                    <Button as={Link} to="/signup/creator" variant="primary" size="md" fullWidth>크리에이터 가입</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
