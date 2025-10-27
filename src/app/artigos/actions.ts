'use server'

import type { ArticleRow } from '@/lib/article-row'
import { typesense } from '@/lib/typesense-client'

export type GetArticlesArgs = {
  theme_1_level_1?: string
  cursor?: string
}

export type GetArticlesResult = {
  articles: ArticleRow[]
  page: number
}

const PAGE_SIZE = 40

export async function getArticles(
  args: GetArticlesArgs,
): Promise<GetArticlesResult> {
  const cursor = args.cursor ? decodeCursor(args.cursor) : null

  let filter_by = ''

  if (cursor) {
    filter_by = `published_at:<${cursor.publishedAt} || (published_at:=${cursor.publishedAt} && unique_id:!=${cursor.id})`
    if (args.theme_1_level_1) {
      filter_by += ` && theme_1_level_1:=${args.theme_1_level_1}`
    }
  } else if (args.theme_1_level_1) {
    filter_by = `theme_1_level_1:=${args.theme_1_level_1}`
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
