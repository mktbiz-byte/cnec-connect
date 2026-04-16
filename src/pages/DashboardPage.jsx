import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Trophy, Send, ArrowUpRight, TrendingUp, Eye, MessageSquare } from 'lucide-react'
import { MOCK_CREATORS, MOCK_CAMPAIGNS, formatNumber } from '@/data/mock'

export default function DashboardPage() {
  const stats = [
    { label: '전체 크리에이터 DB', value: formatNumber(MOCK_CREATORS.length), icon: Users, color: '#6C5CE7', bg: '#F0EDFF' },
    { label: '크넥 가입 크리에이터', value: MOCK_CREATORS.filter(c => c.isRegistered).length, icon: Trophy, color: '#00B894', bg: '#E6FFF9' },
    { label: '진행중 캠페인', value: MOCK_CAMPAIGNS.filter(c => c.status === 'recruiting').length, icon: TrendingUp, color: '#6C5CE7', bg: '#F0EDFF' },
    { label: '발송 대기', value: '2건', icon: Send, color: '#FDCB6E', bg: '#FFF9E6' },
  ]

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-1">대시보드</h1>
        <p className="text-sm text-gray-500">크리에이터 탐색 + 제안 시스템 테스트</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link to="/creators/search" className="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:border-[#6C5CE7] transition-colors group">
          <Search size={24} className="text-[#6C5CE7] mb-3" />
          <h3 className="font-medium mb-1 group-hover:text-[#6C5CE7]">크리에이터 찾기</h3>
          <p className="text-xs text-gray-500">필터/검색으로 크리에이터를 찾고 캠페인에 제안하세요</p>
        </Link>
        <Link to="/creators/manage" className="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:border-[#6C5CE7] transition-colors group">
          <Users size={24} className="text-[#6C5CE7] mb-3" />
          <h3 className="font-medium mb-1 group-hover:text-[#6C5CE7]">크리에이터 관리</h3>
          <p className="text-xs text-gray-500">그룹별로 크리에이터를 정리하고 관리하세요</p>
        </Link>
        <Link to="/outreach" className="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:border-[#6C5CE7] transition-colors group">
          <Send size={24} className="text-[#6C5CE7] mb-3" />
          <h3 className="font-medium mb-1 group-hover:text-[#6C5CE7]">DM/이메일 발송</h3>
          <p className="text-xs text-gray-500">크리에이터에게 캠페인 제안 메시지를 보내세요</p>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E8E8] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">최근 추가된 크리에이터</h3>
          <Link to="/creators/search" className="text-xs text-[#6C5CE7] flex items-center gap-1">전체보기 <ArrowUpRight size={12} /></Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {MOCK_CREATORS.slice(0, 4).map(c => (
            <Link key={c.id} to={`/creators/${c.id}`} className="border border-[#E8E8E8] rounded-lg p-3 hover:border-[#6C5CE7] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white text-xs font-medium">{c.name[0]}</div>
                <div>
                  <div className="text-sm font-medium truncate max-w-[120px]">{c.name}</div>
                  <div className="text-[10px] text-gray-400">@{c.username}</div>
                </div>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500"><Eye size={10} className="inline mr-0.5" />{formatNumber(c.avgViews)}</span>
                <span className="text-gray-500"><MessageSquare size={10} className="inline mr-0.5" />{c.er}%</span>
                <span className="text-gray-500">{formatNumber(c.followers)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
