import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import { api } from '@/lib/api'
import { Users, Megaphone, Wallet, Instagram } from 'lucide-react'

function sum(rows) { return rows.reduce((s, r) => s + Number(r.n || 0), 0) }
function pickN(rows, key, val) { return rows.find((r) => r[key] === val)?.n || 0 }

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api('/api/admin/summary').then(setData).finally(() => setLoading(false))
  }, [])

  const creators = pickN(data?.users || [], 'role', 'creator')
  const brands = pickN(data?.users || [], 'role', 'business')
  const activeCampaigns = pickN(data?.campaigns || [], 'status', 'recruiting') + pickN(data?.campaigns || [], 'status', 'in_progress')
  const escrowHeld = (data?.payments || []).find((p) => p.status === 'paid')?.total || 0

  return (
    <>
      <PageHeader title="관리자 대시보드" subtitle="플랫폼 전체 지표와 이벤트를 한눈에." />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-5 h-5 border-2 border-[#5B47FB] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat icon={Users} label="크리에이터" value={creators.toLocaleString()} />
              <Stat icon={Users} label="브랜드" value={brands.toLocaleString()} />
              <Stat icon={Megaphone} label="활성 캠페인" value={activeCampaigns.toLocaleString()} />
              <Stat icon={Wallet} label="에스크로 보관액" value={`₩${Number(escrowHeld).toLocaleString()}`} />
            </div>

            <div className="mt-8 grid lg:grid-cols-3 gap-5">
              <Card>
                <h3 className="text-[16px] font-extrabold">사용자 분포</h3>
                <div className="mt-4 space-y-2">
                  {(data?.users || []).map((u) => (
                    <div key={u.role} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-[#6B7280]">{u.role}</span>
                      <b className="text-[#0B0B1A]">{u.n.toLocaleString()}</b>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="text-[16px] font-extrabold">캠페인 상태</h3>
                <div className="mt-4 space-y-2">
                  {(data?.campaigns || []).map((u) => (
                    <div key={u.status} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-[#6B7280]">{u.status}</span>
                      <b className="text-[#0B0B1A]">{u.n.toLocaleString()}</b>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="text-[16px] font-extrabold">지원 상태</h3>
                <div className="mt-4 space-y-2">
                  {(data?.applications || []).map((u) => (
                    <div key={u.status} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-[#6B7280]">{u.status}</span>
                      <b className="text-[#0B0B1A]">{u.n.toLocaleString()}</b>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#4733D6] bg-[#F3F1FF] px-2 py-1 rounded-full"><Instagram size={13} /> 인스타 데이터 매칭</div>
                  <h3 className="mt-2 text-[16px] font-extrabold">임포트된 크리에이터</h3>
                  <p className="mt-1 text-[12.5px] text-[#6B7280]">
                    전체 {data?.imported?.total?.toLocaleString() || 0}건 · 매칭 {data?.imported?.matched?.toLocaleString() || 0}건
                  </p>
                </div>
                <Link to="/app/admin/imports" className="text-[13px] font-semibold text-[#5B47FB]">관리 →</Link>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-[#EEF0F4] rounded-[18px] p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#F3F1FF] text-[#4733D6] flex items-center justify-center"><Icon size={20} /></div>
      <div>
        <div className="text-[12px] font-semibold text-[#6B7280]">{label}</div>
        <div className="mt-0.5 text-[20px] font-extrabold text-[#0B0B1A] tracking-tight">{value}</div>
      </div>
    </div>
  )
}
