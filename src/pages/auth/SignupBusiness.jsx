import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

const INDUSTRIES = ['뷰티', '패션', '식음료', 'IT·테크', '생활용품', '여행·레저', '교육', '게임·엔터', '금융', '기타']

export default function SignupBusiness() {
  const { signupBusiness } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    companyName: '',
    industry: '',
    website: '',
    contactName: '',
    phone: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const next = (e) => {
    e?.preventDefault()
    if (step === 1) {
      if (!form.email || !form.password || form.password.length < 8) return setError('이메일과 8자 이상 비밀번호를 입력해주세요.')
      if (form.password !== form.passwordConfirm) return setError('비밀번호 확인이 일치하지 않습니다.')
      setError(null)
      setStep(2)
      return
    }
    if (step === 2) {
      if (!form.companyName) return setError('회사명을 입력해주세요.')
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
      await signupBusiness({
        email: form.email.trim(),
        password: form.password,
        companyName: form.companyName,
        contactName: form.contactName || form.companyName,
        phone: form.phone || undefined,
        industry: form.industry || undefined,
        website: form.website || undefined,
      })
      navigate('/app/business', { replace: true })
    } catch (err) {
      if (err.message === 'EMAIL_TAKEN') setError('이미 가입된 이메일입니다.')
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
          <Link to="/login/business" className="text-[#5B47FB]">
            이미 가입하셨나요? 로그인
          </Link>
        </div>
        <h1 className="mt-3 text-[26px] font-extrabold text-[#0B0B1A] tracking-tight">
          {step === 1 && '브랜드 계정 만들기'}
          {step === 2 && '회사 정보'}
          {step === 3 && '담당자 정보'}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-[#6B7280]">
          {step === 1 && '캠페인 운영을 위한 브랜드·기업 계정을 만듭니다.'}
          {step === 2 && '캠페인에 노출될 회사 기본 정보를 입력해주세요.'}
          {step === 3 && '담당자 정보를 입력하면 가입이 완료됩니다.'}
        </p>

        <div className="mt-6 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#5B47FB] to-[#00C2A8]" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <form onSubmit={step === 3 ? submit : next} className="mt-8 flex flex-col gap-4">
          {step === 1 && (
            <>
              <Input label="업무용 이메일" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              <Input label="비밀번호 (8자 이상)" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} />
              <Input label="비밀번호 확인" type="password" value={form.passwordConfirm} onChange={(e) => set('passwordConfirm', e.target.value)} required minLength={8} />
            </>
          )}

          {step === 2 && (
            <>
              <Input label="회사명" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} required />
              <div>
                <div className="text-[13px] font-semibold text-[#333452] mb-1.5">산업</div>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => set('industry', c === form.industry ? '' : c)}
                      className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition ${
                        form.industry === c
                          ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]'
                          : 'bg-white text-[#333452] border-[#E5E7EB] hover:border-[#0B0B1A]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="웹사이트 (선택)" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://..." />
            </>
          )}

          {step === 3 && (
            <>
              <Input label="담당자 이름" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} required />
              <Input label="담당자 연락처 (선택)" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="010-0000-0000" />
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
