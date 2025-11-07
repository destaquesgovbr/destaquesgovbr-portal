import { getAgenciesList } from '@/lib/get-agencies-list'
import QueryPageClient from './QueryPageClient'

export default async function QueryPage() {
  const agencies = await getAgenciesList()

  return <QueryPageClient agencies={agencies} />
}
