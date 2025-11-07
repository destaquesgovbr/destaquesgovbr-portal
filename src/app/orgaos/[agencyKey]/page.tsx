import { getAgenciesByName } from '@/lib/get-agency-name'
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

  const agency = agencies[agencyKey]

  if (!agency) {
    notFound()
  }

  return <AgencyPageClient agencyKey={agencyKey} agencyName={agency.name} />
}
