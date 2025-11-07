import { getAgenciesList } from '@/lib/get-agencies-list'
import ArticlesPageClient from './ArticlesPageClient'

export default async function ArticlesPage() {
  const agencies = await getAgenciesList()

  return <ArticlesPageClient agencies={agencies} />
}
