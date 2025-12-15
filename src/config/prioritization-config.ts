/**
 * Configuração do Sistema de Priorização de Notícias
 *
 * Este módulo define o schema TypeScript para o arquivo prioritization.yaml
 * e fornece funções para carregar e validar a configuração.
 */

import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { unstable_cache } from 'next/cache'

// ==============================================================================
// TIPOS
// ==============================================================================

/**
 * Modo de seleção de temas para a seção "Temas em Foco"
 */
export type ThemeFocusMode = 'volume' | 'weighted' | 'manual'

/**
 * Configuração completa do sistema de priorização
 */
export type PrioritizationConfig = {
  // Pesos por órgão (agency slug → weight)
  agencyWeights: Record<string, number>

  // Pesos por tema (theme code → weight)
  // Suporta códigos de 3 níveis: "01", "01.01", "01.01.01"
  themeWeights: Record<string, number>

  // Configuração de recência
  recencyDecayHours: number // Período de decaimento
  recencyWeight: number // Peso da recência (0.0 a 1.0)

  // Boosts de qualidade
  hasImageBoost: number // Multiplicador para artigos com imagem
  hasSummaryBoost: number // Multiplicador para artigos com resumo

  // Filtros absolutos (opcionais)
  maxArticleAgeDays: number | null // Idade máxima em dias (null = sem limite)
  excludedAgencies: string[] // Órgãos excluídos completamente
  excludedThemes: string[] // Temas excluídos completamente

  // Configuração de "Temas em Foco"
  themeFocusMode: ThemeFocusMode
  manualThemes: string[] // Usado se mode = "manual"
}

/**
 * Configuração padrão (fallback)
 */
export const DEFAULT_CONFIG: PrioritizationConfig = {
  agencyWeights: {},
  themeWeights: {},
  recencyDecayHours: 72,
  recencyWeight: 0.5,
  hasImageBoost: 1.1,
  hasSummaryBoost: 1.05,
  maxArticleAgeDays: null,
  excludedAgencies: [],
  excludedThemes: [],
  themeFocusMode: 'volume',
  manualThemes: [],
}

// ==============================================================================
// VALIDAÇÃO
// ==============================================================================

/**
 * Valida se um valor é um número positivo válido
 */
function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0
}

/**
 * Valida se um valor é um número entre 0 e 1
 */
function isValidRatio(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    value >= 0 &&
    value <= 1
  )
}

/**
 * Valida se um peso é válido (número positivo)
 */
function isValidWeight(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0
}

/**
 * Valida um objeto de pesos (agency ou theme)
 */
function validateWeights(
  weights: unknown,
  name: string,
): Record<string, number> {
  if (!weights || typeof weights !== 'object') {
    console.warn(`[Prioritization] Invalid ${name}, using empty weights`)
    return {}
  }

  const validated: Record<string, number> = {}
  for (const [key, value] of Object.entries(weights)) {
    if (isValidWeight(value)) {
      validated[key] = value
    } else {
      console.warn(
        `[Prioritization] Invalid weight for ${name}.${key}: ${value}, skipping`,
      )
    }
  }

  return validated
}

/**
 * Valida uma lista de strings
 */
function validateStringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value)) {
    console.warn(
      `[Prioritization] Invalid ${name}, expected array, got ${typeof value}`,
    )
    return []
  }

  return value.filter((item): item is string => {
    if (typeof item === 'string') {
      return true
    }
    console.warn(`[Prioritization] Invalid item in ${name}: ${item}, skipping`)
    return false
  })
}

/**
 * Valida a configuração carregada do YAML
 */
function validateConfig(raw: unknown): PrioritizationConfig {
  if (!raw || typeof raw !== 'object') {
    console.warn('[Prioritization] Invalid config format, using defaults')
    return DEFAULT_CONFIG
  }

  const config = raw as Record<string, unknown>

  // Validar agency weights
  const agencyWeights = validateWeights(config.agencyWeights, 'agencyWeights')

  // Validar theme weights
  const themeWeights = validateWeights(config.themeWeights, 'themeWeights')

  // Validar recencyDecayHours
  const recencyDecayHours = isValidPositiveNumber(config.recencyDecayHours)
    ? config.recencyDecayHours
    : DEFAULT_CONFIG.recencyDecayHours

  // Validar recencyWeight
  const recencyWeight = isValidRatio(config.recencyWeight)
    ? config.recencyWeight
    : DEFAULT_CONFIG.recencyWeight

  // Validar hasImageBoost
  const hasImageBoost = isValidPositiveNumber(config.hasImageBoost)
    ? config.hasImageBoost
    : DEFAULT_CONFIG.hasImageBoost

  // Validar hasSummaryBoost
  const hasSummaryBoost = isValidPositiveNumber(config.hasSummaryBoost)
    ? config.hasSummaryBoost
    : DEFAULT_CONFIG.hasSummaryBoost

  // Validar maxArticleAgeDays
  let maxArticleAgeDays: number | null = null
  if (
    config.maxArticleAgeDays !== null &&
    config.maxArticleAgeDays !== undefined
  ) {
    if (isValidPositiveNumber(config.maxArticleAgeDays)) {
      maxArticleAgeDays = config.maxArticleAgeDays
    } else {
      console.warn(
        `[Prioritization] Invalid maxArticleAgeDays: ${config.maxArticleAgeDays}, using null`,
      )
    }
  }

  // Validar excludedAgencies
  const excludedAgencies = validateStringArray(
    config.excludedAgencies,
    'excludedAgencies',
  )

  // Validar excludedThemes
  const excludedThemes = validateStringArray(
    config.excludedThemes,
    'excludedThemes',
  )

  // Validar themeFocusMode
  const validModes: ThemeFocusMode[] = ['volume', 'weighted', 'manual']
  const themeFocusMode = validModes.includes(
    config.themeFocusMode as ThemeFocusMode,
  )
    ? (config.themeFocusMode as ThemeFocusMode)
    : DEFAULT_CONFIG.themeFocusMode

  // Validar manualThemes
  const manualThemes = validateStringArray(config.manualThemes, 'manualThemes')

  // Validar que manualThemes tem exatamente 3 temas se mode = "manual"
  if (themeFocusMode === 'manual' && manualThemes.length !== 3) {
    console.warn(
      `[Prioritization] themeFocusMode is "manual" but manualThemes has ${manualThemes.length} items (expected 3), falling back to "volume"`,
    )
    return {
      ...DEFAULT_CONFIG,
      agencyWeights,
      themeWeights,
      recencyDecayHours,
      recencyWeight,
      hasImageBoost,
      hasSummaryBoost,
      maxArticleAgeDays,
      excludedAgencies,
      excludedThemes,
      themeFocusMode: 'volume',
      manualThemes: [],
    }
  }

  return {
    agencyWeights,
    themeWeights,
    recencyDecayHours,
    recencyWeight,
    hasImageBoost,
    hasSummaryBoost,
    maxArticleAgeDays,
    excludedAgencies,
    excludedThemes,
    themeFocusMode,
    manualThemes,
  }
}

