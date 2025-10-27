'use server'

import type { ArticleRow } from '@/lib/article-row'
import { typesense } from '@/lib/typesense-client'

export type GetArticlesArgs = {
  theme_1_level_1?: string
  page: number
}

export type GetArticlesResult = {
  articles: ArticleRow[]
  page: number
}

const PAGE_SIZE = 40

export async function getArticles(
  args: GetArticlesArgs,
): Promise<GetArticlesResult> {
  const { theme_1_level_1, page } = args

  let filter_by: string[] = []

  if (theme_1_level_1) {
    filter_by.push(`theme_1_level_1:=${theme_1_level_1}`)
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
