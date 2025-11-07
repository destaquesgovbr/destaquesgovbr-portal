'use server'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

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
 * Cache do arquivo YAML carregado.
 */
let fullFile: { sources: Record<string, Agency> } | null = null

/**
 * Lê e retorna todas as agências do YAML.
 * O resultado é cacheado em memória para evitar leituras repetidas.
 */
export async function getAgenciesByName(): Promise<Record<string, Agency>> {
  if (fullFile) return fullFile.sources

  const filePath = path.join(process.cwd(), 'src', 'lib', 'agencies.yaml')
  const file = fs.readFileSync(filePath, 'utf8')

  fullFile = yaml.load(file) as { sources: Record<string, Agency> }

  return fullFile.sources
}

/**
 * Retorna um campo específico (por padrão o `name`) de uma agência.
 */
export async function getAgencyField(
  agency: string | null | undefined,
  field: keyof Agency = 'name'
): Promise<string | undefined> {
  if (!agency) return undefined
  const sources = await getAgenciesByName()
  return sources[agency]?.[field]
}

/**
 * Retorna o objeto completo de uma agência.
 */
export async function getAgency(
  agency: string | null | undefined
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
