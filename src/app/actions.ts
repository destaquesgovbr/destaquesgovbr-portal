"use server"

import type { ArticleRow } from "@/lib/article-row"
import { getPool } from "@/lib/client"

export async function getLatestArticles(): Promise<ArticleRow[]> {
  const pool = await getPool()
  const result = await pool.query(
    `
      SELECT *
      FROM news
      ORDER BY published_at DESC
      LIMIT 4
    `,
  )
  return result.rows as ArticleRow[]
}
