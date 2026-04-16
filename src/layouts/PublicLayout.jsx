import { Outlet } from 'react-router-dom'
import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
