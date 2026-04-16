import { MOCK_OUTREACH } from '@/data/mock'
import { Send, Mail, MessageCircle, Plus, Settings } from 'lucide-react'

const STATUS_MAP = { draft: { label: '작성 중', color: '#888', bg: '#F5F5F5' }, sending: { label: '발송 중', color: '#6C5CE7', bg: '#F0EDFF' }, sent: { label: '발송 완료', color: '#00B894', bg: '#E6FFF9' }, cancelled: { label: '발송 취소', color: '#FF6B6B', bg: '#FFE8E8' } }

export default function OutreachPage() {
  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">DM/이메일 발송</h1>
        <div className="flex gap-2">
          <button className="h-9 px-4 rounded-lg border border-[#E8E8E8] text-sm flex items-center gap-1.5 hover:bg-gray-50"><Settings size={14} />발신 계정 관리</button>
          <button className="h-9 px-4 rounded-lg bg-[#6C5CE7] text-white text-sm font-medium flex items-center gap-1.5"><Plus size={16} />새 DM/이메일 발송</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <div className="text-xs text-gray-500 mb-2">전체 발송 성공 건수</div>
          <div className="text-3xl font-semibold">11 <span className="text-sm font-normal text-gray-400">건</span></div>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-xs text-gray-500"><Mail size={12} />이메일 8건</span>
            <span className="flex items-center gap-1 text-xs text-gray-500"><MessageCircle size={12} />인스타 DM 3건</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <div className="text-xs text-gray-500 mb-2">발송 채널</div>
          <div className="flex gap-3 mt-2">
            <div className="flex-1 border border-[#E8E8E8] rounded-lg p-3 text-center">
              <Mail size={20} className="mx-auto mb-1 text-[#6C5CE7]" />
              <div className="text-xs font-medium">이메일</div>
              <div className="text-[10px] text-gray-400">Gmail / SMTP</div>
            </div>
            <div className="flex-1 border border-[#E8E8E8] rounded-lg p-3 text-center">
              <MessageCircle size={20} className="mx-auto mb-1 text-[#6C5CE7]" />
              <div className="text-xs font-medium">인스타 DM</div>
              <div className="text-[10px] text-gray-400">미가입 크리에이터</div>
            </div>
            <div className="flex-1 border border-[#E8E8E8] rounded-lg p-3 text-center">
              <Send size={20} className="mx-auto mb-1 text-[#FDCB6E]" />
              <div className="text-xs font-medium">카카오 알림톡</div>
              <div className="text-[10px] text-gray-400">가입 크리에이터</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#E8E8E8]">
          {['전체', '작성 중', '발송 중', '발송 완료', '발송 취소'].map((t, i) => (
            <button key={t} className={`text-sm pb-1 ${i === 0 ? 'text-[#6C5CE7] font-medium border-b-2 border-[#6C5CE7]' : 'text-gray-500'}`}>
              {t} <span className="text-xs text-gray-400">{i === 0 ? MOCK_OUTREACH.length : 0}</span>
            </button>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E8E8] bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-600">제목</th>
              <th className="text-center p-3 font-medium text-gray-600">발송 상태</th>
              <th className="text-center p-3 font-medium text-gray-600">채널</th>
              <th className="text-right p-3 font-medium text-gray-600">발송 성공</th>
              <th className="text-right p-3 font-medium text-gray-600">발송 실패</th>
              <th className="text-right p-3 font-medium text-gray-600">생성 일시</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_OUTREACH.map(o => {
              const st = STATUS_MAP[o.status] || STATUS_MAP.draft
              return (
                <tr key={o.id} className="border-b border-[#E8E8E8] hover:bg-gray-50 cursor-pointer">
                  <td className="p-3 font-medium">{o.title}</td>
                  <td className="p-3 text-center"><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                  <td className="p-3 text-center text-xs text-gray-600">{o.channel === 'email' ? '이메일' : '인스타 DM'}</td>
                  <td className="p-3 text-right text-[#00B894] font-medium">{o.success}건</td>
                  <td className="p-3 text-right text-[#FF6B6B]">{o.fail}건</td>
                  <td className="p-3 text-right text-gray-500 text-xs">{o.createdAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
