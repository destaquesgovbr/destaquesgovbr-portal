'use server'

import { getPrioritizedArticles } from '@/config/prioritization'
import { DEFAULT_CONFIG } from '@/config/prioritization-config'
import { typesense } from '@/services/typesense/client'
import type { ArticleRow } from '@/types/article'

export type QueryArticlesArgs = {
  query?: string
  page: number
  startDate?: number
  endDate?: number
  agencies?: string[]
  themes?: string[]
}

export type QueryArticlesResult = {
  articles: ArticleRow[]
  page: number
}

const PAGE_SIZE = 40

export type SearchSuggestion = {
  unique_id: string
  title: string
}

export type InlineAutocompleteSuggestion = {
  completion: string // The full suggested text to show
  suffix: string // Just the part to append after user's input
  unique_id: string // The article ID for direct navigation
}

// Remove diacritics (accents) from a string for comparison
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Get inline autocomplete suggestion based on prefix matching.
 * Returns the best matching title that starts with the user's query.
 * Uses accent-insensitive comparison for Portuguese text.
 */
export async function getInlineAutocompleteSuggestion(
  query: string,
): Promise<InlineAutocompleteSuggestion | null> {
  if (!query || query.length < 2) return null

  const normalizedQuery = removeDiacritics(query.toLowerCase().trim())

  try {
    const result = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: query,
        query_by: 'title',
        prefix: true,
        limit: 10,
        pre_segmented_query: false,
      })

    const articles = result.hits?.map((hit) => hit.document as ArticleRow) ?? []

    // Find the first title that starts with the query (accent-insensitive)
    for (const article of articles) {
      const title = article.title ?? ''
      const normalizedTitle = removeDiacritics(title.toLowerCase())

      // Check if title starts with the query
      if (normalizedTitle.startsWith(normalizedQuery)) {
        return {
          completion: title,
          suffix: title.slice(query.length),
          unique_id: article.unique_id,
        }
      }

      // Also check word-by-word matching for multi-word queries
      const queryWords = normalizedQuery.split(/\s+/)
      const titleWords = title.split(/\s+/)
      const normalizedTitleWords = titleWords.map((w) =>
        removeDiacritics(w.toLowerCase()),
      )

      if (queryWords.length > 0 && titleWords.length >= queryWords.length) {
        let matches = true
        for (let i = 0; i < queryWords.length - 1; i++) {
          if (normalizedTitleWords[i] !== queryWords[i]) {
            matches = false
            break
          }
        }

        // Check if last query word is a prefix of the corresponding title word
        const lastQueryWord = queryWords[queryWords.length - 1]
        const lastNormalizedTitleWord =
          normalizedTitleWords[queryWords.length - 1]

        if (matches && lastNormalizedTitleWord?.startsWith(lastQueryWord)) {
          // Calculate where in the original title the completion starts
          const queryUpToLastWord = queryWords.slice(0, -1).join(' ')
          const prefixLength = queryUpToLastWord
            ? queryUpToLastWord.length + 1 + lastQueryWord.length
            : lastQueryWord.length

          return {
            completion: title,
            suffix: title.slice(prefixLength),
            unique_id: article.unique_id,
          }
        }
      }
    }

    return null
  } catch {
    return null
  }
}

export async function getSearchSuggestions(
  query: string,
): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return []

  try {
    const result = await typesense
      .collections<ArticleRow>('news')
      .documents()
      .search({
        q: query,
        query_by: 'title,content',
        prefix: true,
        limit: 50, // Fetch more to apply prioritization
        pre_segmented_query: false,
      })

    const articles = result.hits?.map((hit) => hit.document as ArticleRow) ?? []

    // Apply prioritization to results
    const prioritized = getPrioritizedArticles(articles, DEFAULT_CONFIG, 7)

    return prioritized.map((article) => ({
      unique_id: article.unique_id,
      title: article.title ?? '',
    }))
  } catch {
    return []
  }
}

export async function queryArticles(
  args: QueryArticlesArgs,
): Promise<QueryArticlesResult> {
  const { page, query, startDate, endDate, agencies, themes } = args

  const filter_by: string[] = []

  if (startDate) {
    filter_by.push(`published_at:>${Math.floor(startDate / 1000)}`)
  }

  if (endDate) {
    filter_by.push(`published_at:<${Math.floor(endDate / 1000 + 60 * 60 * 3)}`)
  }

  if (agencies && agencies.length > 0) {
    filter_by.push(`agency:[${agencies.join(',')}]`)
  }

  if (themes && themes.length > 0) {
    // Filter by any theme level - level 1, 2, or 3
    const themeFilters = themes.map(
      (theme) =>
        `(theme_1_level_1_code:${theme} || theme_1_level_2_code:${theme} || theme_1_level_3_code:${theme})`,
    )
    filter_by.push(`(${themeFilters.join(' || ')})`)
  }

  // biome-ignore format: true
  const result = await typesense
    .collections<ArticleRow>('news')
    .documents()
    .search({
      q: query ?? '*',
      query_by: 'title, content',
      sort_by: 'published_at:desc, unique_id:desc',
      filter_by: filter_by.join(" && "),
      limit: PAGE_SIZE,
      page
    })

  return {
    articles: result.hits?.map((hit) => hit.document) ?? [],
    page: page + 1,
  }
}
