'use server'

import { subDays } from 'date-fns'
import { typesense } from '@/services/typesense/client'
import type { ArticleRow } from '@/types/article'

/**
 * Get article counts by theme code for the last 30 days
 * Returns a Map of theme code → count
 * Each level is counted separately (level 1, 2, and 3)
 */
export async function getThemeArticleCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>()

  // Calculate date range (last 30 days)
  const endDate = new Date()
  const startDate = subDays(endDate, 30)
  const startSeconds = Math.floor(startDate.getTime() / 1000)
  const endSeconds = Math.floor(endDate.getTime() / 1000)

  const filter = `published_at:>=${startSeconds} && published_at:<${endSeconds}`

  try {
    // Query for level 1 themes
    const level1Res = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: '*',
        filter_by: filter,
        group_by: 'theme_1_level_1_code',
        per_page: 250,
      })

    // Query for level 2 themes
    const level2Res = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: '*',
        filter_by: filter,
        group_by: 'theme_1_level_2_code',
        per_page: 250,
      })

    // Query for level 3 themes
    const level3Res = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: '*',
        filter_by: filter,
        group_by: 'theme_1_level_3_code',
        per_page: 250,
      })

    // Process level 1 results
    for (const group of level1Res.grouped_hits ?? []) {
      const code = group.group_key?.[0]
      if (code && code !== 'null' && code !== '') {
        counts.set(code, group.found ?? 0)
      }
    }

    // Process level 2 results
    for (const group of level2Res.grouped_hits ?? []) {
      const code = group.group_key?.[0]
      if (code && code !== 'null' && code !== '') {
        counts.set(code, group.found ?? 0)
      }
    }

    // Process level 3 results
    for (const group of level3Res.grouped_hits ?? []) {
      const code = group.group_key?.[0]
      if (code && code !== 'null' && code !== '') {
        counts.set(code, group.found ?? 0)
      }
    }

    return counts
  } catch (error) {
    console.error('Error fetching theme article counts:', error)
    return counts
  }
}
