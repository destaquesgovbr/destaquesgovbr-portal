'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook para tracking de analytics
 */

// Gera ou recupera session ID do localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session'

  const key = 'analytics_session_id'
  let sessionId = localStorage.getItem(key)

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(key, sessionId)
  }

  return sessionId
}

// Envia evento para API
async function trackEvent(event: {
  event_type: 'impression' | 'click'
  article_id: string
  article_agency: string | null
  article_theme_l1: string | null
  article_theme_l2: string | null
  article_theme_l3: string | null
  position: 'hero' | 'featured-side' | 'featured-bottom' | 'latest-grid' | 'theme-focus'
  position_index: number
  calculated_score: number
}) {
  try {
    const sessionId = getSessionId()

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        session_id: sessionId,
      }),
    })
  } catch (error) {
    // Silently fail - não queremos quebrar UX por problemas de analytics
    console.warn('[Analytics] Failed to track event:', error)
  }
}

/**
 * Hook para tracking de impressões usando Intersection Observer
 */
export function useImpressionTracking(
  ref: React.RefObject<HTMLElement | null>,
  article: {
    unique_id: string
    agency: string | null
    theme_1_level_1_label: string | null
    theme_1_level_2_code: string | null
    theme_1_level_3_code: string | null
  },
  position: 'hero' | 'featured-side' | 'featured-bottom' | 'latest-grid' | 'theme-focus',
  positionIndex: number,
  score: number = 0
) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!ref.current || tracked.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Quando elemento entra no viewport pela primeira vez
          if (entry.isIntersecting && !tracked.current) {
            tracked.current = true

            trackEvent({
              event_type: 'impression',
              article_id: article.unique_id,
              article_agency: article.agency,
              article_theme_l1: article.theme_1_level_1_label,
              article_theme_l2: article.theme_1_level_2_code,
              article_theme_l3: article.theme_1_level_3_code,
              position,
              position_index: positionIndex,
              calculated_score: score,
            })
          }
        })
      },
      {
        threshold: 0.5, // Considera "visto" quando 50% visível
        rootMargin: '0px',
      }
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref, article, position, positionIndex, score])
}

/**
 * Hook para tracking de cliques
 */
export function useClickTracking(
  article: {
    unique_id: string
    agency: string | null
    theme_1_level_1_label: string | null
    theme_1_level_2_code: string | null
    theme_1_level_3_code: string | null
  },
  position: 'hero' | 'featured-side' | 'featured-bottom' | 'latest-grid' | 'theme-focus',
  positionIndex: number,
  score: number = 0
) {
  return () => {
    trackEvent({
      event_type: 'click',
      article_id: article.unique_id,
      article_agency: article.agency,
      article_theme_l1: article.theme_1_level_1_label,
      article_theme_l2: article.theme_1_level_2_code,
      article_theme_l3: article.theme_1_level_3_code,
      position,
      position_index: positionIndex,
      calculated_score: score,
    })
  }
}
