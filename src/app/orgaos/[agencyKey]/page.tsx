import { getAgenciesByName } from '@/lib/agencies-utils'
import { getThemesList } from '@/lib/themes-utils'
import AgencyPageClient from './AgencyPageClient'
import { notFound } from 'next/navigation'

type AgencyPageProps = {
  params: Promise<{
    agencyKey: string
  }>
}

export default async function AgencyPage({ params }: AgencyPageProps) {
  const { agencyKey } = await params
  const agencies = await getAgenciesByName()
  const themes = await getThemesList()

  const agency = agencies[agencyKey]

  if (!agency) {
    notFound()
  }

  return <AgencyPageClient agencyKey={agencyKey} agencyName={agency.name} themes={themes} />
}
