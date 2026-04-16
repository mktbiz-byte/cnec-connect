import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Bell, Search, Users, Trophy, Sparkles, Grid3X3, BarChart3, Megaphone, Send, ChevronLeft, ChevronRight, Settings } from 'lucide-react'

const NAV = [
  { section: null, items: [
    { to: '/', icon: LayoutDashboard, label: '대시보드' },
    { to: '/alerts', icon: Bell, label: '알림', badge: 3 },
  ]},
  { section: '크리에이터', items: [
    { to: '/creators/search', icon: Search, label: '크리에이터 찾기' },
    { to: '/creators/manage', icon: Users, label: '크리에이터 관리' },
    { to: '/creators/ranking', icon: Trophy, label: '크리에이터 랭킹' },
    { to: '/creators/ai', icon: Sparkles, label: 'AI 리스트업' },
  ]},
  { section: '캠페인', items: [
    { to: '/content/library', icon: Grid3X3, label: '콘텐츠 라이브러리' },
    { to: '/content/tracking', icon: BarChart3, label: '콘텐츠 트래킹' },
    { to: '/campaigns', icon: Megaphone, label: '캠페인 관리', isNew: true },
    { to: '/outreach', icon: Send, label: 'DM/이메일 발송' },
  ]},
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-white border-r border-[#E8E8E8] flex flex-col transition-all duration-200 shrink-0`}>
        <div className="h-14 flex items-center px-4 border-b border-[#E8E8E8] gap-2">
          {!collapsed && (
            <>
              <div className="w-7 h-7 rounded-lg bg-[#6C5CE7] flex items-center justify-center text-white text-xs font-bold">C</div>
              <span className="text-sm font-semibold tracking-tight">CNEC TW</span>
            </>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-400 hover:text-gray-600">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.section && !collapsed && (
                <div className="px-4 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{group.section}</div>
              )}
              {group.section && collapsed && <div className="border-t border-[#E8E8E8] mx-2 my-2" />}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 mx-2 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                      isActive ? 'bg-[#F0EDFF] text-[#6C5CE7] font-medium' : 'text-gray-600 hover:bg-gray-50'
                    } ${collapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <item.icon size={18} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-[#6C5CE7] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{item.badge}</span>
                      )}
                      {item.isNew && (
                        <span className="bg-[#00B894] text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">NEW</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-[#E8E8E8] p-2">
          <NavLink to="/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50">
            <Settings size={18} />
            {!collapsed && <span>설정</span>}
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#F7F7F8]">
        <Outlet />
      </main>
    </div>
  )
}
