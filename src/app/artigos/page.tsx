import { getAgenciesList } from '@/lib/agencies-utils'
import { getThemesWithHierarchy } from '@/lib/themes-utils'
import ArticlesPageClient from './ArticlesPageClient'
import { getPopularTags } from './actions'

export default async function ArticlesPage() {
  const [agencies, themes, popularTags] = await Promise.all([
    getAgenciesList(),
    getThemesWithHierarchy(),
    getPopularTags(),
  ])

  return (
    <ArticlesPageClient
      agencies={agencies}
      themes={themes}
      popularTags={popularTags}
    />
  )
}
