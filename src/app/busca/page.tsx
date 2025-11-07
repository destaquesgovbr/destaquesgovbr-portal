import { getAgenciesList } from '@/lib/agencies-utils'
import QueryPageClient from './QueryPageClient'

export default async function QueryPage() {
  const agencies = await getAgenciesList()

  return <QueryPageClient agencies={agencies} />
}
