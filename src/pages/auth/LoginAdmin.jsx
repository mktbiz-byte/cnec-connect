import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { ShieldCheck } from 'lucide-react'

export default function LoginAdmin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      if (user.role !== 'admin') {
        setError('관리자 계정이 아닙니다.')
        setLoading(false)
        return
      }
      const dest = location.state?.from?.pathname || '/app/admin'
      navigate(dest, { replace: true })
    } catch (err) {
      if (err.message === 'SUSPENDED') setError('정지된 계정입니다.')
      else if (err.message === 'INVALID_CREDENTIALS') setError('이메일 또는 비밀번호가 일치하지 않습니다.')
      else setError('로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-2">
      <div className="hidden md:block bg-[#0B0B1A]">
        <div className="h-full flex flex-col justify-between p-12 text-white">
          <div>
            <div className="eyebrow text-white/70">ADMIN CONSOLE</div>
            <h1 className="mt-3 display-2 text-white">
              플랫폼 전체를 한 화면에서 관리합니다.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-white/70 max-w-md">
              사용자·캠페인·지원·결제·콘텐츠·공지까지 통합 운영 콘솔. 모든 액션은 감사 로그에 기록됩니다.
            </p>
          </div>
          <div className="text-[13px] text-white/70">© CNEC Connect · Admin Only</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-14">
        <form onSubmit={onSubmit} className="w-full max-w-[420px]">
          <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-[#0B0B1A] text-white text-[11.5px] font-bold">
            <ShieldCheck size={14} /> ADMIN
          </div>
          <h2 className="mt-4 text-[28px] font-extrabold tracking-tight text-[#0B0B1A]">관리자 로그인</h2>
          <p className="mt-2 text-[14.5px] text-[#6B7280]">CNEC Connect 관리자 계정 전용 입구입니다.</p>

          <div className="mt-8 flex flex-col gap-4">
            <Input label="이메일" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@cnec.co" required />
            <Input label="비밀번호" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
            {error && (
              <div className="text-[13px] text-[#C43434] bg-[#FFE4E4] border border-[#FFD0D0] rounded-lg px-3.5 py-2.5">{error}</div>
            )}
            <Button type="submit" size="lg" fullWidth loading={loading} variant="secondary">
              관리자 로그인
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[13px] text-[#6B7280] hover:text-[#0B0B1A]">일반 로그인으로 돌아가기</Link>
          </div>

          <div className="mt-10 p-4 rounded-xl bg-[#F5F6FA] text-[12.5px] text-[#6B7280] leading-relaxed">
            <div className="font-bold text-[#0B0B1A] mb-1">데모 관리자 계정</div>
            admin@demo.cnec.co / demo1234!
          </div>
        </form>
      </div>
    </div>
  )
}
