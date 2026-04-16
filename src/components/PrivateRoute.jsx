import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function PrivateRoute({ role, children }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    const to = role === 'business' ? '/login/business' : role === 'admin' ? '/login/business' : '/login/creator'
    return <Navigate to={to} state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    const home = user.role === 'admin' ? '/app/admin' : user.role === 'business' ? '/app/business' : '/app/creator'
    return <Navigate to={home} replace />
  }

  return children
}
