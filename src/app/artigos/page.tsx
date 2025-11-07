import { getAgenciesList } from '@/lib/agencies-utils'
import ArticlesPageClient from './ArticlesPageClient'

export default async function ArticlesPage() {
  const agencies = await getAgenciesList()

  return <ArticlesPageClient agencies={agencies} />
}
