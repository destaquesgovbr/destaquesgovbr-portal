/**
 * Sistema de Priorização de Notícias
 *
 * Este módulo implementa a lógica de scoring e ranking de artigos
 * baseada em configurações de pesos de órgãos, temas e recência.
 */

import type { ArticleRow } from '@/types/article'
import type { PrioritizationConfig } from './prioritization-config'
import {
  getAgencyWeight,
  getBestThemeWeight,
  shouldExcludeArticle,
} from './prioritization-config'

// ==============================================================================
// TIPOS
// ==============================================================================

/**
 * Artigo com score calculado
 */
export type ScoredArticle = ArticleRow & {
  _score: number
  _scoreBreakdown?: {
    agencyWeight: number
    themeWeight: number
    recencyFactor: number
    contentBoosts: number
    baseScore: number
    finalScore: number
  }
}

/**
 * Resultado de tema com score agregado
 */
export type ScoredTheme = {
  name: string
  count: number
  totalScore: number
  avgScore: number
}

// ==============================================================================
// SCORING DE ARTIGOS
// ==============================================================================

/**
 * Calcula o fator de recência baseado na idade do artigo
 *
 * Usa decaimento exponencial:
 * recencyFactor = 1 / (1 + hoursOld / recencyDecayHours)
 *
 * Exemplos (com recencyDecayHours = 72):
 * - 0 horas:  factor = 1.00 (100%)
 * - 24 horas: factor = 0.75 (75%)
 * - 72 horas: factor = 0.50 (50%)
 * - 144 horas: factor = 0.33 (33%)
 */
function calculateRecencyFactor(
  publishedAt: number | null,
  decayHours: number,
): number {
  if (!publishedAt) return 0.5 // Default médio para artigos sem data

  const nowSeconds = Math.floor(Date.now() / 1000)
  const ageSeconds = nowSeconds - publishedAt
  const ageHours = ageSeconds / 3600

  if (ageHours < 0) {
    // Artigo do futuro (possível erro de data)
    return 1.0
  }

  const factor = 1 / (1 + ageHours / decayHours)
  return Math.max(0.01, factor) // Mínimo de 1% para não zerar completamente
}

/**
 * Calcula boosts de qualidade de conteúdo
 *
 * Retorna o multiplicador combinado de todos os boosts aplicáveis
 */
function calculateContentBoosts(
  article: ArticleRow,
  config: PrioritizationConfig,
): number {
  let boosts = 1.0

  // Boost para artigos com imagem
  if (article.image) {
    boosts *= config.hasImageBoost
  }

  // Boost para artigos com resumo
  if (article.summary) {
    boosts *= config.hasSummaryBoost
  }

  return boosts
}

/**
 * Calcula o score de um artigo baseado na configuração
 *
 * Fórmula:
 * score = (agencyWeight × themeWeight × recencyFactor) + contentBoosts
 *
 * @param article - Artigo a ser pontuado
 * @param config - Configuração de priorização
 * @param includeBreakdown - Se true, inclui detalhamento do cálculo no resultado
 * @returns Score calculado (número > 0)
 */
export function calculateArticleScore(
  article: ArticleRow,
  config: PrioritizationConfig,
  includeBreakdown = false,
): number {
  // Pesos de órgão e tema
  const agencyWeight = getAgencyWeight(config, article.agency)
  const themeWeight = getBestThemeWeight(
    config,
    article.theme_1_level_1_code,
    article.theme_1_level_2_code,
    article.theme_1_level_3_code,
  )

  // Fator de recência
  const recencyFactor = calculateRecencyFactor(
    article.published_at,
    config.recencyDecayHours,
  )

  // Boosts de qualidade
  const contentBoosts = calculateContentBoosts(article, config)

  // Score base = produto dos pesos e recência
  const baseScore = agencyWeight * themeWeight * recencyFactor

  // Score final = base + boosts
  const finalScore = baseScore * contentBoosts

  // Adicionar breakdown se solicitado
  if (includeBreakdown) {
    ;(article as ScoredArticle)._scoreBreakdown = {
      agencyWeight,
      themeWeight,
      recencyFactor,
      contentBoosts,
      baseScore,
      finalScore,
    }
  }

  return finalScore
}

/**
 * Filtra e ordena artigos baseado em score
 *
 * @param articles - Lista de artigos
 * @param config - Configuração de priorização
 * @param limit - Número máximo de artigos a retornar
 * @param includeBreakdown - Se true, inclui detalhamento do score
 * @returns Lista de artigos ordenados por score (maior primeiro)
 */
export function getPrioritizedArticles(
  articles: ArticleRow[],
  config: PrioritizationConfig,
  limit?: number,
  includeBreakdown = false,
): ScoredArticle[] {
  // Filtrar artigos excluídos
  const filtered = articles.filter(
    (article) => !shouldExcludeArticle(config, article),
  )

  // Calcular scores
  const scored: ScoredArticle[] = filtered.map((article) => {
    const score = calculateArticleScore(article, config, includeBreakdown)
    return {
      ...article,
      _score: score,
    }
  })

  // Ordenar por score (maior primeiro), usar published_at como desempate
  scored.sort((a, b) => {
    if (b._score !== a._score) {
      return b._score - a._score
    }
    // Desempate: mais recente primeiro
    return (b.published_at ?? 0) - (a.published_at ?? 0)
  })

  // Aplicar limite se especificado
  return limit ? scored.slice(0, limit) : scored
}

