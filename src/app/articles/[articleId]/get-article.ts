'use server'

import type { ArticleRow } from '@/lib/article-row'
import { getPool } from '@/lib/client'

export type GetArticleResult = ArticleRow[]

export async function getArticleById(id: number): Promise<GetArticleResult> {
  const pool = await getPool()
  const result = await pool.query(
    `
    SELECT *
    FROM news
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  )
  return result.rows as GetArticleResult
}

export async function getArticleByUniqueId(
  uniqueId: string,
): Promise<GetArticleResult> {
  const pool = await getPool()
  const result = await pool.query(
    `
    SELECT *
    FROM news
    WHERE unique_id = $1
    LIMIT 1
    `,
    [uniqueId],
  )
  return result.rows as GetArticleResult
}