// ==============================================================================
// CARREGAMENTO
// ==============================================================================

/**
 * Carrega a configuração do arquivo YAML (sem cache)
 */
async function loadConfigUncached(): Promise<PrioritizationConfig> {
  try {
    const configPath = path.join(
      process.cwd(),
      'src',
      'config',
      'prioritization.yaml',
    )

    if (!fs.existsSync(configPath)) {
      console.warn(
        `[Prioritization] Config file not found at ${configPath}, using defaults`,
      )
      return DEFAULT_CONFIG
    }

    const fileContent = fs.readFileSync(configPath, 'utf-8')
    const rawConfig = yaml.load(fileContent)

    const validatedConfig = validateConfig(rawConfig)

    console.log('[Prioritization] Config loaded successfully:', {
      agencyWeightsCount: Object.keys(validatedConfig.agencyWeights).length,
      themeWeightsCount: Object.keys(validatedConfig.themeWeights).length,
      themeFocusMode: validatedConfig.themeFocusMode,
      excludedAgenciesCount: validatedConfig.excludedAgencies.length,
      excludedThemesCount: validatedConfig.excludedThemes.length,
    })

    return validatedConfig
  } catch (error) {
    console.error('[Prioritization] Error loading config:', error)
    return DEFAULT_CONFIG
  }
}

/**
 * Carrega a configuração com cache (revalida a cada 5 minutos)
 */
export const loadConfig = unstable_cache(
  loadConfigUncached,
  ['prioritization-config'],
  {
    revalidate: 300, // 5 minutos
    tags: ['prioritization-config'],
  },
)

// ==============================================================================
// UTILITÁRIOS
// ==============================================================================

/**
 * Retorna o peso do órgão (1.0 se não especificado)
 */
export function getAgencyWeight(
  config: PrioritizationConfig,
  agency: string | null,
): number {
  if (!agency) return 1.0
  return config.agencyWeights[agency] ?? 1.0
}

/**
 * Retorna o maior peso de tema encontrado nos 3 níveis (1.0 se nenhum encontrado)
 */
export function getBestThemeWeight(
  config: PrioritizationConfig,
  level1: string | null,
  level2: string | null,
  level3: string | null,
): number {
  const weights: number[] = [1.0] // Default weight

  if (level1 && config.themeWeights[level1]) {
    weights.push(config.themeWeights[level1])
  }
  if (level2 && config.themeWeights[level2]) {
    weights.push(config.themeWeights[level2])
  }
  if (level3 && config.themeWeights[level3]) {
    weights.push(config.themeWeights[level3])
  }

  return Math.max(...weights)
}

/**
 * Verifica se um artigo deve ser excluído pelos filtros absolutos
 */
export function shouldExcludeArticle(
  config: PrioritizationConfig,
  article: {
    agency: string | null
    theme_1_level_1_code: string | null
    theme_1_level_2_code: string | null
    theme_1_level_3_code: string | null
    published_at: number | null
  },
): boolean {
  // Verificar exclusão por órgão
  if (article.agency && config.excludedAgencies.includes(article.agency)) {
    return true
  }

  // Verificar exclusão por tema (qualquer nível)
  const themeCodes = [
    article.theme_1_level_1_code,
    article.theme_1_level_2_code,
    article.theme_1_level_3_code,
  ].filter((code): code is string => code !== null)

  for (const themeCode of themeCodes) {
    if (config.excludedThemes.includes(themeCode)) {
      return true
    }
  }

  // Verificar idade máxima
  if (config.maxArticleAgeDays !== null && article.published_at !== null) {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const ageSeconds = nowSeconds - article.published_at
    const ageDays = ageSeconds / (60 * 60 * 24)

    if (ageDays > config.maxArticleAgeDays) {
      return true
    }
  }

  return false
}
