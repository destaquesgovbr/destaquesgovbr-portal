'use server'

import type { ArticleRow } from '@/lib/article-row'
import { typesense } from '@/lib/typesense-client'

export type GetArticlesArgs = {
  theme_1_level_1?: string
  cursor?: string
}

export type GetArticlesResult = {
  articles: ArticleRow[]
  cursor: string | null
}

type CursorPayload = {
  publishedAt: number
  theme_1_level_1?: string
  id: string
}

const PAGE_SIZE = 40

function decodeCursor(cursor: string): CursorPayload {
  const decoded = Buffer.from(cursor, 'base64url').toString('utf-8')
  const [publishedAt, id] = decoded.split(':')
  return { publishedAt: parseInt(publishedAt), id }
}

function encodeCursor(publishedAt: number, id: string): string {
  const toEncode = `${publishedAt}:${id}`
  return Buffer.from(toEncode).toString('base64url')
}

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
      filter_by,
      limit: PAGE_SIZE
    })

  const lastResult = result.hits?.at(-1)?.document

  return {
    articles: result.hits?.map(hit => hit.document) ?? [],
    cursor:
      result.hits?.length === PAGE_SIZE
        ? encodeCursor(lastResult!.published_at!, lastResult!.unique_id)
        : null,
  }
}
