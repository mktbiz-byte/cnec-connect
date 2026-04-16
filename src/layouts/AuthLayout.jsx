import { Link, Outlet } from 'react-router-dom'
import Logo from '@/components/ui/Logo'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b border-[#EEF0F4] bg-white flex items-center px-6">
        <Link to="/">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 bg-[#FAFAFB]">
        <Outlet />
      </main>
    </div>
  )
}
