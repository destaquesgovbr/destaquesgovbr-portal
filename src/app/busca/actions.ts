'use server'

import type { ArticleRow } from '@/lib/article-row'
import { typesense } from '@/lib/typesense-client'

export type QueryArticlesArgs = {
  query?: string
  page: number
  startDate?: number
  endDate?: number
}

export type QueryArticlesResult = {
  articles: ArticleRow[]
  page: number
}

const PAGE_SIZE = 40

export async function queryArticles(
  args: QueryArticlesArgs,
): Promise<QueryArticlesResult> {
  const { page, query, startDate, endDate } = args

  let filter_by: string[] = []

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
      q: query ?? '*',
      query_by: 'title, content',
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
