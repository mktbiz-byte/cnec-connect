import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const load = () =>
    api('/api/notifications')
      .then((r) => { setItems(r.data || []); setUnread(r.unread || 0) })
      .catch(() => {})

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const onOpen = async () => {
    setOpen((v) => !v)
    if (!open && unread > 0) {
      await api('/api/notifications/read-all', { method: 'POST' })
      setUnread(0)
      load()
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={onOpen} className="relative w-10 h-10 rounded-[10px] hover:bg-[#F3F4F6] inline-flex items-center justify-center" aria-label="알림">
        <Bell size={18} className="text-[#333452]" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#FF5A5A] text-white text-[10px] font-bold inline-flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[340px] bg-white border border-[#EEF0F4] rounded-[14px] shadow-elevated overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#F1F2F6] font-bold text-[13.5px]">알림</div>
          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-[#6B7280]">새 알림이 없습니다.</div>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  to={n.link || '#'}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block px-4 py-3 border-b border-[#F5F6FA] hover:bg-[#FAFAFB]',
                    !n.read_at && 'bg-[#F5F6FA]/50',
                  )}
                >
                  <div className="font-semibold text-[13px] text-[#0B0B1A] line-clamp-1">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-[12px] text-[#6B7280] line-clamp-2">{n.body}</div>}
                  <div className="mt-1 text-[10.5px] text-[#9CA3AF]">{new Date(n.created_at).toLocaleString('ko-KR')}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
