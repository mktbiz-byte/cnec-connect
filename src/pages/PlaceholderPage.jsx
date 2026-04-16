import { Construction } from 'lucide-react'

export default function PlaceholderPage({ title = '준비 중', desc = '' }) {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold mb-6">{title}</h1>
      <div className="bg-white rounded-xl border border-[#E8E8E8] p-16 text-center">
        <Construction size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-500 mb-1">{title} 페이지 준비 중</p>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
    </div>
  )
}
