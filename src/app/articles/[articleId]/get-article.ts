"use server"

import { getPool } from "@/lib/client"

export type GetArticleResult = {
  id: number
  unique_id: string
  agency: string | null
  published_at: Date | null
  title: string | null
  url: string | null
  image: string | null
  category: string | null
  tags: string[] | null
  content: string | null
  extracted_at: Date | null
  time_1_level_1: string | null
  created_at: Date
}[]

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
