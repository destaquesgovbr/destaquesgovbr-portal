'use server'

import type { ArticleRow } from '@/lib/article-row'
import { typesense } from '@/lib/typesense-client'

export type GetArticlesArgs = {
  theme_1_level_1?: string
  page: number
  startDate?: number
  endDate?: number
}

export type GetArticlesResult = {
  articles: ArticleRow[]
  page: number
}

const PAGE_SIZE = 40

export async function getArticles(
  args: GetArticlesArgs,
): Promise<GetArticlesResult> {
  const { page, theme_1_level_1, startDate, endDate } = args

  let filter_by: string[] = []

  if (theme_1_level_1) {
    filter_by.push(`theme_1_level_1:=${theme_1_level_1}`)
  }

  if (startDate) {
    filter_by.push(`published_at:>${startDate / 1000}`)
  }

  if (endDate) {
    filter_by.push(`published_at:<${(endDate / 1000) + (60 * 60 * 3)}`)
  }

  // biome-ignore format: true
  const result = await typesense
    .collections<ArticleRow>('news')
    .documents()
    .search({
      q: '*',
      sort_by: 'published_at:desc, unique_id:desc',
      filter_by: filter_by.join(" && "),
      limit: PAGE_SIZE,
      page
    })

  return {
    articles: result.hits?.map(hit => hit.document) ?? [],
    page: page + 1
  }
}
