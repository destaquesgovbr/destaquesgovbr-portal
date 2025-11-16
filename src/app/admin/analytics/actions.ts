'use server'

import { typesense } from '@/lib/typesense-client'
import { ANALYTICS_COLLECTION_NAME } from '@/lib/analytics-schema'
import type { AnalyticsEvent } from '@/lib/analytics-schema'
import { withResult } from '@/lib/result'

/**
 * Calcula métricas de CTR (Click-Through Rate) por dimensão
 */
export const getAnalyticsSummary = withResult(
  async (days: number = 7): Promise<{
    totalImpressions: number
    totalClicks: number
    ctr: number
    byAgency: Array<{
      agency: string
      impressions: number
      clicks: number
      ctr: number
    }>
    byTheme: Array<{
      theme: string
      impressions: number
      clicks: number
      ctr: number
    }>
    byPosition: Array<{
      position: string
      impressions: number
      clicks: number
      ctr: number
    }>
  }> => {
    const daysAgo = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)

    // Buscar todos os eventos do período
    const result = await typesense
      .collections<AnalyticsEvent>(ANALYTICS_COLLECTION_NAME)
      .documents()
      .search({
        q: '*',
        filter_by: `timestamp:>${daysAgo}`,
        per_page: 250,
        sort_by: 'timestamp:desc',
      })

    const events = (result.hits?.map((hit) => hit.document) ?? []) as AnalyticsEvent[]

    // Totais
    const totalImpressions = events.filter((e) => e.event_type === 'impression').length
    const totalClicks = events.filter((e) => e.event_type === 'click').length
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    // Agrupar por órgão
    const agencyStats = new Map<
      string,
      { impressions: number; clicks: number }
    >()

    events.forEach((event) => {
      const agency = event.article_agency ?? 'unknown'
      const current = agencyStats.get(agency) ?? { impressions: 0, clicks: 0 }

      if (event.event_type === 'impression') {
        current.impressions++
      } else if (event.event_type === 'click') {
        current.clicks++
      }

      agencyStats.set(agency, current)
    })

    const byAgency = Array.from(agencyStats.entries())
      .map(([agency, stats]) => ({
        agency,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Agrupar por tema
    const themeStats = new Map<
      string,
      { impressions: number; clicks: number }
    >()

    events.forEach((event) => {
      const theme = event.article_theme_l1 ?? 'unknown'
      const current = themeStats.get(theme) ?? { impressions: 0, clicks: 0 }

      if (event.event_type === 'impression') {
        current.impressions++
      } else if (event.event_type === 'click') {
        current.clicks++
      }

      themeStats.set(theme, current)
    })

    const byTheme = Array.from(themeStats.entries())
      .map(([theme, stats]) => ({
        theme,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Agrupar por posição
    const positionStats = new Map<
      string,
      { impressions: number; clicks: number }
    >()

    events.forEach((event) => {
      const position = event.position
      const current = positionStats.get(position) ?? { impressions: 0, clicks: 0 }

      if (event.event_type === 'impression') {
        current.impressions++
      } else if (event.event_type === 'click') {
        current.clicks++
      }

      positionStats.set(position, current)
    })

    const byPosition = Array.from(positionStats.entries())
      .map(([position, stats]) => ({
        position,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)

    return {
      totalImpressions,
      totalClicks,
      ctr,
      byAgency,
      byTheme,
      byPosition,
    }
  }
)

/**
 * Retorna artigos mais clicados
 */
export const getTopArticles = withResult(
  async (days: number = 7): Promise<
    Array<{
      article_id: string
      clicks: number
      impressions: number
      ctr: number
    }>
  > => {
    const daysAgo = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)

    const result = await typesense
      .collections<AnalyticsEvent>(ANALYTICS_COLLECTION_NAME)
      .documents()
      .search({
        q: '*',
        filter_by: `timestamp:>${daysAgo}`,
        per_page: 250,
        sort_by: 'timestamp:desc',
      })

    const events = (result.hits?.map((hit) => hit.document) ?? []) as AnalyticsEvent[]

    // Agrupar por artigo
    const articleStats = new Map<
      string,
      { clicks: number; impressions: number }
    >()

    events.forEach((event) => {
      const articleId = event.article_id
      const current = articleStats.get(articleId) ?? { clicks: 0, impressions: 0 }

      if (event.event_type === 'impression') {
        current.impressions++
      } else if (event.event_type === 'click') {
        current.clicks++
      }

      articleStats.set(articleId, current)
    })

    return Array.from(articleStats.entries())
      .map(([article_id, stats]) => ({
        article_id,
        clicks: stats.clicks,
        impressions: stats.impressions,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20)
  }
)
