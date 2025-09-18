'use server'

import { SELECT } from 'pg-chain'
import type { ArticleRow } from '@/lib/article-row'
import { getPool } from '@/lib/client'

export type GetArticlesArgs = {
  category?: string
  cursor?: string
}

export type GetArticlesResult = {
  articles: ArticleRow[]
  cursor: string | null
}

type CursorPayload = {
  publishedAt: Date
  id: string
}

const PAGE_SIZE = 40

function decodeCursor(cursor: string): CursorPayload {
  const decoded = Buffer.from(cursor, 'base64url').toString('utf-8')
  const [publishedAt, id] = decoded.split(':')
  return { publishedAt: new Date(publishedAt), id }
}

function encodeCursor(publishedAt: Date, id: number): string {
  const toEncode = `${publishedAt.toDateString()}:${id}`
  return Buffer.from(toEncode).toString('base64url')
}

export async function getArticles(
  args: GetArticlesArgs,
): Promise<GetArticlesResult> {
  const pool = await getPool()
  const cursor = args.cursor ? decodeCursor(args.cursor) : null

  // biome-ignore format: true
  const result = await pool.query<ArticleRow>(
    SELECT`*`.
    FROM`news`.
    if(Boolean(cursor), (chain) => chain.
      WHERE`(published_at, id) < (${new Date(cursor!.publishedAt)}, ${cursor!.id})`,
    ).
    if(Boolean(args.category), (chain) => chain.
      WHERE`category = ${args.category}`).
    ORDER_BY`published_at DESC, id DESC`.LIMIT`${PAGE_SIZE}`,
  )

  const lastResult = result.rows.at(-1)

  return {
    articles: result.rows,
    cursor:
      result.rows.length === PAGE_SIZE
        ? encodeCursor(lastResult!.published_at!, lastResult!.id)
        : null,
  }
}
