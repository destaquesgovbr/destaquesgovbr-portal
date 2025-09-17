'use server'

import type { ArticleRow } from '@/lib/article-row'
import { getPool } from '@/lib/client'

export type GetAllArticlesResult = {
  articles: ArticleRow[]
  cursor: null
}

export async function getAllArticles(): Promise<GetAllArticlesResult> {
  const pool = await getPool()
  const result = await pool.query<ArticleRow>(
    `
      SELECT *
      FROM news
      ORDER BY published_at DESC
      LIMIT 40
    `,
  )

  return {
    articles: result.rows,
    cursor: null,
  }
}
