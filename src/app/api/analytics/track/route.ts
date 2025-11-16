import { NextRequest, NextResponse } from 'next/server'
import { typesense } from '@/lib/typesense-client'
import type { AnalyticsEvent } from '@/lib/analytics-schema'
import { ANALYTICS_COLLECTION_NAME } from '@/lib/analytics-schema'
import { randomUUID } from 'crypto'

/**
 * POST /api/analytics/track
 *
 * Endpoint para registrar eventos de analytics (impressões e cliques)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    const requiredFields = [
      'event_type',
      'article_id',
      'position',
      'position_index',
      'calculated_score',
      'session_id',
    ]

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validar event_type
    if (!['impression', 'click'].includes(body.event_type)) {
      return NextResponse.json(
        { error: 'event_type must be "impression" or "click"' },
        { status: 400 }
      )
    }

    // Validar position
    const validPositions = ['hero', 'featured-side', 'featured-bottom', 'latest-grid', 'theme-focus']
    if (!validPositions.includes(body.position)) {
      return NextResponse.json(
        { error: `position must be one of: ${validPositions.join(', ')}` },
        { status: 400 }
      )
    }

    // Extrair user agent e referrer dos headers
    const userAgent = request.headers.get('user-agent') ?? undefined
    const referrer = request.headers.get('referer') ?? undefined

    // Construir evento
    const event: AnalyticsEvent = {
      id: randomUUID(),
      event_type: body.event_type,
      article_id: body.article_id,
      article_agency: body.article_agency ?? null,
      article_theme_l1: body.article_theme_l1 ?? null,
      article_theme_l2: body.article_theme_l2 ?? null,
      article_theme_l3: body.article_theme_l3 ?? null,
      position: body.position,
      position_index: body.position_index,
      calculated_score: body.calculated_score,
      timestamp: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
      session_id: body.session_id,
      user_agent: userAgent,
      referrer: referrer,
    }

    // Enviar para Typesense
    try {
      await typesense
        .collections<AnalyticsEvent>(ANALYTICS_COLLECTION_NAME)
        .documents()
        .create(event)

      return NextResponse.json({ success: true, event_id: event.id })
    } catch (error: any) {
      // Se a collection não existe, retornar erro específico
      if (error?.httpStatus === 404) {
        console.error('[Analytics] Collection not found, skipping tracking')
        // Retornar sucesso mesmo assim para não quebrar a experiência do usuário
        return NextResponse.json({
          success: true,
          warning: 'Analytics collection not initialized',
        })
      }

      throw error
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analytics/track
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'analytics-tracking',
    timestamp: new Date().toISOString(),
  })
}
