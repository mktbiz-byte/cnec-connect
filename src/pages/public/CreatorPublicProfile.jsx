import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, MapPin, Mail } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

function formatNumber(n) {
  if (!n && n !== 0) return '-'
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}만`
  return n.toLocaleString()
}

export default function CreatorPublicProfile() {
  const { handle } = useParams()
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    api(`/api/creators/${handle}`, { auth: false })
      .then((res) => setCreator(res.data))
      .catch(() => setCreator(null))
      .finally(() => setLoading(false))
  }, [handle])

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-6 h-6 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!creator) {
    return (
      <Container className="py-24 text-center">
        <h1 className="display-2">크리에이터를 찾을 수 없습니다</h1>
        <div className="mt-8"><Button as={Link} to="/creators/explore" variant="outline">탐색으로 돌아가기</Button></div>
      </Container>
    )
  }

  const platforms = Array.isArray(creator.platforms) ? creator.platforms : []

  return (
    <>
      <section className="relative pt-16 pb-24 gradient-bg overflow-hidden">
        <Container>
          <div className="grid md:grid-cols-3 gap-10 items-end">
            <div className="md:col-span-2">
              <div className="eyebrow">CREATOR PROFILE</div>
              <div className="mt-3 flex items-center gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#5B47FB] to-[#00C2A8] text-white flex items-center justify-center font-extrabold text-[32px] border-4 border-white shadow-card">
                  {creator.display_name?.[0] || creator.handle?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-[32px] md:text-[44px] font-extrabold tracking-tight text-[#0B0B1A] inline-flex items-center gap-2">
                    {creator.display_name}
                    {creator.verified && <BadgeCheck size={22} className="text-[#5B47FB]" />}
                  </h1>
                  <div className="mt-1 text-[14.5px] text-[#6B7280]">@{creator.handle}</div>
                </div>
              </div>
              {creator.bio && <p className="mt-6 max-w-[640px] text-[15.5px] leading-relaxed text-[#333452]">{creator.bio}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-[#6B7280]">
                {creator.region && (<span className="inline-flex items-center gap-1"><MapPin size={14} /> {creator.region}</span>)}
                <span>카테고리: {creator.categories?.join(', ') || '미지정'}</span>
              </div>
            </div>
            <div className="flex md:justify-end gap-3">
              {user?.role === 'business' ? (
                <Button as={Link} to="/app/business/campaigns/new" variant="primary">이 크리에이터와 함께 캠페인 만들기</Button>
              ) : (
                <Button as={Link} to="/signup/business" variant="primary">브랜드로 제안 보내기</Button>
              )}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: '총 팔로워', v: formatNumber(creator.followers_total) },
              { l: '평균 조회수', v: formatNumber(creator.avg_views) },
              { l: '참여율', v: `${Number(creator.engagement_rate || 0).toFixed(1)}%` },
              { l: '플랫폼 수', v: platforms.length || 0 },
            ].map((s) => (
              <div key={s.l} className="bg-white border border-[#EEF0F4] rounded-[18px] p-5">
                <div className="text-[12px] font-semibold text-[#6B7280]">{s.l}</div>
                <div className="mt-1 text-[26px] font-extrabold text-[#0B0B1A] tracking-tight">{s.v}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <h2 className="text-[24px] font-extrabold text-[#0B0B1A]">활동 플랫폼</h2>
        {platforms.length === 0 ? (
          <p className="mt-4 text-[#6B7280]">등록된 플랫폼이 없습니다.</p>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((p, i) => (
              <div key={i} className="bg-white border border-[#EEF0F4] rounded-[18px] p-5">
                <div className="font-bold text-[14.5px] text-[#0B0B1A] capitalize">{p.name}</div>
                <div className="mt-1 text-[13px] text-[#6B7280]">@{p.handle}</div>
                {p.followers !== undefined && (
                  <div className="mt-3 text-[22px] font-extrabold text-[#0B0B1A]">{formatNumber(p.followers)} <span className="text-[12px] text-[#6B7280] font-semibold">팔로워</span></div>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  )
}
