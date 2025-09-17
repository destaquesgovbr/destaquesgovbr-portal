'use server'

import type { ArticleRow } from '@/lib/article-row'
import { getPool } from '@/lib/client'
import { ResultError, withResult } from '@/lib/result'

export type GetArticleError = 'not_found' | 'db_error'

export const getArticleById = withResult(
  async (id: number): Promise<ArticleRow> => {
    const pool = await getPool().catch(() => {
      throw new ResultError<GetArticleError>('db_error')
    })
    const result = await pool
      .query(
        `
          SELECT *
          FROM news
          WHERE id = $1::int
          LIMIT 1
        `,
        [id],
      )
      .catch(() => {
        throw new ResultError<GetArticleError>('db_error')
      })

    if (result.rows.length === 0)
      throw new ResultError<GetArticleError>('not_found')

    return result.rows[0]
  },
  {} as GetArticleError,
)

export const getArticleByUniqueId = withResult(
  async (uniqueId: string): Promise<ArticleRow> => {
    const pool = await getPool().catch(() => {
      throw new ResultError<GetArticleError>('db_error')
    })
    const result = await pool
      .query(
        `
          SELECT *
          FROM news
          WHERE unique_id = $1::text
          LIMIT 1
        `,
        [uniqueId],
      )
      .catch(() => {
        throw new ResultError<GetArticleError>('db_error')
      })

    if (result.rowCount === 0)
      throw new ResultError<GetArticleError>('not_found')

    return result.rows[0]
  },
  {} as GetArticleError,
)
