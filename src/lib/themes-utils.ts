'use server'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

/**
 * Tipos base
 */
export type Theme = {
  label: string
  code: string
  children?: Theme[]
}

export type ThemeOption = {
  key: string
  name: string
}

/**
 * Cache do arquivo YAML carregado.
 */
let fullFile: { themes: Theme[] } | null = null

/**
 * Lê e retorna todos os temas do YAML.
 * O resultado é cacheado em memória para evitar leituras repetidas.
 */
export async function getThemesByLabel(): Promise<Theme[]> {
  if (fullFile) return fullFile.themes

  const filePath = path.join(process.cwd(), 'src', 'lib', 'themes.yaml')
  const file = fs.readFileSync(filePath, 'utf8')

  fullFile = yaml.load(file) as { themes: Theme[] }

  return fullFile.themes
}

/**
 * Retorna um array achatado de todos os temas (incluindo sub-temas)
 */
function flattenThemes(themes: Theme[]): Theme[] {
  const result: Theme[] = []

  for (const theme of themes) {
    result.push(theme)
    if (theme.children) {
      result.push(...flattenThemes(theme.children))
    }
  }

  return result
}

/**
 * Retorna uma lista simplificada de temas de nível 1 (principais) para exibição
 */
export async function getThemesList(): Promise<ThemeOption[]> {
  const themes = await getThemesByLabel()

  return themes.map((theme) => ({
    key: theme.label,
    name: theme.label,
  }))
}

/**
 * Retorna o nome de um tema a partir de sua label
 */
export async function getThemeName(
  themeLabel: string | null | undefined
): Promise<string | undefined> {
  if (!themeLabel) return undefined
  const themes = await getThemesByLabel()
  const allThemes = flattenThemes(themes)
  const theme = allThemes.find((t) => t.label === themeLabel)
  return theme?.label
}
