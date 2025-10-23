'use server'

import type { ArticleRow } from '@/lib/article-row'
import { withResult } from '@/lib/result'
import { typesense } from '@/lib/typesense-client'
import { subDays } from 'date-fns'

export const getLatestArticles = withResult(async (): Promise<ArticleRow[]> => {
  const result = await typesense
    .collections<ArticleRow>('news')
    .documents()
    .search({
      q: '*',
      limit: 5,
      sort_by: 'published_at:desc'
    }
  )
  return result.hits?.map(hit => hit.document) as ArticleRow[]
})

export type GetCategoriesResult = {
  name: string
  count: number
}[]

export const getThemes = withResult(
  async (): Promise<GetCategoriesResult> => {
    const sevenDaysAgo = subDays(new Date(), 7).getTime()

    const result = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: '*',
        filter_by: `published_at:<${sevenDaysAgo}`,
        include_fields: 'theme_1_level_1',
        limit: 4
      })

    const categoriesCount: Record<string, number> = {}

    for (const hit of result.hits ?? []) {
      const document = hit.document

      if (!document.theme_1_level_1) continue

      if (categoriesCount[document.theme_1_level_1]) {
        categoriesCount [document.theme_1_level_1] = categoriesCount [document.theme_1_level_1] + 1
      } else {
        categoriesCount [document.theme_1_level_1] = 1
      }
    }

    const countResult = Object.keys(categoriesCount)
      .map(themeName => ({ name: themeName, count: categoriesCount[themeName] }))

    return countResult
  },
)
