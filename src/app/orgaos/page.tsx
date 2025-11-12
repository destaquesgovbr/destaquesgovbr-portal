import { getAgenciesList } from '@/lib/agencies-utils'
import OrgaosPageClient from './OrgaosPageClient'

export default async function OrgaosPage() {
  const agencies = await getAgenciesList()

  return <OrgaosPageClient agencies={agencies} />
}
