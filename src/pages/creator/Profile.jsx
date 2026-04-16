import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = ['뷰티', '패션', '음식', '맛집', '여행', '운동', '건강', '라이프스타일', 'IT', '테크', '육아', '반려동물', '게임']
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '제주', '해외']
const PLATFORM_NAMES = ['instagram', 'youtube', 'tiktok', 'blog', 'twitter']

export default function CreatorProfilePage() {
  const { profile, refresh } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [region, setRegion] = useState(profile?.region || '')
  const [categories, setCategories] = useState(profile?.categories || [])
  const [platforms, setPlatforms] = useState(
    Array.isArray(profile?.platforms) && profile.platforms.length
      ? profile.platforms
      : [{ name: 'instagram', handle: '', followers: 0 }],
  )
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [error, setError] = useState(null)

  const updatePlatform = (i, k, v) => {
    setPlatforms((ps) => ps.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)))
  }

  const addPlatform = () => setPlatforms((ps) => [...ps, { name: 'instagram', handle: '', followers: 0 }])
  const removePlatform = (i) => setPlatforms((ps) => ps.filter((_, idx) => idx !== i))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api('/api/creators/me', {
        method: 'PATCH',
        body: {
          displayName,
          bio,
          region: region || undefined,
          categories,
          platforms: platforms
            .filter((p) => p.handle)
            .map((p) => ({ name: p.name, handle: p.handle, followers: Number(p.followers) || 0 })),
        },
      })
      await refresh()
      setSavedAt(new Date())
    } catch (err) {
      setError('저장에 실패했습니다. 입력값을 확인해주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="프로필 편집" subtitle="브랜드에게 노출되는 프로필입니다. 꼼꼼히 작성해주세요." />
      <form onSubmit={save} className="px-6 md:px-10 py-8 max-w-[980px] mx-auto space-y-5">
        <Card>
          <h3 className="text-[16px] font-extrabold text-[#0B0B1A]">기본 정보</h3>
          <div className="mt-5 grid md:grid-cols-2 gap-4">
            <Input label="표시 이름" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            <div>
              <div className="text-[13px] font-semibold text-[#333452] mb-1.5">활동 지역</div>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full h-12 px-4 rounded-[12px] border border-[#E5E7EB] focus:border-[#5B47FB] focus:outline-none text-[15px]">
                <option value="">선택 안 함</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Input as="textarea" label="소개 (500자)" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 500))} placeholder="브랜드에게 보여지는 소개를 작성해주세요." />
          </div>
        </Card>

        <Card>
          <h3 className="text-[16px] font-extrabold text-[#0B0B1A]">카테고리</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const on = categories.includes(c)
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategories(on ? categories.filter((x) => x !== c) : [...categories, c])}
                  className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition ${
                    on ? 'bg-[#5B47FB] text-white border-[#5B47FB]' : 'bg-white text-[#333452] border-[#E5E7EB] hover:border-[#5B47FB]'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-extrabold text-[#0B0B1A]">플랫폼 연결</h3>
            <Button type="button" variant="soft" size="sm" onClick={addPlatform}>+ 플랫폼 추가</Button>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {platforms.map((p, i) => (
              <div key={i} className="grid md:grid-cols-[160px_1fr_160px_80px] gap-3 items-end">
                <div>
                  <div className="text-[12px] font-semibold text-[#333452] mb-1.5">플랫폼</div>
                  <select value={p.name} onChange={(e) => updatePlatform(i, 'name', e.target.value)} className="w-full h-12 px-3 rounded-[12px] border border-[#E5E7EB] text-[14px]">
                    {PLATFORM_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <Input label="핸들" value={p.handle} onChange={(e) => updatePlatform(i, 'handle', e.target.value)} placeholder="@your_handle" />
                <Input label="팔로워 수" type="number" value={p.followers} onChange={(e) => updatePlatform(i, 'followers', e.target.value)} min={0} />
                <Button type="button" variant="outline" size="md" onClick={() => removePlatform(i)}>삭제</Button>
              </div>
            ))}
          </div>
        </Card>

        {error && <div className="text-[13px] text-[#FF5A5A] bg-[#FFF2F2] border border-[#FFD6D6] rounded-lg px-3.5 py-2.5">{error}</div>}

        <div className="flex items-center justify-between">
          <div className="text-[12.5px] text-[#6B7280]">{savedAt ? `저장됨 · ${savedAt.toLocaleTimeString('ko-KR')}` : ' '}</div>
          <Button type="submit" size="lg" loading={saving}>프로필 저장</Button>
        </div>
      </form>
    </>
  )
}