// ==============================================================================
// SCORING DE TEMAS
// ==============================================================================

/**
 * Calcula scores agregados de temas baseado nos artigos
 *
 * @param articles - Lista de artigos
 * @param config - Configuração de priorização
 * @returns Lista de temas com scores agregados
 */
export function calculateThemeScores(
  articles: ArticleRow[],
  config: PrioritizationConfig,
): ScoredTheme[] {
  const themeMap = new Map<string, { count: number; totalScore: number }>()

  for (const article of articles) {
    const themeName = article.theme_1_level_1_label
    if (!themeName) continue

    const score = calculateArticleScore(article, config)

    const current = themeMap.get(themeName) ?? { count: 0, totalScore: 0 }
    themeMap.set(themeName, {
      count: current.count + 1,
      totalScore: current.totalScore + score,
    })
  }

  // Converter para array e calcular média
  const themes: ScoredTheme[] = []
  for (const [name, data] of themeMap) {
    themes.push({
      name,
      count: data.count,
      totalScore: data.totalScore,
      avgScore: data.totalScore / data.count,
    })
  }

  return themes
}

/**
 * Seleciona os temas prioritários para "Temas em Foco"
 *
 * @param articles - Lista de artigos (últimos 7 dias)
 * @param config - Configuração de priorização
 * @param limit - Número de temas a retornar (padrão: 3)
 * @returns Lista de nomes de temas selecionados
 */
export function getPrioritizedThemes(
  articles: ArticleRow[],
  config: PrioritizationConfig,
  limit = 3,
): string[] {
  // Modo manual: retorna temas pré-definidos
  if (config.themeFocusMode === 'manual') {
    return config.manualThemes.slice(0, limit)
  }

  // Calcular scores de temas
  const themeScores = calculateThemeScores(articles, config)

  // Modo volume: ordenar por quantidade de artigos
  if (config.themeFocusMode === 'volume') {
    themeScores.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }
      // Desempate por score médio
      return b.avgScore - a.avgScore
    })
  }
  // Modo weighted: ordenar por score total
  else if (config.themeFocusMode === 'weighted') {
    themeScores.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore
      }
      // Desempate por quantidade
      return b.count - a.count
    })
  }

  // Retornar top N temas
  return themeScores.slice(0, limit).map((t) => t.name)
}

// ==============================================================================
// UTILITÁRIOS DE DEBUG
// ==============================================================================

/**
 * Formata o breakdown de score para exibição legível
 */
export function formatScoreBreakdown(article: ScoredArticle): string {
  if (!article._scoreBreakdown) {
    return `Score: ${article._score.toFixed(3)}`
  }

  const b = article._scoreBreakdown
  return [
    `Score: ${b.finalScore.toFixed(3)}`,
    `  Agency: ${article.agency ?? 'null'} (weight: ${b.agencyWeight.toFixed(2)})`,
    `  Theme: ${article.theme_1_level_1_label ?? 'null'} (weight: ${b.themeWeight.toFixed(2)})`,
    `  Recency: ${b.recencyFactor.toFixed(3)}`,
    `  Content: ${b.contentBoosts.toFixed(3)}`,
    `  Base: ${b.baseScore.toFixed(3)}`,
  ].join('\n')
}

/**
 * Gera relatório de comparação entre ordenação cronológica e priorizada
 */
export function generatePrioritizationReport(
  articles: ArticleRow[],
  config: PrioritizationConfig,
  topN = 10,
): string {
  const chronological = [...articles].sort(
    (a, b) => (b.published_at ?? 0) - (a.published_at ?? 0),
  )

  const prioritized = getPrioritizedArticles(articles, config, topN, true)

  const lines: string[] = [
    '='.repeat(80),
    'RELATÓRIO DE PRIORIZAÇÃO',
    '='.repeat(80),
    '',
    `Total de artigos: ${articles.length}`,
    `Top ${topN} artigos:`,
    '',
    'ORDENAÇÃO CRONOLÓGICA:',
    '-'.repeat(80),
  ]

  chronological.slice(0, topN).forEach((article, i) => {
    lines.push(
      `${i + 1}. ${article.title?.slice(0, 60) ?? 'Sem título'}`,
      `   ${article.agency ?? 'N/A'} | ${article.theme_1_level_1_label ?? 'N/A'}`,
    )
  })

  lines.push('', 'ORDENAÇÃO PRIORIZADA:', '-'.repeat(80))

  prioritized.forEach((article, i) => {
    lines.push(
      `${i + 1}. ${article.title?.slice(0, 60) ?? 'Sem título'}`,
      `   ${article.agency ?? 'N/A'} | ${article.theme_1_level_1_label ?? 'N/A'}`,
      `   Score: ${article._score.toFixed(3)}`,
    )
  })

  lines.push('', '='.repeat(80))

  return lines.join('\n')
}
