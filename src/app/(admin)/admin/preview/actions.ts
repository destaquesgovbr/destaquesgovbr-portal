'use server'

import type { ArticleRow } from '@/types/article'
import type { ScoredArticle } from '@/config/prioritization'
import {
  calculateArticleScore,
  getPrioritizedArticles,
} from '@/config/prioritization'
import type { PrioritizationConfig } from '@/config/prioritization-config'
import { DEFAULT_CONFIG } from '@/config/prioritization-config'
import { withResult } from '@/lib/result'
import type { Theme } from '@/data/themes-utils'
import { getThemesByLabel } from '@/data/themes-utils'
import { typesense } from '@/services/typesense/client'

/**
 * Busca artigos e aplica preview de priorização com config customizada
 */
export const previewPrioritization = withResult(
  async (
    customConfig?: Partial<PrioritizationConfig>,
  ): Promise<{
    chronological: ArticleRow[]
    prioritized: ScoredArticle[]
  }> => {
    // Buscar artigos recentes
    const result = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: '*',
        limit: 50,
        sort_by: 'published_at:desc',
      })

    const articles =
      (result.hits?.map((hit) => hit.document) as ArticleRow[]) ?? []

    // Ordenação cronológica (baseline)
    const chronological = [...articles]
      .sort((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0))
      .slice(0, 11)

    // Mesclar config padrão com customizações
    const config: PrioritizationConfig = {
      ...DEFAULT_CONFIG,
      ...customConfig,
    }

    // Aplicar priorização
    const prioritized = getPrioritizedArticles(articles, config, 11, true) // includeBreakdown = true

    return {
      chronological,
      prioritized,
    }
  },
)

/**
 * Calcula score de um único artigo para debug
 */
export const calculateSingleScore = withResult(
  async (
    articleId: string,
    customConfig?: Partial<PrioritizationConfig>,
  ): Promise<{
    article: ArticleRow
    score: number
    breakdown: Record<string, number> | undefined
  }> => {
    // Buscar artigo específico
    const result = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: articleId,
        query_by: 'unique_id',
        limit: 1,
      })

    const article = result.hits?.[0]?.document as ArticleRow

    if (!article) {
      throw new Error(`Article ${articleId} not found`)
    }

    // Mesclar config
    const config: PrioritizationConfig = {
      ...DEFAULT_CONFIG,
      ...customConfig,
    }

    // Calcular score
    const scoredArticle: ScoredArticle = {
      ...article,
      _score: 0,
    }

    const score = calculateArticleScore(scoredArticle, config, true)

    return {
      article,
      score,
      breakdown: (
        scoredArticle as ScoredArticle & {
          _scoreBreakdown?: Record<string, number>
        }
      )._scoreBreakdown,
    }
  },
)

/**
 * Retorna um mapa de código de tema -> nome do tema
 */
export const getThemeCodeToNameMap = withResult(
  async (): Promise<Record<string, string>> => {
    const themes = await getThemesByLabel()

    // Função para achatar a hierarquia de temas
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

    const allThemes = flattenThemes(themes)
    const map: Record<string, string> = {}

    for (const theme of allThemes) {
      map[theme.code] = theme.label
    }

    return map
  },
)
