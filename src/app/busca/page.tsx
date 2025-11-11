import { getAgenciesList } from '@/lib/agencies-utils'
import { getThemesWithHierarchy } from '@/lib/themes-utils'
import QueryPageClient from './QueryPageClient'

export default async function QueryPage() {
  const agencies = await getAgenciesList()
  const themes = await getThemesWithHierarchy()

  return <QueryPageClient agencies={agencies} themes={themes} />
}
