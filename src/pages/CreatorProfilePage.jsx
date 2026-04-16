import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ExternalLink, Bookmark, BookmarkCheck, Send, RefreshCw, Eye, Heart, MessageSquare, TrendingUp, Users, FileText } from 'lucide-react'
import { MOCK_CREATORS, formatNumber } from '@/data/mock'

const TABS = ['핵심 지표', '팔로워 성장률', '오디언스', '인게이지먼트', '콘텐츠', '광고 콘텐츠 분석', '비용 및 성과 예측', 'ROAS 이력']

export default function CreatorProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('핵심 지표')
  const [saved, setSaved] = useState(false)

  const creator = MOCK_CREATORS.find(c => c.id === id) || MOCK_CREATORS[0]
  const regionFlag = { KR: '🇰🇷', JP: '🇯🇵', US: '🇺🇸' }

  const stats = [
    { label: '팔로워', value: formatNumber(creator.followers), icon: Users },
    { label: '팔로잉', value: formatNumber(creator.following), icon: Users },
    { label: '게시물', value: formatNumber(creator.posts), icon: FileText },
    { label: '참여율', value: creator.er + '%', icon: TrendingUp },
    { label: '평균 좋아요', value: formatNumber(creator.avgLikes), icon: Heart },
    { label: '평균 댓글', value: formatNumber(creator.avgComments), icon: MessageSquare },
    { label: '평균 조회수', value: formatNumber(creator.avgViews), icon: Eye },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7] mb-4">
        <ChevronLeft size={16} />크리에이터 목록으로
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E8E8E8] p-6 mb-4">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-medium shrink-0"
            style={{ background: creator.isRegistered ? '#6C5CE7' : '#B4B2A9' }}>{creator.name[0]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold">{creator.name}</h1>
              <span className="text-sm">{regionFlag[creator.region]}</span>
              {creator.gradeLevel && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#6C5CE7] font-medium">
                  크넥 Lv.{creator.gradeLevel}
                </span>
              )}
              {creator.isRegistered ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6FFF9] text-[#085041]">가입됨</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">미가입</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">@{creator.username}</p>
            <p className="text-sm text-gray-600 mb-3">{creator.bio}</p>
            <div className="flex gap-2">
              <button className="h-9 px-5 rounded-lg bg-[#6C5CE7] text-white text-sm font-medium flex items-center gap-1.5">
                <Send size={14} />캠페인 제안하기
              </button>
              <button onClick={() => setSaved(!saved)} className="h-9 px-4 rounded-lg border border-[#E8E8E8] text-sm flex items-center gap-1.5 hover:border-[#6C5CE7]">
                {saved ? <BookmarkCheck size={14} className="text-[#6C5CE7]" /> : <Bookmark size={14} />}
                {saved ? '저장됨' : '저장'}
              </button>
              <button className="h-9 px-4 rounded-lg border border-[#E8E8E8] text-sm flex items-center gap-1.5 hover:border-[#6C5CE7]">
                <ExternalLink size={14} />인스타그램
              </button>
            </div>
          </div>
          {creator.roas && (
            <div className="text-right shrink-0">
              <div className="text-3xl font-semibold text-[#00B894]">{creator.roas}%</div>
              <div className="text-xs text-gray-500">평균 ROAS</div>
            </div>
          )}
        </div>
      </div>

      {/* Meta refresh bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 mb-4 bg-gray-50 rounded-lg border border-[#E8E8E8]">
        <span className="text-xs text-gray-500 flex-1">데이터 기준: 2026.04.13 · Meta Business Discovery API</span>
        <button className="h-7 px-3 rounded-md bg-[#00B894] text-white text-xs font-medium flex items-center gap-1">
          <RefreshCw size={12} />실시간 갱신
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.slice(0, 4).map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E8E8E8] p-4 text-center">
            <div className="text-xl font-semibold">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.slice(4).map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E8E8E8] p-4 text-center">
            <div className="text-xl font-semibold">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#E8E8E8] mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === t ? 'border-[#6C5CE7] text-[#6C5CE7] font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === '핵심 지표' && (
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
          <h3 className="font-medium mb-1">핵심 지표</h3>
          <p className="text-xs text-gray-500 mb-6">최근 수집된 24개 콘텐츠 기준으로 산출</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-[#E8E8E8] rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">예상 유효 팔로워 수</div>
              <div className="text-2xl font-semibold">{formatNumber(Math.round(creator.followers * 0.78))}</div>
              <div className="text-[10px] text-gray-400 mt-1">전체 팔로워의 약 78%</div>
            </div>
            <div className="border border-[#E8E8E8] rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">예상 평균 도달 수</div>
              <div className="text-2xl font-semibold">{formatNumber(Math.round(creator.followers * 0.32))}</div>
            </div>
            <div className="border border-[#E8E8E8] rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">평균 동영상 조회 수</div>
              <div className="text-2xl font-semibold">{formatNumber(creator.avgViews)}</div>
            </div>
          </div>
        </div>
      )}

      {tab === '콘텐츠' && (
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
          <h3 className="font-medium mb-4">최근 콘텐츠</h3>
          <div className="grid grid-cols-3 gap-3">
            {(creator.recentPosts || []).concat(Array(9 - (creator.recentPosts?.length || 0)).fill(null)).slice(0, 9).map((p, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative cursor-pointer group">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100" />
                {p?.views && (
                  <div className="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-tr">▶ {formatNumber(p.views)}</div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100">
                    {p ? `▶ ${formatNumber(p.views || 0)}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'ROAS 이력' && (
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
          <h3 className="font-medium mb-1">캠페인 ROAS 이력</h3>
          <p className="text-xs text-gray-500 mb-4">Meta ads_read API를 통해 자동 수집된 광고 성과</p>
          {creator.roas ? (
            <>
              <div className="flex items-baseline gap-4 mb-6">
                <div className="text-3xl font-semibold text-[#00B894]">{creator.roas}%</div>
                <div className="text-sm text-gray-500">평균 ROAS (3건)</div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E8E8]">
                    <th className="text-left py-2 font-medium text-gray-600">캠페인</th>
                    <th className="text-right py-2 font-medium text-gray-600">광고비</th>
                    <th className="text-right py-2 font-medium text-gray-600">전환</th>
                    <th className="text-right py-2 font-medium text-gray-600">ROAS</th>
                    <th className="text-right py-2 font-medium text-gray-600">측정일</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E8E8E8]"><td className="py-2.5">스킨피디아 파우더워시</td><td className="text-right">₩320,000</td><td className="text-right">28건</td><td className="text-right font-medium text-[#00B894]">520%</td><td className="text-right text-gray-500">2026-03</td></tr>
                  <tr className="border-b border-[#E8E8E8]"><td className="py-2.5">롬앤 글래스팅 립</td><td className="text-right">₩180,000</td><td className="text-right">15건</td><td className="text-right font-medium text-[#00B894]">380%</td><td className="text-right text-gray-500">2026-02</td></tr>
                  <tr><td className="py-2.5">토리든 세럼 4주챌린지</td><td className="text-right">₩450,000</td><td className="text-right">31건</td><td className="text-right font-medium text-[#00B894]">360%</td><td className="text-right text-gray-500">2026-01</td></tr>
                </tbody>
              </table>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">아직 ROAS 데이터가 없습니다</p>
              <p className="text-xs mt-1">브랜드가 Meta 광고 계정을 연결하면 자동으로 수집됩니다</p>
            </div>
          )}
        </div>
      )}

      {!['핵심 지표', '콘텐츠', 'ROAS 이력'].includes(tab) && (
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-12 text-center text-gray-400">
          <div className="text-sm mb-1">{tab} 탭</div>
          <div className="text-xs">Meta API 연동 후 데이터가 표시됩니다</div>
        </div>
      )}
    </div>
  )
}
