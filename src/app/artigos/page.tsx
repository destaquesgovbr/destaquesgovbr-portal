import { getAgenciesList } from '@/lib/agencies-utils'
import { getThemesList } from '@/lib/themes-utils'
import ArticlesPageClient from './ArticlesPageClient'

export default async function ArticlesPage() {
  const agencies = await getAgenciesList()
  const themes = await getThemesList()

  return <ArticlesPageClient agencies={agencies} themes={themes} />
}
