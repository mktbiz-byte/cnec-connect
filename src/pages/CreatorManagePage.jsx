import { useState } from 'react'
import { MOCK_GROUPS, PLATFORMS } from '@/data/mock'
import { Plus, Search, Lock, Users, Camera, Play, Music } from 'lucide-react'

const PLATFORM_ICONS = { instagram: Camera, youtube: Play, tiktok: Music }

export default function CreatorManagePage() {
  const [tab, setTab] = useState('my')

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">크리에이터 관리</h1>
      </div>

      <div className="flex gap-4 mb-6 border-b border-[#E8E8E8]">
        <button onClick={() => setTab('my')} className={`pb-2.5 text-sm ${tab === 'my' ? 'text-[#6C5CE7] font-medium border-b-2 border-[#6C5CE7]' : 'text-gray-500'}`}>
          내 그룹 <span className="text-xs bg-[#F0EDFF] text-[#6C5CE7] px-1.5 py-0.5 rounded-full ml-1">{MOCK_GROUPS.length}</span>
        </button>
        <button onClick={() => setTab('shared')} className={`pb-2.5 text-sm ${tab === 'shared' ? 'text-[#6C5CE7] font-medium border-b-2 border-[#6C5CE7]' : 'text-gray-500'}`}>
          공유받은 그룹
        </button>
      </div>

      {/* Platform summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {PLATFORMS.map(p => {
          const Icon = PLATFORM_ICONS[p.value] || Camera
          const count = MOCK_GROUPS.filter(g => g.platform === p.value).reduce((sum, g) => sum + g.count, 0)
          return (
            <div key={p.value} className="bg-white rounded-xl border border-[#E8E8E8] p-4 flex items-center gap-3 cursor-pointer hover:border-[#6C5CE7]">
              <Icon size={20} className="text-[#6C5CE7]" />
              <div>
                <div className="text-sm font-medium">{p.label} 전체</div>
                <div className="text-xs text-gray-500"><Users size={10} className="inline mr-0.5" />{count}명</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <select className="h-9 px-3 border border-[#E8E8E8] rounded-lg text-sm bg-white">
          <option>전체 플랫폼</option>
          {PLATFORMS.map(p => <option key={p.value}>{p.label}</option>)}
        </select>
        <span className="text-xs text-gray-500">그룹 한도 <span className="font-medium">{MOCK_GROUPS.length}/5</span></span>
        <div className="ml-auto flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="그룹명 검색" className="h-9 pl-8 pr-3 border border-[#E8E8E8] rounded-lg text-sm w-[180px]" />
          </div>
          <button className="h-9 px-4 rounded-lg bg-[#6C5CE7] text-white text-sm font-medium flex items-center gap-1.5"><Plus size={16} />새 그룹 생성하기</button>
        </div>
      </div>

      {/* Groups table */}
      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E8E8] bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-600">그룹 목록</th>
              <th className="text-right p-3 font-medium text-gray-600">공유 상태</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_GROUPS.map(g => {
              const Icon = PLATFORM_ICONS[g.platform] || Camera
              return (
                <tr key={g.id} className="border-b border-[#E8E8E8] hover:bg-gray-50 cursor-pointer">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-gray-400" />
                      <span className="font-medium">{g.name}</span>
                      <Lock size={12} className="text-gray-300" />
                      <span className="text-xs text-gray-400"><Users size={10} className="inline mr-0.5" />{g.count}/{g.capacity}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-xs text-gray-400">비공개</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8E8E8]">
          <select className="h-8 px-2 border border-[#E8E8E8] rounded text-xs"><option>50 / page</option></select>
          <span className="text-xs text-gray-400">1</span>
        </div>
      </div>
    </div>
  )
}
