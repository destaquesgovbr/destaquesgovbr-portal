import { notFound } from 'next/navigation'
import { getAgenciesByName } from '@/lib/agencies-utils'
import { getThemesWithHierarchy } from '@/lib/themes-utils'
import AgencyPageClient from './AgencyPageClient'

type AgencyPageProps = {
  params: Promise<{
    agencyKey: string
  }>
}

export default async function AgencyPage({ params }: AgencyPageProps) {
  const { agencyKey } = await params
  const agencies = await getAgenciesByName()
  const themes = await getThemesWithHierarchy()

  const agency = agencies[agencyKey]

  if (!agency) {
    notFound()
  }

  return (
    <AgencyPageClient
      agencyKey={agencyKey}
      agencyName={agency.name}
      themes={themes}
    />
  )
}
