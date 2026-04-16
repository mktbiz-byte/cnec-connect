import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card, { Badge } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

const PLATFORMS = ['instagram', 'youtube', 'tiktok', 'blog']

export default function CreatorContent() {
  const [apps, setApps] = useState([])
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState({
    campaignId: '',
    platform: 'instagram',
    postUrl: '',
    views: '',
    likes: '',
    comments: '',
    shares: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [ok, setOk] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const load = () =>
    Promise.all([
      api('/api/applications/mine').catch(() => ({ data: [] })),
      api('/api/content/mine').catch(() => ({ data: [] })),
    ]).then(([a, p]) => {
      setApps((a.data || []).filter((x) => x.status === 'accepted'))
      setPosts(p.data || [])
    })

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    setOk(false)
    try {
      await api('/api/content', {
        method: 'POST',
        body: {
          campaignId: form.campaignId,
          platform: form.platform,
          postUrl: form.postUrl,
          views: form.views ? Number(form.views) : undefined,
          likes: form.likes ? Number(form.likes) : undefined,
          comments: form.comments ? Number(form.comments) : undefined,
          shares: form.shares ? Number(form.shares) : undefined,
        },
      })
      setOk(true)
      setForm({ campaignId: '', platform: 'instagram', postUrl: '', views: '', likes: '', comments: '', shares: '' })
      load()
    } catch (err) {
      setError(err.message || '제출 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="콘텐츠 제출" subtitle="확정된 캠페인에 업로드한 게시물을 등록해 성과를 공유하세요." />
      <div className="px-6 md:px-10 py-8 max-w-[980px] mx-auto grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-[16px] font-extrabold">게시물 등록</h3>
          {apps.length === 0 ? (
            <div className="mt-5 text-[13px] text-[#6B7280]">확정된 캠페인이 없습니다. 먼저 지원하고 브랜드의 확정을 기다려주세요.</div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3">
              <div>
                <div className="text-[13px] font-semibold text-[#333452] mb-1.5">캠페인</div>
                <select value={form.campaignId} onChange={(e) => set('campaignId', e.target.value)} required
                  className="w-full h-12 px-4 rounded-[12px] border border-[#E5E7EB] text-[14px]">
                  <option value="">선택하세요</option>
                  {apps.map((a) => <option key={a.campaign_id} value={a.campaign_id}>{a.campaign_title}</option>)}
                </select>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#333452] mb-1.5">플랫폼</div>
                <select value={form.platform} onChange={(e) => set('platform', e.target.value)}
                  className="w-full h-12 px-4 rounded-[12px] border border-[#E5E7EB] text-[14px]">
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input label="게시물 URL" type="url" value={form.postUrl} onChange={(e) => set('postUrl', e.target.value)} required placeholder="https://..." />
              <div className="grid grid-cols-2 gap-3">
                <Input label="조회수" type="number" value={form.views} onChange={(e) => set('views', e.target.value)} min={0} />
                <Input label="좋아요" type="number" value={form.likes} onChange={(e) => set('likes', e.target.value)} min={0} />
                <Input label="댓글" type="number" value={form.comments} onChange={(e) => set('comments', e.target.value)} min={0} />
                <Input label="공유" type="number" value={form.shares} onChange={(e) => set('shares', e.target.value)} min={0} />
              </div>
              {error && <div className="text-[12.5px] text-[#FF5A5A]">{error}</div>}
              {ok && <div className="text-[12.5px] text-[#17804D]">제출되었습니다. 브랜드 승인 후 대시보드에 반영됩니다.</div>}
              <Button type="submit" size="lg" fullWidth loading={saving}>콘텐츠 등록</Button>
            </form>
          )}
        </Card>

        <Card className="lg:col-span-3" padded={false}>
          <div className="px-6 py-5 border-b border-[#F1F2F6]"><h3 className="text-[16px] font-extrabold">내가 등록한 콘텐츠</h3></div>
          {posts.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">등록된 콘텐츠가 없습니다.</div>
          ) : (
            <div className="divide-y divide-[#F1F2F6]">
              {posts.map((p) => (
                <div key={p.id} className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-[#5B47FB]">{p.platform}</span>
                    <Badge tone={p.approved ? 'success' : 'warn'}>{p.approved ? '승인됨' : '검토중'}</Badge>
                  </div>
                  <div className="mt-1.5 font-bold text-[14px] text-[#0B0B1A] truncate">{p.campaign_title}</div>
                  <a href={p.post_url} target="_blank" rel="noreferrer" className="text-[12px] text-[#5B47FB] underline break-all">{p.post_url}</a>
                  <div className="mt-2 grid grid-cols-4 gap-3 text-[12px] text-[#6B7280]">
                    <span>조회 <b className="text-[#0B0B1A]">{(p.views || 0).toLocaleString()}</b></span>
                    <span>좋아요 <b className="text-[#0B0B1A]">{(p.likes || 0).toLocaleString()}</b></span>
                    <span>댓글 <b className="text-[#0B0B1A]">{(p.comments || 0).toLocaleString()}</b></span>
                    <span>공유 <b className="text-[#0B0B1A]">{(p.shares || 0).toLocaleString()}</b></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
