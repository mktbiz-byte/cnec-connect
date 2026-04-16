import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = ['뷰티', '패션', '음식', '맛집', '여행', '운동', '건강', '라이프스타일', 'IT', '테크', '육아', '반려동물', '게임']
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '제주', '해외']

export default function SignupCreator() {
  const { signupCreator } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    handle: '',
    displayName: '',
    region: '',
    categories: [],
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const next = (e) => {
    e?.preventDefault()
    if (step === 1) {
      if (!form.email || !form.password || form.password.length < 8) return setError('이메일과 8자 이상 비밀번호가 필요합니다.')
      if (form.password !== form.passwordConfirm) return setError('비밀번호 확인이 일치하지 않습니다.')
      setError(null)
      setStep(2)
      return
    }
    if (step === 2) {
      if (!form.handle || !form.displayName) return setError('핸들과 표시 이름을 입력해주세요.')
      if (!/^[a-z0-9_.]+$/i.test(form.handle)) return setError('핸들은 영문/숫자/언더스코어만 사용 가능합니다.')
      setError(null)
      setStep(3)
      return
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signupCreator({
        email: form.email.trim(),
        password: form.password,
        handle: form.handle,
        displayName: form.displayName,
        region: form.region || undefined,
        categories: form.categories,
      })
      navigate('/app/creator', { replace: true })
    } catch (err) {
      if (err.message === 'EMAIL_TAKEN') setError('이미 가입된 이메일입니다.')
      else if (err.message === 'HANDLE_TAKEN') setError('이미 사용 중인 핸들입니다.')
      else setError('가입에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[520px] bg-white border border-[#EEF0F4] rounded-[22px] shadow-card p-8 md:p-10">
        <div className="flex items-center justify-between text-[12px] text-[#6B7280] font-semibold">
          <span>STEP {step} / 3</span>
          <Link to="/login/creator" className="text-[#5B47FB]">이미 가입하셨나요? 로그인</Link>
        </div>
        <h1 className="mt-3 text-[26px] font-extrabold text-[#0B0B1A] tracking-tight">
          {step === 1 && '크리에이터 계정 만들기'}
          {step === 2 && '프로필 기본 정보'}
          {step === 3 && '카테고리·지역'}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-[#6B7280]">
          {step === 1 && 'CNEC Connect 크리에이터 전용 공간에 오신 것을 환영합니다.'}
          {step === 2 && '브랜드에게 보여질 프로필 핵심 정보를 입력해주세요.'}
          {step === 3 && '맞춤 캠페인 매칭을 위해 활동 카테고리·지역을 선택해주세요.'}
        </p>

        <div className="mt-6 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5B47FB] transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={step === 3 ? submit : next} className="mt-8 flex flex-col gap-4">
          {step === 1 && (
            <>
              <Input label="이메일" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              <Input label="비밀번호 (8자 이상)" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} />
              <Input label="비밀번호 확인" type="password" value={form.passwordConfirm} onChange={(e) => set('passwordConfirm', e.target.value)} required minLength={8} />
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="핸들 (URL에 사용됩니다)"
                leftAddon={<span className="text-[14px]">@</span>}
                value={form.handle}
                onChange={(e) => set('handle', e.target.value.toLowerCase())}
                placeholder="your_handle"
                required
              />
              <Input label="표시 이름" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="예: 소라의 일상" required />
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <div className="text-[13px] font-semibold text-[#333452] mb-1.5">활동 지역</div>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => set('region', r === form.region ? '' : r)}
                      className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition ${
                        form.region === r
                          ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]'
                          : 'bg-white text-[#333452] border-[#E5E7EB] hover:border-[#0B0B1A]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#333452] mb-1.5">카테고리 (복수 선택)</div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const on = form.categories.includes(c)
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() =>
                          set('categories', on ? form.categories.filter((x) => x !== c) : [...form.categories, c])
                        }
                        className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition ${
                          on ? 'bg-[#5B47FB] text-white border-[#5B47FB]' : 'bg-white text-[#333452] border-[#E5E7EB] hover:border-[#5B47FB]'
                        }`}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="text-[13px] text-[#FF5A5A] bg-[#FFF2F2] border border-[#FFD6D6] rounded-lg px-3.5 py-2.5">{error}</div>
          )}

          <div className="mt-3 flex gap-3">
            {step > 1 && (
              <Button type="button" variant="outline" size="lg" fullWidth onClick={() => setStep(step - 1)}>
                이전
              </Button>
            )}
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {step === 3 ? '가입 완료' : '다음으로'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
