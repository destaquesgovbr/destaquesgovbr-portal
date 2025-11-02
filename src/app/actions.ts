'use server'

import type { ArticleRow } from '@/lib/article-row'
import { withResult } from '@/lib/result'
import { typesense } from '@/lib/typesense-client'
import { startOfMonth, subDays } from 'date-fns'

export const getLatestArticles = withResult(async (): Promise<ArticleRow[]> => {
  const result = await typesense
    .collections<ArticleRow>('news')
    .documents()
    .search({
      q: '*',
      limit: 11,
      sort_by: 'published_at:desc'
    })
  return result.hits?.map(hit => hit.document) as ArticleRow[]
})

export type GetThemesResult = {
  name: string
  count: number
}[]

export const getThemes = withResult(
  async (): Promise<GetThemesResult> => {
    const sevenDaysAgo = subDays(new Date(), 7).getTime()

    const result = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: '*',
        group_by: 'theme_1_level_1_label',
        filter_by: `published_at:>${Math.floor(sevenDaysAgo / 1000)}`,
        limit: 26
      })

    const themesCount: Record<string, number> = {}

    for (const group of result.grouped_hits ?? []) {
      themesCount[group.group_key[0]] = group.found ?? 0
    }

    delete themesCount['undefined']
    delete themesCount['']

    const countResult = Object.keys(themesCount)
      .map(themeName => ({ name: themeName, count: themesCount[themeName] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)

    return countResult
  },
)

export const countMonthlyNews = withResult(async (): Promise<number> => {
  const thisMonth = startOfMonth(new Date()).getTime() / 1000

  const result = await typesense
    .collections<ArticleRow>('news')
    .documents()
    .search({
      q: '*',
      filter_by: `published_at:>${thisMonth}`
    })

  return result.found
})

export const getLatestByTheme = withResult(
  async (theme: string, limit: number | null): Promise<ArticleRow[]> => {
    if (!theme) return []

    const result = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: '*',
        filter_by: `theme_1_level_1_label:=${theme}`,
        sort_by: 'published_at:desc',
        limit: limit ?? 2
      })

    return result.hits?.map(hit => hit.document) as ArticleRow[]
  }
)
