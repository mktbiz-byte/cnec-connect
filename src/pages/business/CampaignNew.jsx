import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

const CATEGORIES = ['뷰티', '패션', '식음료', '여행', '운동', 'IT', '테크', '육아', '반려동물', '라이프스타일']
const PLATFORMS = ['instagram', 'youtube', 'tiktok', 'blog']

export default function CampaignNew() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '뷰티',
    budgetMin: 500000,
    budgetMax: 1500000,
    requirements: '',
    platforms: ['instagram'],
    recruitCount: 5,
    startDate: '',
    endDate: '',
    applyDeadline: '',
    deliverables: [{ type: 'feed', count: 1 }],
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const togglePlatform = (p) =>
    set('platforms', form.platforms.includes(p) ? form.platforms.filter((x) => x !== p) : [...form.platforms, p])

  const next = (e) => {
    e?.preventDefault()
    if (step === 1 && (!form.title || !form.description)) return setError('제목과 설명을 입력해주세요.')
    if (step === 2 && (form.budgetMin > form.budgetMax)) return setError('최소 예산이 최대 예산을 초과할 수 없습니다.')
    setError(null)
    setStep(step + 1)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const { data } = await api('/api/campaigns', {
        method: 'POST',
        body: {
          title: form.title,
          description: form.description,
          category: form.category,
          budgetMin: Number(form.budgetMin),
          budgetMax: Number(form.budgetMax),
          deliverables: form.deliverables,
          requirements: form.requirements || undefined,
          platforms: form.platforms,
          recruitCount: Number(form.recruitCount),
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          applyDeadline: form.applyDeadline || undefined,
          status: 'recruiting',
        },
      })
      navigate(`/app/business/campaigns/${data.id}`, { replace: true })
    } catch {
      setError('캠페인 생성에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="새 캠페인 만들기" subtitle="마법사를 따라 5분 안에 발행해보세요." />
      <form onSubmit={step === 4 ? submit : next} className="px-6 md:px-10 py-8 max-w-[820px] mx-auto">
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-gradient-to-r from-[#5B47FB] to-[#00C2A8]' : 'bg-[#F3F4F6]'}`} />
          ))}
        </div>

        <Card>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-extrabold">기본 정보</h3>
              <Input label="캠페인 제목" value={form.title} onChange={(e) => set('title', e.target.value)} required />
              <Input as="textarea" label="상세 설명" value={form.description} onChange={(e) => set('description', e.target.value)} required />
              <div>
                <div className="text-[13px] font-semibold text-[#333452] mb-1.5">카테고리</div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => set('category', c)}
                      className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition ${
                        form.category === c ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]' : 'bg-white text-[#333452] border-[#E5E7EB]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-extrabold">예산 & 모집</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="최소 예산 (원)" type="number" value={form.budgetMin} onChange={(e) => set('budgetMin', e.target.value)} min={0} />
                <Input label="최대 예산 (원)" type="number" value={form.budgetMax} onChange={(e) => set('budgetMax', e.target.value)} min={0} />
              </div>
              <Input label="모집 인원" type="number" value={form.recruitCount} onChange={(e) => set('recruitCount', e.target.value)} min={1} />
              <Input as="textarea" label="크리에이터 요구사항 (선택)" value={form.requirements} onChange={(e) => set('requirements', e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-extrabold">플랫폼 & 일정</h3>
              <div>
                <div className="text-[13px] font-semibold text-[#333452] mb-1.5">플랫폼 (복수 선택)</div>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const on = form.platforms.includes(p)
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition ${
                          on ? 'bg-[#5B47FB] text-white border-[#5B47FB]' : 'bg-white text-[#333452] border-[#E5E7EB]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input label="시작일" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                <Input label="종료일" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
                <Input label="지원 마감일" type="date" value={form.applyDeadline} onChange={(e) => set('applyDeadline', e.target.value)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-extrabold">검토 및 발행</h3>
              <div className="rounded-xl bg-[#FAFAFB] p-5 text-[13.5px] leading-relaxed">
                <div className="font-bold text-[#0B0B1A]">{form.title}</div>
                <div className="mt-1 text-[#6B7280]">카테고리: {form.category} · 모집 {form.recruitCount}명 · 예산 {Number(form.budgetMin).toLocaleString()} ~ {Number(form.budgetMax).toLocaleString()}원</div>
                <div className="mt-1 text-[#6B7280]">플랫폼: {form.platforms.join(', ')}</div>
                <div className="mt-3 whitespace-pre-wrap text-[#333452]">{form.description}</div>
              </div>
              <div className="text-[12.5px] text-[#6B7280]">발행 시 크리에이터에게 즉시 공개되며, 지원을 받기 시작합니다.</div>
            </div>
          )}

          {error && <div className="mt-4 text-[13px] text-[#FF5A5A] bg-[#FFF2F2] border border-[#FFD6D6] rounded-lg px-3.5 py-2.5">{error}</div>}
        </Card>

        <div className="mt-6 flex gap-3">
          {step > 1 && <Button type="button" variant="outline" size="lg" onClick={() => setStep(step - 1)}>이전</Button>}
          <div className="flex-1" />
          <Button type="submit" size="lg" loading={saving}>{step === 4 ? '캠페인 발행' : '다음'}</Button>
        </div>
      </form>
    </>
  )
}
