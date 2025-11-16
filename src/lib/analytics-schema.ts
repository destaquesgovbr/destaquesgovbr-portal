/**
 * Schema para a collection de analytics no Typesense
 */

export type AnalyticsEvent = {
  // Identificador único do evento
  id: string

  // Tipo de evento
  event_type: 'impression' | 'click'

  // Dados do artigo
  article_id: string
  article_agency: string | null
  article_theme_l1: string | null
  article_theme_l2: string | null
  article_theme_l3: string | null

  // Posição na página
  position: 'hero' | 'featured-side' | 'featured-bottom' | 'latest-grid' | 'theme-focus'
  position_index: number

  // Score calculado (para correlação)
  calculated_score: number

  // Metadados temporais
  timestamp: number // Unix timestamp (seconds)
  session_id: string // ID da sessão do usuário

  // Metadados adicionais (opcional)
  user_agent?: string
  referrer?: string
}

export const ANALYTICS_COLLECTION_NAME = 'analytics_events'

export const ANALYTICS_SCHEMA = {
  name: ANALYTICS_COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'event_type', type: 'string' as const, facet: true },
    { name: 'article_id', type: 'string' as const, facet: true },
    { name: 'article_agency', type: 'string' as const, facet: true, optional: true },
    { name: 'article_theme_l1', type: 'string' as const, facet: true, optional: true },
    { name: 'article_theme_l2', type: 'string' as const, facet: true, optional: true },
    { name: 'article_theme_l3', type: 'string' as const, facet: true, optional: true },
    { name: 'position', type: 'string' as const, facet: true },
    { name: 'position_index', type: 'int32' as const },
    { name: 'calculated_score', type: 'float' as const },
    { name: 'timestamp', type: 'int64' as const },
    { name: 'session_id', type: 'string' as const, facet: true },
    { name: 'user_agent', type: 'string' as const, optional: true },
    { name: 'referrer', type: 'string' as const, optional: true },
  ],
  default_sorting_field: 'timestamp',
}
