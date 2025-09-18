'use server'

import type { ArticleRow } from '@/lib/article-row'
import { getPool } from '@/lib/client'
import { withResult } from '@/lib/result'

export const getLatestArticles = withResult(async (): Promise<ArticleRow[]> => {
  const pool = await getPool()
  const result = await pool.query(
    `
      SELECT *
      FROM news
      ORDER BY published_at DESC
      LIMIT 5
    `,
  )
  return result.rows as ArticleRow[]
})

export type GetCategoriesResult = {
  name: string
  count: number
}[]

export const getCategories = withResult(
  async (): Promise<GetCategoriesResult> => {
    const pool = await getPool()
    const result = await pool.query(`
      SELECT category AS name, count(*) as count
      FROM news
      WHERE category IS NOT NULL
        AND category <> ''
        AND category <> 'No Category'
        AND published_at > NOW() - INTERVAL '7 days'
      GROUP BY category
      ORDER BY count DESC
      LIMIT 4
    `)
    return result.rows
  },
)
