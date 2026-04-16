import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  MessageCircle,
  Wallet,
  BarChart3,
  Settings,
  FilePlus,
  Search,
  Inbox,
  LogOut,
  FileVideo,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import NotificationBell from '@/components/ui/NotificationBell'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

const CREATOR_NAV = [
  { to: '/app/creator', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/app/creator/campaigns', label: '캠페인 탐색', icon: Search },
  { to: '/app/creator/applications', label: '내 지원 현황', icon: Inbox },
  { to: '/app/creator/messages', label: '메시지', icon: MessageCircle },
  { to: '/app/creator/content', label: '콘텐츠 제출', icon: FileVideo },
  { to: '/app/creator/earnings', label: '수익·정산', icon: Wallet },
  { to: '/app/creator/profile', label: '프로필', icon: Users },
  { to: '/app/creator/settings', label: '설정', icon: Settings },
]

const BUSINESS_NAV = [
  { to: '/app/business', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/app/business/creators', label: '크리에이터 탐색', icon: Search },
  { to: '/app/business/campaigns', label: '캠페인 관리', icon: Megaphone },
  { to: '/app/business/campaigns/new', label: '새 캠페인', icon: FilePlus },
  { to: '/app/business/messages', label: '메시지', icon: MessageCircle },
  { to: '/app/business/payments', label: '결제·정산', icon: Wallet },
  { to: '/app/business/analytics', label: '분석·리포트', icon: BarChart3 },
  { to: '/app/business/settings', label: '설정', icon: Settings },
]

export default function AppLayout() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'business' ? BUSINESS_NAV : CREATOR_NAV

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex">
      <aside className="hidden md:flex w-[248px] shrink-0 flex-col bg-white border-r border-[#EEF0F4]">
        <div className="h-16 px-5 flex items-center border-b border-[#EEF0F4]">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <div className="px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            {user?.role === 'business' ? 'Brand Workspace' : 'Creator Workspace'}
          </div>
          <nav className="flex flex-col gap-0.5">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 h-10 px-3 rounded-[10px] text-[13.5px] font-semibold transition',
                    isActive
                      ? 'bg-[#0B0B1A] text-white'
                      : 'text-[#333452] hover:bg-[#F3F4F6]',
                  )
                }
              >
                <n.icon size={16} />
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-3 border-t border-[#EEF0F4]">
          <div className="px-2 py-2 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B47FB] to-[#00C2A8] text-white flex items-center justify-center font-bold">
              {(profile?.display_name || profile?.company_name || user?.email || '?')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-bold text-[#0B0B1A] truncate">
                {profile?.display_name || profile?.company_name || user?.email}
              </div>
              <div className="text-[11px] text-[#6B7280]">{user?.role === 'business' ? '브랜드' : '크리에이터'}</div>
            </div>
            <button onClick={handleLogout} className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] inline-flex items-center justify-center" aria-label="로그아웃">
              <LogOut size={15} className="text-[#6B7280]" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 md:h-16 px-4 md:px-6 bg-white border-b border-[#EEF0F4] flex items-center justify-between">
          <Link to="/" className="md:hidden"><Logo /></Link>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={handleLogout} className="hidden md:inline-flex h-9 px-3 rounded-lg text-[12.5px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6]">로그아웃</button>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
