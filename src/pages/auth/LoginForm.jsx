import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function LoginForm({ role, title, subtitle, signupTo, accentClass = '' }) {
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
      const user = await login(email.trim(), password, role)
      const dest = location.state?.from?.pathname || (user.role === 'business' ? '/app/business' : '/app/creator')
      navigate(dest, { replace: true })
    } catch (err) {
      if (err.message === 'WRONG_ROLE') setError('다른 역할로 가입된 계정입니다. 역할을 확인해주세요.')
      else if (err.message === 'INVALID_CREDENTIALS') setError('이메일 또는 비밀번호가 일치하지 않습니다.')
      else setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-2">
      <div className={`hidden md:block ${accentClass}`}>
        <div className="h-full flex flex-col justify-between p-12 text-white">
          <div>
            <div className="eyebrow !text-white/70">{role === 'business' ? 'FOR BRANDS' : 'FOR CREATORS'}</div>
            <h1 className="mt-3 display-2 text-white">
              {role === 'business' ? '성과는 데이터로,\n협업은 한 플랫폼에서.' : '맞춤 캠페인을 만나고,\n안전하게 정산받으세요.'}
            </h1>
          </div>
          <div className="text-[13px] text-white/70">© CNEC Connect</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-14">
        <form onSubmit={onSubmit} className="w-full max-w-[420px]">
          <h2 className="text-[28px] font-extrabold tracking-tight text-[#0B0B1A]">{title}</h2>
          <p className="mt-2 text-[14.5px] text-[#6B7280]">{subtitle}</p>

          <div className="mt-8 flex flex-col gap-4">
            <Input
              label="이메일"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
            <Input
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
            {error && (
              <div className="text-[13px] text-[#FF5A5A] bg-[#FFF2F2] border border-[#FFD6D6] rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}
            <Button type="submit" size="lg" fullWidth loading={loading}>
              로그인
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-between text-[13.5px] text-[#6B7280]">
            <Link to="/forgot-password" className="hover:text-[#0B0B1A]">
              비밀번호 찾기
            </Link>
            <Link to={signupTo} className="font-semibold text-[#0B0B1A] hover:underline">
              회원가입
            </Link>
          </div>

          <div className="mt-10 p-4 rounded-xl bg-[#F5F6FA] text-[12.5px] text-[#6B7280] leading-relaxed">
            <div className="font-bold text-[#0B0B1A] mb-1">데모 계정</div>
            {role === 'business'
              ? '브랜드: brand@demo.cnec.co / demo1234!'
              : '크리에이터: creator@demo.cnec.co / demo1234!'}
          </div>
        </form>
      </div>
    </div>
  )
}
