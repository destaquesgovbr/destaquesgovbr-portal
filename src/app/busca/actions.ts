'use server'

import type { ArticleRow } from '@/lib/article-row'
import { typesense } from '@/lib/typesense-client'

export type QueryArticlesArgs = {
  query?: string
  cursor?: string
}

export type QueryArticlesResult = {
  articles: ArticleRow[]
  cursor: string | null
}

type CursorPayload = {
  publishedAt: number
  query?: string
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

export async function queryArticles(
  args: QueryArticlesArgs,
): Promise<QueryArticlesResult> {
  const cursor = args.cursor ? decodeCursor(args.cursor) : null

  let filter_by = ''

  if (cursor) {
    filter_by = `published_at:<=${cursor.publishedAt} || (published_at:=${cursor.publishedAt} && unique_id:!=${cursor.id})`
  }

  // biome-ignore format: true
  const result = await typesense
    .collections<ArticleRow>('news')
    .documents()
    .search({
      q: args.query ?? '*',
      query_by: 'title, content',
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
