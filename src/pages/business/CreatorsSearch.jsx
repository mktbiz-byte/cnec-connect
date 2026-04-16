import CreatorExplore from '@/pages/public/CreatorExplore'
import PageHeader from '@/components/ui/PageHeader'

export default function BusinessCreatorsSearch() {
  return (
    <>
      <PageHeader title="크리에이터 탐색" subtitle="브랜드에 맞는 크리에이터를 필터로 정확히 찾아보세요." />
      <CreatorExplore />
    </>
  )
}
