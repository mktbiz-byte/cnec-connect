import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'

export default function Placeholder({ title, description }) {
  return (
    <>
      <PageHeader title={title} subtitle={description} />
      <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
        <Card className="py-20 text-center text-[#6B7280]">
          이 기능은 곧 제공됩니다.
          <div className="mt-2 text-[12.5px]">다음 단계 배송(Step B / Step C)에서 활성화됩니다.</div>
        </Card>
      </div>
    </>
  )
}
