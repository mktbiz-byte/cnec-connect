export const MOCK_CREATORS = [
  { id: '1', username: 'beautysoobin', name: '뷰티수빈', platform: 'instagram', category: '뷰티', region: 'KR', followers: 45200, er: 4.8, avgViews: 12300, avgLikes: 2174, avgComments: 89, posts: 1247, following: 892, bio: '매일 쓸 수 있는 진짜 뷰티 루틴을 소개합니다', profileImage: null, isRegistered: true, gradeLevel: 4, tags: ['색조', '스킨케어', 'GRWM'], recentPosts: [{ thumb: null, views: 15200, url: '#' }, { thumb: null, views: 9180, url: '#' }, { thumb: null, views: 22400, url: '#' }, { thumb: null, views: 7600, url: '#' }], roas: 420, email: 'soobin@example.com' },
  { id: '2', username: 'glowhana', name: '글로우하나', platform: 'instagram', category: '뷰티', region: 'KR', followers: 28700, er: 5.2, avgViews: 8500, avgLikes: 1493, avgComments: 67, posts: 834, following: 445, bio: '피부 고민 해결! 솔직한 스킨케어 리뷰', profileImage: null, isRegistered: true, gradeLevel: 3, tags: ['스킨케어'], recentPosts: [{ thumb: null, views: 6000, url: '#' }, { thumb: null, views: 4200, url: '#' }], roas: null, email: 'hana@example.com' },
  { id: '3', username: 'sakura_cosme', name: '桜コスメ', platform: 'instagram', category: '뷰티', region: 'JP', followers: 67100, er: 3.8, avgViews: 21400, avgLikes: 2549, avgComments: 112, posts: 2103, following: 320, bio: '韓国コスメ大好き！毎日メイクレビュー', profileImage: null, isRegistered: false, gradeLevel: null, tags: ['색조', 'J-뷰티', 'K-beauty'], recentPosts: [{ thumb: null, views: 32000, url: '#' }, { thumb: null, views: 18000, url: '#' }, { thumb: null, views: 14500, url: '#' }], roas: 380, email: null },
  { id: '4', username: 'skinbymia', name: 'SkinByMia', platform: 'instagram', category: '뷰티', region: 'US', followers: 89200, er: 5.1, avgViews: 34500, avgLikes: 4549, avgComments: 203, posts: 567, following: 198, bio: 'K-beauty obsessed | Honest reviews only', profileImage: null, isRegistered: false, gradeLevel: null, tags: ['스킨케어', 'K-beauty', 'Clean beauty'], recentPosts: [{ thumb: null, views: 45000, url: '#' }, { thumb: null, views: 28000, url: '#' }], roas: null, email: 'mia@example.com' },
  { id: '5', username: 'makeup_jiyeon', name: '메이크업지연', platform: 'instagram', category: '뷰티', region: 'KR', followers: 15800, er: 6.3, avgViews: 5200, avgLikes: 995, avgComments: 78, posts: 423, following: 567, bio: '메이크업 아티스트 출신 | 데일리 메이크업', profileImage: null, isRegistered: true, gradeLevel: 2, tags: ['색조', '메이크업'], recentPosts: [{ thumb: null, views: 3800, url: '#' }], roas: null, email: 'jiyeon@example.com' },
  { id: '6', username: 'yuki_beauty_jp', name: 'ゆきビューティー', platform: 'instagram', category: '뷰티', region: 'JP', followers: 34500, er: 4.1, avgViews: 11200, avgLikes: 1414, avgComments: 56, posts: 789, following: 234, bio: 'スキンケアオタク🧴韓国コスメレビュー', profileImage: null, isRegistered: true, gradeLevel: 3, tags: ['스킨케어', 'K-beauty'], recentPosts: [{ thumb: null, views: 9800, url: '#' }, { thumb: null, views: 7200, url: '#' }, { thumb: null, views: 12100, url: '#' }], roas: 310, email: 'yuki@example.jp' },
  { id: '7', username: 'glowup_ashley', name: 'Ashley Kim', platform: 'instagram', category: '뷰티', region: 'US', followers: 52300, er: 3.9, avgViews: 18700, avgLikes: 2039, avgComments: 134, posts: 345, following: 412, bio: 'Korean-American beauty creator | LA based', profileImage: null, isRegistered: false, gradeLevel: null, tags: ['색조', 'GRWM', 'K-beauty'], recentPosts: [{ thumb: null, views: 22000, url: '#' }, { thumb: null, views: 15600, url: '#' }], roas: null, email: 'ashley@example.com' },
  { id: '8', username: 'daily_bora', name: '데일리보라', platform: 'instagram', category: '뷰티', region: 'KR', followers: 8900, er: 7.1, avgViews: 3100, avgLikes: 632, avgComments: 45, posts: 234, following: 678, bio: '뷰티 초보의 솔직 리뷰 일기', profileImage: null, isRegistered: true, gradeLevel: 1, tags: ['스킨케어', '올리브영'], recentPosts: [{ thumb: null, views: 2800, url: '#' }], roas: null, email: 'bora@example.com' },
]

export const MOCK_CAMPAIGNS = [
  { id: '1', title: '스킨피디아 엔자임 파우더워시', status: 'recruiting', type: 'planned', tier: 'light', fee: 200000, slots: 10, filled: 2, brand: '스킨피디아', region: 'KR', deadline: '2026-05-01' },
  { id: '2', title: '롬앤 글래스팅 멜팅 밤', status: 'recruiting', type: 'planned', tier: 'standard', fee: 500000, slots: 5, filled: 2, brand: '롬앤', region: 'KR', deadline: '2026-04-28' },
  { id: '3', title: '토리든 다이브인 세럼 4주챌린지', status: 'draft', type: '4week_challenge', tier: 'basic', fee: 300000, slots: 10, filled: 0, brand: '토리든', region: 'KR', deadline: '2026-05-15' },
]

export const MOCK_GROUPS = [
  { id: '1', name: 'K-뷰티 색조 Top', platform: 'instagram', count: 12, capacity: 500 },
  { id: '2', name: 'JP 스킨케어 크리에이터', platform: 'instagram', count: 8, capacity: 500 },
  { id: '3', name: 'US K-beauty 인플루언서', platform: 'instagram', count: 5, capacity: 500 },
]

export const MOCK_OUTREACH = [
  { id: '1', title: '스킨피디아 캠페인 크리에이터 모집', status: 'sent', channel: 'email', success: 8, fail: 2, createdAt: '2026-04-15' },
  { id: '2', title: 'JP 크리에이터 초대 DM', status: 'sending', channel: 'dm', success: 3, fail: 0, createdAt: '2026-04-16' },
]

export const CATEGORIES = ['전체', '뷰티', '패션', '푸드', '라이프스타일', '테크']
export const REGIONS = [
  { value: 'all', label: '전체 국가' },
  { value: 'KR', label: '🇰🇷 한국' },
  { value: 'JP', label: '🇯🇵 일본' },
  { value: 'US', label: '🇺🇸 미국' },
]
export const PLATFORMS = [
  { value: 'instagram', label: '인스타그램', icon: 'Camera' },
  { value: 'youtube', label: '유튜브', icon: 'Play' },
  { value: 'tiktok', label: '틱톡', icon: 'Music' },
]
export const SORT_OPTIONS = [
  { value: 'followers', label: '팔로워순' },
  { value: 'er', label: '참여율순' },
  { value: 'avgViews', label: '조회수순' },
  { value: 'recent', label: '최신순' },
]

export function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export function formatMoney(n) {
  return '₩' + (n || 0).toLocaleString()
}
