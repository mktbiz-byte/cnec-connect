import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CreatorSearchPage = lazy(() => import('@/pages/CreatorSearchPage'))
const CreatorProfilePage = lazy(() => import('@/pages/CreatorProfilePage'))
const CreatorManagePage = lazy(() => import('@/pages/CreatorManagePage'))
const CampaignPage = lazy(() => import('@/pages/CampaignPage'))
const OutreachPage = lazy(() => import('@/pages/OutreachPage'))
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'))

function Loading() {
  return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" /></div>
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="alerts" element={<PlaceholderPage title="알림" />} />
          <Route path="creators/search" element={<CreatorSearchPage />} />
          <Route path="creators/manage" element={<CreatorManagePage />} />
          <Route path="creators/ranking" element={<PlaceholderPage title="크리에이터 랭킹" desc="월별/카테고리별 인게이지먼트 랭킹" />} />
          <Route path="creators/ai" element={<PlaceholderPage title="AI 리스트업" desc="AI에게 크리에이터 추천을 요청하세요" />} />
          <Route path="creators/:id" element={<CreatorProfilePage />} />
          <Route path="content/library" element={<PlaceholderPage title="콘텐츠 라이브러리" desc="캠페인 콘텐츠를 한곳에서 관리" />} />
          <Route path="content/tracking" element={<PlaceholderPage title="콘텐츠 트래킹" desc="키워드 기반 콘텐츠 자동 수집 및 성과 추적" />} />
          <Route path="campaigns" element={<CampaignPage />} />
          <Route path="outreach" element={<OutreachPage />} />
          <Route path="settings" element={<PlaceholderPage title="설정" desc="구독 관리, 발신 계정, Meta 연동" />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
