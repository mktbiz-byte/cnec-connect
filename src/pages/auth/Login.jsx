import { Link } from 'react-router-dom'
import { Building2, UserRound, ArrowRight } from 'lucide-react'

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-[900px]">
        <div className="text-center">
          <h1 className="display-2">어느 쪽으로 로그인할까요?</h1>
          <p className="mt-4 text-[16px] text-[#6B7280]">
            CNEC Connect는 브랜드와 크리에이터 각각을 위한 별도 공간을 운영합니다.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <Link
            to="/login/business"
            className="group relative rounded-[24px] bg-white border border-[#EEF0F4] hover:border-[#0B0B1A] hover:shadow-elevated transition-all p-8"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0B0B1A] text-white inline-flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div className="mt-6 text-[22px] font-extrabold text-[#0B0B1A]">브랜드 · 기업으로 로그인</div>
            <p className="mt-2 text-[14px] text-[#6B7280]">
              캠페인 생성, 크리에이터 탐색, 결제·정산 관리
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#0B0B1A]">
              계속하기 <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
          <Link
            to="/login/creator"
            className="group relative rounded-[24px] bg-[#5B47FB] text-white p-8 hover:shadow-elevated hover:bg-[#4733D6] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 inline-flex items-center justify-center">
              <UserRound size={22} />
            </div>
            <div className="mt-6 text-[22px] font-extrabold">크리에이터로 로그인</div>
            <p className="mt-2 text-[14px] text-white/80">
              캠페인 탐색·지원, 메시지, 수익·정산 확인
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-bold">
              계속하기 <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        </div>
        <div className="mt-10 text-center text-[13.5px] text-[#6B7280]">
          아직 계정이 없으신가요?{' '}
          <Link to="/signup/business" className="font-bold text-[#0B0B1A] underline underline-offset-2">
            브랜드 가입
          </Link>{' '}
          또는{' '}
          <Link to="/signup/creator" className="font-bold text-[#0B0B1A] underline underline-offset-2">
            크리에이터 가입
          </Link>
        </div>
        <div className="mt-4 text-center">
          <Link to="/login/admin" className="text-[12px] text-[#9CA3AF] hover:text-[#0B0B1A]">관리자 로그인 →</Link>
        </div>
      </div>
    </div>
  )
}
