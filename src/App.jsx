import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'
import PrivateRoute from '@/components/PrivateRoute'

const Landing = lazy(() => import('@/pages/public/Landing'))
const Pricing = lazy(() => import('@/pages/public/Pricing'))
const About = lazy(() => import('@/pages/public/About'))
const CreatorExplore = lazy(() => import('@/pages/public/CreatorExplore'))
const CreatorPublicProfile = lazy(() => import('@/pages/public/CreatorPublicProfile'))
const PublicCampaignDetail = lazy(() => import('@/pages/public/CampaignDetail'))

const Login = lazy(() => import('@/pages/auth/Login'))
const LoginCreator = lazy(() => import('@/pages/auth/LoginCreator'))
const LoginBusiness = lazy(() => import('@/pages/auth/LoginBusiness'))
const LoginAdmin = lazy(() => import('@/pages/auth/LoginAdmin'))
const SignupCreator = lazy(() => import('@/pages/auth/SignupCreator'))
const SignupBusiness = lazy(() => import('@/pages/auth/SignupBusiness'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))

const CreatorDashboard = lazy(() => import('@/pages/creator/Dashboard'))
const CreatorCampaigns = lazy(() => import('@/pages/creator/Campaigns'))
const Applications = lazy(() => import('@/pages/creator/Applications'))
const CreatorProfilePage = lazy(() => import('@/pages/creator/Profile'))
const CreatorEarnings = lazy(() => import('@/pages/creator/Earnings'))
const CreatorContent = lazy(() => import('@/pages/creator/Content'))

const BusinessDashboard = lazy(() => import('@/pages/business/Dashboard'))
const BusinessCampaigns = lazy(() => import('@/pages/business/Campaigns'))
const CampaignNew = lazy(() => import('@/pages/business/CampaignNew'))
const CampaignDetail = lazy(() => import('@/pages/business/CampaignDetail'))
const BusinessCreatorsSearch = lazy(() => import('@/pages/business/CreatorsSearch'))
const BusinessPayments = lazy(() => import('@/pages/business/Payments'))
const BusinessAnalytics = lazy(() => import('@/pages/business/Analytics'))

const Messages = lazy(() => import('@/pages/common/Messages'))

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const AdminCampaigns = lazy(() => import('@/pages/admin/Campaigns'))
const AdminApplications = lazy(() => import('@/pages/admin/Applications'))
const AdminContent = lazy(() => import('@/pages/admin/Content'))
const AdminPayments = lazy(() => import('@/pages/admin/Payments'))
const AdminBroadcast = lazy(() => import('@/pages/admin/Broadcast'))
const AdminActivity = lazy(() => import('@/pages/admin/Activity'))
const AdminImports = lazy(() => import('@/pages/admin/Imports'))

const Placeholder = lazy(() => import('@/pages/common/Placeholder'))

function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* 공개 */}
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="creators/explore" element={<CreatorExplore />} />
          <Route path="creators/:handle" element={<CreatorPublicProfile />} />
          <Route path="campaigns/:id" element={<PublicCampaignDetail />} />
        </Route>

        {/* 인증 */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="login/creator" element={<LoginCreator />} />
          <Route path="login/business" element={<LoginBusiness />} />
          <Route path="login/admin" element={<LoginAdmin />} />
          <Route path="signup/creator" element={<SignupCreator />} />
          <Route path="signup/business" element={<SignupBusiness />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* 크리에이터 앱 */}
        <Route
          path="app/creator"
          element={
            <PrivateRoute role="creator">
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CreatorDashboard />} />
          <Route path="campaigns" element={<CreatorCampaigns />} />
          <Route path="applications" element={<Applications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="earnings" element={<CreatorEarnings />} />
          <Route path="content" element={<CreatorContent />} />
          <Route path="profile" element={<CreatorProfilePage />} />
          <Route path="settings" element={<Placeholder title="설정" description="계정·알림·연동 관리" />} />
        </Route>

        {/* 기업 앱 */}
        <Route
          path="app/business"
          element={
            <PrivateRoute role="business">
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<BusinessDashboard />} />
          <Route path="creators" element={<BusinessCreatorsSearch />} />
          <Route path="campaigns" element={<BusinessCampaigns />} />
          <Route path="campaigns/new" element={<CampaignNew />} />
          <Route path="campaigns/:id" element={<CampaignDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="payments" element={<BusinessPayments />} />
          <Route path="analytics" element={<BusinessAnalytics />} />
          <Route path="settings" element={<Placeholder title="설정" description="팀·계정·알림" />} />
        </Route>

        {/* 관리자 앱 */}
        <Route
          path="app/admin"
          element={
            <PrivateRoute role="admin">
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="broadcast" element={<AdminBroadcast />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="imports" element={<AdminImports />} />
        </Route>

        <Route path="*" element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function NotFound() {
  return (
    <div className="py-32 text-center">
      <div className="text-[60px] font-extrabold">404</div>
      <div className="mt-2 text-[#6B7280]">페이지를 찾을 수 없습니다.</div>
    </div>
  )
}
