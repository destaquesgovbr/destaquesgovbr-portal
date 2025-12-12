'use server'

import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { unstable_cache } from 'next/cache'

/**
 * Tipos base
 */
export type Agency = {
  name: string
  parent?: string
  type?: string
  url?: string
}

export type AgencyOption = {
  key: string
  name: string
  type: string
}

/**
 * Função interna que carrega o YAML de agências.
 */
async function loadAgenciesYaml(): Promise<Record<string, Agency>> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'agencies.yaml')
  const file = fs.readFileSync(filePath, 'utf8')
  const fullFile = yaml.load(file) as { sources: Record<string, Agency> }
  return fullFile.sources
}

/**
 * Lê e retorna todas as agências do YAML.
 * O resultado é cacheado usando Next.js cache para máxima performance.
 * Revalida a cada 1 hora (ajuste conforme necessário).
 */
export const getAgenciesByName = unstable_cache(
  loadAgenciesYaml,
  ['agencies-yaml'],
  {
    revalidate: 3600, // 1 hour - adjust based on how often external data changes
    tags: ['agencies'],
  },
)

/**
 * Retorna um campo específico (por padrão o `name`) de uma agência.
 */
export async function getAgencyField(
  agency: string | null | undefined,
  field: keyof Agency = 'name',
): Promise<string | undefined> {
  if (!agency) return undefined
  const sources = await getAgenciesByName()
  return sources[agency]?.[field]
}

/**
 * Retorna o objeto completo de uma agência.
 */
export async function getAgency(
  agency: string | null | undefined,
): Promise<Agency | undefined> {
  if (!agency) return undefined
  const sources = await getAgenciesByName()
  return sources[agency]
}

/**
 * Retorna uma lista simplificada de agências para exibição (ex: selects, tooltips, etc.)
 */
export async function getAgenciesList(): Promise<AgencyOption[]> {
  const agenciesMap = await getAgenciesByName()

  return Object.entries(agenciesMap).map(([key, agency]) => ({
    key,
    name: agency.name,
    type: agency.type || 'Outros',
  }))
}
