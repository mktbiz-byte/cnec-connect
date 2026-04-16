import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bookmark, BookmarkCheck, Camera, Play, Music, Filter, ChevronLeft, ChevronRight, CheckSquare, Square, Send, Download, Users } from 'lucide-react'
import { MOCK_CREATORS, CATEGORIES, REGIONS, PLATFORMS, SORT_OPTIONS, formatNumber } from '@/data/mock'

const FOLLOWER_RANGES = [
  { value: '', label: '전체' },
  { value: '0-10000', label: '~1만' },
  { value: '10000-50000', label: '1만~5만' },
  { value: '50000-100000', label: '5만~10만' },
  { value: '100000-', label: '10만+' },
]

export default function CreatorSearchPage() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [region, setRegion] = useState('all')
  const [category, setCategory] = useState('전체')
  const [followerRange, setFollowerRange] = useState('')
  const [sort, setSort] = useState('followers')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [savedIds, setSavedIds] = useState(new Set())
  const [page, setPage] = useState(1)
  const limit = 20

  const filtered = useMemo(() => {
    let list = [...MOCK_CREATORS]
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase()))
    if (region !== 'all') list = list.filter(c => c.region === region)
    if (category !== '전체') list = list.filter(c => c.category === category || c.tags?.includes(category))
    if (followerRange) {
      const [min, max] = followerRange.split('-').map(Number)
      list = list.filter(c => c.followers >= (min || 0) && (!max || c.followers <= max))
    }
    list.sort((a, b) => {
      if (sort === 'followers') return b.followers - a.followers
      if (sort === 'er') return b.er - a.er
      if (sort === 'avgViews') return b.avgViews - a.avgViews
      return 0
    })
    return list
  }, [search, region, category, followerRange, sort])

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  const toggleSelect = (id) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }
  const toggleSave = (id) => {
    const next = new Set(savedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSavedIds(next)
  }
  const selectAll = () => {
    if (selectedIds.size === paged.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paged.map(c => c.id)))
  }

  const regionFlag = { KR: '🇰🇷', JP: '🇯🇵', US: '🇺🇸' }
  const gradeLabel = (lv) => {
    if (!lv) return null
    const labels = { 1: 'FRESH', 2: 'GROW', 3: 'BLOOM', 4: '추천', 5: 'MUSE' }
    return labels[lv] || `Lv.${lv}`
  }

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">크리에이터 찾기</h1>
          <p className="text-xs text-gray-500 mt-0.5">총 {filtered.length.toLocaleString()}명</p>
        </div>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 mb-4">
        {PLATFORMS.map(p => (
          <button key={p.value} onClick={() => setPlatform(p.value)}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${platform === p.value ? 'border-[#6C5CE7] bg-[#F0EDFF] text-[#6C5CE7] font-medium' : 'border-[#E8E8E8] bg-white text-gray-600 hover:bg-gray-50'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4 items-center">
        <div className="relative flex-1 max-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름 또는 핸들 검색"
            className="w-full h-9 pl-9 pr-3 border border-[#E8E8E8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#6C5CE7]" />
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)} className="h-9 px-3 border border-[#E8E8E8] rounded-lg text-sm bg-white">
          {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className="h-9 px-3 border border-[#E8E8E8] rounded-lg text-sm bg-white">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={followerRange} onChange={e => setFollowerRange(e.target.value)} className="h-9 px-3 border border-[#E8E8E8] rounded-lg text-sm bg-white">
          {FOLLOWER_RANGES.map(f => <option key={f.value} value={f.value}>{f.label || '팔로워 범위'}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="h-9 px-3 border border-[#E8E8E8] rounded-lg text-sm bg-white">
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Selection action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-4 bg-[#F0EDFF] rounded-lg">
          <span className="text-sm font-medium text-[#4A3D8F]">{selectedIds.size}명 선택</span>
          <button className="h-8 px-4 rounded-lg bg-[#6C5CE7] text-white text-xs font-medium flex items-center gap-1"><Send size={12} />캠페인 제안</button>
          <button className="h-8 px-4 rounded-lg bg-white text-[#6C5CE7] text-xs font-medium border border-[#D5CCF9] flex items-center gap-1"><Users size={12} />그룹에 추가</button>
          <button className="h-8 px-4 rounded-lg bg-white text-[#6C5CE7] text-xs font-medium border border-[#D5CCF9] flex items-center gap-1"><Download size={12} />엑셀 다운로드</button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-[#6C5CE7] underline">선택 해제</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E8E8] bg-gray-50">
              <th className="w-10 p-3"><button onClick={selectAll} className="text-gray-400 hover:text-[#6C5CE7]">{selectedIds.size === paged.length && paged.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}</button></th>
              <th className="text-left p-3 font-medium text-gray-600">계정</th>
              <th className="text-left p-3 font-medium text-gray-600">카테고리</th>
              <th className="text-right p-3 font-medium text-gray-600">팔로워 수</th>
              <th className="text-right p-3 font-medium text-gray-600">참여율</th>
              <th className="text-right p-3 font-medium text-gray-600">평균 조회수</th>
              <th className="text-right p-3 font-medium text-gray-600">평균 좋아요</th>
              <th className="text-center p-3 font-medium text-gray-600">상태</th>
              <th className="w-20 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(c => (
              <tr key={c.id} className="border-b border-[#E8E8E8] hover:bg-gray-50 transition-colors">
                <td className="p-3 text-center">
                  <button onClick={() => toggleSelect(c.id)} className="text-gray-400 hover:text-[#6C5CE7]">
                    {selectedIds.has(c.id) ? <CheckSquare size={16} className="text-[#6C5CE7]" /> : <Square size={16} />}
                  </button>
                </td>
                <td className="p-3">
                  <Link to={`/creators/${c.id}`} className="flex items-center gap-2.5 hover:text-[#6C5CE7]">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                      style={{ background: c.isRegistered ? '#6C5CE7' : '#B4B2A9' }}>{c.name[0]}</div>
                    <div>
                      <div className="font-medium text-[13px] flex items-center gap-1">
                        {c.name}
                        {regionFlag[c.region] && <span className="text-xs">{regionFlag[c.region]}</span>}
                      </div>
                      <div className="text-[11px] text-gray-400">@{c.username}</div>
                    </div>
                  </Link>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {c.tags?.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EDFF] text-[#6C5CE7]">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right font-medium">{formatNumber(c.followers)}</td>
                <td className="p-3 text-right">{c.er}%</td>
                <td className="p-3 text-right">{formatNumber(c.avgViews)}</td>
                <td className="p-3 text-right">{formatNumber(c.avgLikes)}</td>
                <td className="p-3 text-center">
                  {c.isRegistered ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6FFF9] text-[#085041] font-medium">가입됨</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">미가입</span>
                  )}
                  {c.roas && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6FFF9] text-[#085041] font-medium ml-1">ROAS {c.roas}%</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleSave(c.id)} className="p-1.5 rounded hover:bg-gray-100">
                      {savedIds.has(c.id) ? <BookmarkCheck size={14} className="text-[#6C5CE7]" /> : <Bookmark size={14} className="text-gray-400" />}
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#6C5CE7]">
                      <Send size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8E8E8]">
          <span className="text-xs text-gray-500">{filtered.length}명 중 {(page - 1) * limit + 1}~{Math.min(page * limit, filtered.length)}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="h-8 px-3 border border-[#E8E8E8] rounded-lg text-xs disabled:opacity-40"><ChevronLeft size={14} /></button>
            <span className="text-sm">{page} / {totalPages || 1}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              className="h-8 px-3 border border-[#E8E8E8] rounded-lg text-xs disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
