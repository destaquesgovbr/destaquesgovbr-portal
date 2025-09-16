export type ArticleRow = {
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
}
