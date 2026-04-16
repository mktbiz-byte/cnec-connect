import { useState } from 'react'
import { MOCK_CAMPAIGNS, formatMoney } from '@/data/mock'
import { Plus, Search, Filter } from 'lucide-react'

const STATUS = { draft: { label: '준비중', color: '#888', bg: '#F5F5F5' }, recruiting: { label: '모집중', color: '#00B894', bg: '#E6FFF9' }, in_progress: { label: '진행중', color: '#6C5CE7', bg: '#F0EDFF' }, completed: { label: '완료', color: '#636e72', bg: '#F0F0F0' } }

export default function CampaignPage() {
  const counts = { total: MOCK_CAMPAIGNS.length, draft: MOCK_CAMPAIGNS.filter(c => c.status === 'draft').length, recruiting: MOCK_CAMPAIGNS.filter(c => c.status === 'recruiting').length, in_progress: 0, completed: 0 }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">캠페인 관리</h1>
        <button className="h-9 px-4 rounded-lg bg-[#6C5CE7] text-white text-sm font-medium flex items-center gap-1.5"><Plus size={16} />새 캠페인 시작</button>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: '이번 달 생성', value: counts.total, sub: `/${counts.total}건` },
          { label: '진행 전', value: counts.draft, dot: '#888' },
          { label: '진행 중', value: counts.recruiting, dot: '#00B894' },
          { label: '보류', value: 0, dot: '#FDCB6E' },
          { label: '종료', value: counts.completed, dot: '#636e72' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              {s.dot && <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />}
              {s.label}
            </div>
            <div className="text-2xl font-semibold">{s.value} <span className="text-sm font-normal text-gray-400">건</span></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-[#E8E8E8]">
          <select className="h-8 px-3 border border-[#E8E8E8] rounded-lg text-xs bg-white"><option>상태</option></select>
          <select className="h-8 px-3 border border-[#E8E8E8] rounded-lg text-xs bg-white"><option>캠페인 유형</option></select>
          <select className="h-8 px-3 border border-[#E8E8E8] rounded-lg text-xs bg-white"><option>콘텐츠 유형</option></select>
          <div className="ml-auto relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="캠페인명, 브랜드명 검색" className="h-8 pl-8 pr-3 border border-[#E8E8E8] rounded-lg text-xs w-[200px]" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E8E8] bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-600">캠페인명</th>
              <th className="text-center p-3 font-medium text-gray-600">상태</th>
              <th className="text-left p-3 font-medium text-gray-600">브랜드</th>
              <th className="text-left p-3 font-medium text-gray-600">유형</th>
              <th className="text-right p-3 font-medium text-gray-600">원고비</th>
              <th className="text-center p-3 font-medium text-gray-600">크리에이터</th>
              <th className="text-right p-3 font-medium text-gray-600">마감</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CAMPAIGNS.map(c => {
              const st = STATUS[c.status] || STATUS.draft
              return (
                <tr key={c.id} className="border-b border-[#E8E8E8] hover:bg-gray-50 cursor-pointer">
                  <td className="p-3 font-medium">{c.title}</td>
                  <td className="p-3 text-center"><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                  <td className="p-3 text-gray-600">{c.brand}</td>
                  <td className="p-3 text-gray-600 text-xs">{c.type === 'planned' ? '기획형 릴스' : c.type === '4week_challenge' ? '4주 챌린지' : c.type}</td>
                  <td className="p-3 text-right">{formatMoney(c.fee)}</td>
                  <td className="p-3 text-center">{c.filled}/{c.slots}명</td>
                  <td className="p-3 text-right text-gray-500 text-xs">{c.deadline}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
