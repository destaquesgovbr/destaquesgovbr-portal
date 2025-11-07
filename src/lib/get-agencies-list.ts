'use server'

import { getAgenciesByName } from './get-agency-name'

export type AgencyOption = {
  key: string
  name: string
  type: string
}

export async function getAgenciesList(): Promise<AgencyOption[]> {
  const agenciesMap = await getAgenciesByName()

  return Object.entries(agenciesMap).map(([key, agency]) => ({
    key,
    name: agency.name,
    type: agency.type || 'Outros',
  }))
}
