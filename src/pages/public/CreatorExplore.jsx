import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, BadgeCheck, TrendingUp } from 'lucide-react'
import Container from '@/components/ui/Container'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'

const CATEGORIES = ['전체', '뷰티', '패션', '음식', '여행', '운동', 'IT', '육아', '반려동물', '라이프스타일']
const SORTS = [
  { k: 'followers', label: '팔로워 많은 순' },
  { k: 'engagement', label: '참여율 높은 순' },
  { k: 'recent', label: '최신 가입' },
]

function formatNumber(n) {
  if (!n && n !== 0) return '-'
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}만`
  return n.toLocaleString()
}

export default function CreatorExplore() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('전체')
  const [sort, setSort] = useState('followers')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category && category !== '전체') params.set('category', category)
    if (sort) params.set('sort', sort)
    api(`/api/creators?${params.toString()}`, { auth: false })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [q, category, sort])

  const filtered = items

  return (
    <>
      <section className="gradient-bg pt-16 pb-10 sm:pt-24">
        <Container>
          <div className="max-w-3xl">
            <div className="eyebrow">CREATORS</div>
            <h1 className="display-2 mt-3">브랜드에 맞는 크리에이터를 발견하세요.</h1>
            <p className="mt-4 text-[16px] text-[#6B7280]">
              카테고리·지역·팔로워로 필터링하고, 참여율과 성과 데이터까지 한눈에 확인합니다.
            </p>
          </div>

          <div className="mt-8 bg-white rounded-[22px] border border-[#EEF0F4] shadow-card p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <Input
                  leftAddon={<Search size={16} />}
                  placeholder="크리에이터 이름 또는 핸들로 검색"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-12 px-4 rounded-[12px] border border-[#E5E7EB] text-[14px] font-semibold text-[#333452] focus:border-[#5B47FB] focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.k} value={s.k}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`h-8 px-3 rounded-full text-[12.5px] font-semibold border transition ${
                    category === c
                      ? 'bg-[#0B0B1A] text-white border-[#0B0B1A]'
                      : 'bg-white text-[#333452] border-[#E5E7EB] hover:border-[#0B0B1A]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12">
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-[#6B7280]">조건에 맞는 크리에이터가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c) => (
              <CreatorCard key={c.user_id} creator={c} />
            ))}
          </div>
        )}
      </Container>
    </>
  )
}

function CreatorCard({ creator }) {
  const platforms = Array.isArray(creator.platforms) ? creator.platforms : []
  return (
    <Link
      to={`/creators/${creator.handle}`}
      className="block bg-white rounded-[20px] border border-[#EEF0F4] hover:border-[#0B0B1A] hover:shadow-elevated transition-all overflow-hidden group"
    >
      <div className="h-24 bg-gradient-to-br from-[#F2EFFF] via-white to-[#DEFFF8]" />
      <div className="px-5 pb-5">
        <div className="-mt-8 flex items-end justify-between">
          <div className="w-16 h-16 rounded-full border-4 border-white bg-gradient-to-br from-[#5B47FB] to-[#00C2A8] text-white flex items-center justify-center font-extrabold text-[18px]">
            {creator.display_name?.[0] || creator.handle?.[0]?.toUpperCase()}
          </div>
          {creator.verified && (
            <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[#F2EFFF] text-[#4735D1] text-[11px] font-bold">
              <BadgeCheck size={12} /> 인증
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="font-extrabold text-[16px] text-[#0B0B1A] truncate">{creator.display_name}</div>
        </div>
        <div className="text-[12.5px] text-[#6B7280]">@{creator.handle} · {creator.region || '지역 미공개'}</div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(creator.categories || []).slice(0, 3).map((c) => (
            <span key={c} className="h-6 px-2 rounded-full bg-[#F5F6FA] text-[11px] font-semibold text-[#333452]">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-[#F1F2F6] grid grid-cols-3 text-center">
          <div>
            <div className="text-[11px] text-[#6B7280]">팔로워</div>
            <div className="font-extrabold text-[14px] text-[#0B0B1A]">{formatNumber(creator.followers_total)}</div>
          </div>
          <div className="border-x border-[#F1F2F6]">
            <div className="text-[11px] text-[#6B7280]">참여율</div>
            <div className="font-extrabold text-[14px] text-[#00C2A8] inline-flex items-center gap-0.5 justify-center">
              {Number(creator.engagement_rate || 0).toFixed(1)}% <TrendingUp size={10} />
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#6B7280]">플랫폼</div>
            <div className="font-extrabold text-[14px] text-[#0B0B1A]">{platforms.length || 0}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
