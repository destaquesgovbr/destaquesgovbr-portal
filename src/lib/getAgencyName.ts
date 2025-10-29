'use server'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

type Agency = {
  name: string
  parent?: string
  type?: string
  url?: string
}

let fullFile: { sources: Record<string, Agency>} | null = null

function getAgenciesByName(): Record<string, Agency> {
  if (fullFile) return fullFile.sources

  const filePath = path.join(process.cwd(), 'src', 'lib', 'agencies.yaml')
  const file = fs.readFileSync(filePath, 'utf8')

  fullFile = yaml.load(file)  as { sources: Record<string, Agency> }

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
  const sources = getAgenciesByName()
  return sources[agency]?.[field]
}

/**
 * Retorna um objeto completo da agência, caso precise de mais dados.
 */
export async function getAgency(agency: string | null | undefined): Promise<Agency | undefined> {
  if (!agency) return undefined
  const sources = getAgenciesByName()
  return sources[agency]
}
