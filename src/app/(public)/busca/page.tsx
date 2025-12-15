import { getAgenciesList } from '@/data/agencies-utils'
import { getThemesWithHierarchy } from '@/data/themes-utils'
import QueryPageClient from './QueryPageClient'

export default async function QueryPage() {
  const agencies = await getAgenciesList()
  const themes = await getThemesWithHierarchy()

  return <QueryPageClient agencies={agencies} themes={themes} />
}
