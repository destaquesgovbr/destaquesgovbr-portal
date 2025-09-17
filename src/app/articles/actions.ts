'use server'

import type { ArticleRow } from '@/lib/article-row'
import { getPool } from '@/lib/client'

export type GetAllArticlesResult = {
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

export async function getAllArticles({
  pageParam,
}: {
  pageParam: string | null
}): Promise<GetAllArticlesResult> {
  const pool = await getPool()
  const cursor = pageParam ? decodeCursor(pageParam) : null

  const result = await (async () => {
    if (!cursor)
      return await pool.query<ArticleRow>(
        `
        SELECT *
        FROM news
        ORDER BY published_at DESC, id DESC
        LIMIT ${PAGE_SIZE}
      `,
      )

    return await pool.query<ArticleRow>(
      `
        SELECT *
        FROM news
        WHERE (published_at, id) < ($1, $2)
        ORDER BY published_at DESC, id DESC
        LIMIT ${PAGE_SIZE}
      `,
      [new Date(cursor.publishedAt), cursor.id],
    )
  })()

  const lastResult = result.rows.at(-1)

  return {
    articles: result.rows,
    cursor:
      result.rows.length === PAGE_SIZE
        ? encodeCursor(lastResult!.published_at!, lastResult!.id)
        : null,
  }
}
