import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ArticleRow } from '@/types/article'
import type { PrioritizationConfig } from '../prioritization-config'
import {
  calculateArticleScore,
  calculateThemeScores,
  formatScoreBreakdown,
  getPrioritizedArticles,
  getPrioritizedThemes,
  type ScoredArticle,
} from '../prioritization'

const mockConfig: PrioritizationConfig = {
  agencyWeights: { mgi: 1.5, mec: 1.2 },
  themeWeights: { '01': 1.3, '01.01': 1.5 },
  recencyDecayHours: 72,
  recencyWeight: 0.5,
  hasImageBoost: 1.1,
  hasSummaryBoost: 1.05,
  maxArticleAgeDays: null,
  excludedAgencies: ['excluded-agency'],
  excludedThemes: ['99'],
  themeFocusMode: 'volume',
  manualThemes: [],
}

function createMockArticle(overrides: Partial<ArticleRow> = {}): ArticleRow {
  return {
    unique_id: 'test-article',
    agency: 'mgi',
    published_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    title: 'Test Article',
    url: null,
    image: 'https://example.com/image.jpg',
    category: null,
    content: 'Test content',
    summary: 'Test summary',
    subtitle: null,
    editorial_lead: null,
    extracted_at: null,
    theme_1_level_1_code: '01',
    theme_1_level_1_label: 'Economia',
    theme_1_level_2_code: '01.01',
    theme_1_level_2_label: 'Infraestrutura',
    theme_1_level_3_code: null,
    theme_1_level_3_label: null,
    most_specific_theme_code: null,
    most_specific_theme_label: null,
    published_year: 2024,
    published_month: 12,
    published_week: 50,
    tags: [],
    ...overrides,
  }
}

describe('calculateArticleScore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-12-12T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calculates score greater than zero', () => {
    const article = createMockArticle({ agency: 'mgi' })
    const score = calculateArticleScore(article, mockConfig)

    expect(score).toBeGreaterThan(0)
  })

  it('applies agency weight correctly', () => {
    const articleWithWeight = createMockArticle({ agency: 'mgi' }) // weight 1.5
    const articleWithoutWeight = createMockArticle({ agency: 'unknown' }) // weight 1.0

    const scoreWithWeight = calculateArticleScore(articleWithWeight, mockConfig)
    const scoreWithoutWeight = calculateArticleScore(
      articleWithoutWeight,
      mockConfig,
    )

    expect(scoreWithWeight).toBeGreaterThan(scoreWithoutWeight)
  })

  it('applies theme weight (best of all levels)', () => {
    const articleWithTheme = createMockArticle({
      theme_1_level_1_code: '01', // weight 1.3
      theme_1_level_2_code: '01.01', // weight 1.5 (higher)
    })
    const articleWithoutTheme = createMockArticle({
      theme_1_level_1_code: '02', // no weight
      theme_1_level_2_code: null,
    })

    const scoreWithTheme = calculateArticleScore(articleWithTheme, mockConfig)
    const scoreWithoutTheme = calculateArticleScore(
      articleWithoutTheme,
      mockConfig,
    )

    expect(scoreWithTheme).toBeGreaterThan(scoreWithoutTheme)
  })

  it('applies image boost when image present', () => {
    const withImage = createMockArticle({ image: 'https://example.com/img.jpg' })
    const withoutImage = createMockArticle({ image: null })

    const scoreWithImage = calculateArticleScore(withImage, mockConfig)
    const scoreWithoutImage = calculateArticleScore(withoutImage, mockConfig)

    expect(scoreWithImage).toBeGreaterThan(scoreWithoutImage)
  })

  it('applies summary boost when summary present', () => {
    const withSummary = createMockArticle({ summary: 'Has summary' })
    const withoutSummary = createMockArticle({ summary: null })

    const scoreWithSummary = calculateArticleScore(withSummary, mockConfig)
    const scoreWithoutSummary = calculateArticleScore(withoutSummary, mockConfig)

    expect(scoreWithSummary).toBeGreaterThan(scoreWithoutSummary)
  })

  it('decays score based on recency', () => {
    const now = Math.floor(Date.now() / 1000)
    const recent = createMockArticle({
      published_at: now - 3600, // 1 hour ago
    })
    const older = createMockArticle({
      published_at: now - 259200, // 72 hours ago
    })

    const recentScore = calculateArticleScore(recent, mockConfig)
    const olderScore = calculateArticleScore(older, mockConfig)

    expect(recentScore).toBeGreaterThan(olderScore)
  })

  it('handles article with no published_at', () => {
    const article = createMockArticle({ published_at: null })
    const score = calculateArticleScore(article, mockConfig)

    expect(score).toBeGreaterThan(0)
  })

  it('includes breakdown when requested', () => {
    const article = createMockArticle()
    calculateArticleScore(article, mockConfig, true)

    const scored = article as ScoredArticle
    expect(scored._scoreBreakdown).toBeDefined()
    expect(scored._scoreBreakdown?.agencyWeight).toBeDefined()
    expect(scored._scoreBreakdown?.themeWeight).toBeDefined()
    expect(scored._scoreBreakdown?.recencyFactor).toBeDefined()
    expect(scored._scoreBreakdown?.contentBoosts).toBeDefined()
  })
})

describe('getPrioritizedArticles', () => {
  it('excludes articles from excluded agencies', () => {
    const articles = [
      createMockArticle({ unique_id: 'a1', agency: 'mgi' }),
      createMockArticle({ unique_id: 'a2', agency: 'excluded-agency' }),
    ]

    const result = getPrioritizedArticles(articles, mockConfig)

    expect(result).toHaveLength(1)
    expect(result[0].unique_id).toBe('a1')
  })

  it('excludes articles from excluded themes', () => {
    const articles = [
      createMockArticle({ unique_id: 'a1', theme_1_level_1_code: '01' }),
      createMockArticle({ unique_id: 'a2', theme_1_level_1_code: '99' }),
    ]

    const result = getPrioritizedArticles(articles, mockConfig)

    expect(result).toHaveLength(1)
    expect(result[0].unique_id).toBe('a1')
  })

  it('orders articles by score (highest first)', () => {
    const articles = [
      createMockArticle({
        unique_id: 'low',
        agency: null,
        image: null,
        summary: null,
      }),
      createMockArticle({
        unique_id: 'high',
        agency: 'mgi',
        image: 'img',
        summary: 'sum',
      }),
    ]

    const result = getPrioritizedArticles(articles, mockConfig)

    expect(result[0].unique_id).toBe('high')
  })

  it('respects limit parameter', () => {
    const articles = Array.from({ length: 20 }, (_, i) =>
      createMockArticle({ unique_id: `article-${i}` }),
    )

    const result = getPrioritizedArticles(articles, mockConfig, 5)

    expect(result).toHaveLength(5)
  })

  it('returns all articles when no limit specified', () => {
    const articles = Array.from({ length: 10 }, (_, i) =>
      createMockArticle({ unique_id: `article-${i}` }),
    )

    const result = getPrioritizedArticles(articles, mockConfig)

    expect(result).toHaveLength(10)
  })

  it('adds _score property to articles', () => {
    const articles = [createMockArticle()]

    const result = getPrioritizedArticles(articles, mockConfig)

    expect(result[0]._score).toBeDefined()
    expect(typeof result[0]._score).toBe('number')
  })

  it('uses published_at as tiebreaker for equal scores', () => {
    // Create articles with same agency/theme but different published_at
    const articles = [
      createMockArticle({
        unique_id: 'older',
        published_at: Math.floor(Date.now() / 1000) - 7200,
      }),
      createMockArticle({
        unique_id: 'newer',
        published_at: Math.floor(Date.now() / 1000) - 3600,
      }),
    ]

    const result = getPrioritizedArticles(articles, mockConfig)

    // With similar scores, newer should come first
    expect(result[0].unique_id).toBe('newer')
  })
})

describe('calculateThemeScores', () => {
  it('aggregates scores by theme', () => {
    const articles = [
      createMockArticle({ theme_1_level_1_label: 'Economia' }),
      createMockArticle({ theme_1_level_1_label: 'Economia' }),
      createMockArticle({ theme_1_level_1_label: 'Saúde' }),
    ]

    const scores = calculateThemeScores(articles, mockConfig)

    const economiaScore = scores.find((s) => s.name === 'Economia')
    const saudeScore = scores.find((s) => s.name === 'Saúde')

    expect(economiaScore?.count).toBe(2)
    expect(saudeScore?.count).toBe(1)
  })

  it('calculates average score per theme', () => {
    const articles = [
      createMockArticle({ theme_1_level_1_label: 'Economia' }),
      createMockArticle({ theme_1_level_1_label: 'Economia' }),
    ]

    const scores = calculateThemeScores(articles, mockConfig)
    const economiaScore = scores.find((s) => s.name === 'Economia')

    expect(economiaScore?.avgScore).toBe(
      economiaScore!.totalScore / economiaScore!.count,
    )
  })

  it('skips articles without theme label', () => {
    const articles = [
      createMockArticle({ theme_1_level_1_label: 'Economia' }),
      createMockArticle({ theme_1_level_1_label: null }),
    ]

    const scores = calculateThemeScores(articles, mockConfig)

    expect(scores).toHaveLength(1)
  })
})

describe('getPrioritizedThemes', () => {
  it('returns manual themes when mode is manual', () => {
    const manualConfig = {
      ...mockConfig,
      themeFocusMode: 'manual' as const,
      manualThemes: ['Saúde', 'Educação', 'Economia'],
    }

    const result = getPrioritizedThemes([], manualConfig, 3)

    expect(result).toEqual(['Saúde', 'Educação', 'Economia'])
  })

  it('respects limit for manual themes', () => {
    const manualConfig = {
      ...mockConfig,
      themeFocusMode: 'manual' as const,
      manualThemes: ['A', 'B', 'C', 'D', 'E'],
    }

    const result = getPrioritizedThemes([], manualConfig, 2)

    expect(result).toHaveLength(2)
  })

  it('sorts by volume when mode is volume', () => {
    const articles = [
      ...Array.from({ length: 10 }, () =>
        createMockArticle({ theme_1_level_1_label: 'Economia' }),
      ),
      ...Array.from({ length: 5 }, () =>
        createMockArticle({ theme_1_level_1_label: 'Saúde' }),
      ),
    ]

    const volumeConfig = { ...mockConfig, themeFocusMode: 'volume' as const }
    const result = getPrioritizedThemes(articles, volumeConfig, 2)

    expect(result[0]).toBe('Economia')
    expect(result[1]).toBe('Saúde')
  })

  it('sorts by total score when mode is weighted', () => {
    const articles = [
      createMockArticle({ theme_1_level_1_label: 'Economia' }),
      createMockArticle({ theme_1_level_1_label: 'Saúde' }),
    ]

    const weightedConfig = { ...mockConfig, themeFocusMode: 'weighted' as const }
    const result = getPrioritizedThemes(articles, weightedConfig, 2)

    expect(result).toHaveLength(2)
  })

  it('uses default limit of 3', () => {
    const articles = Array.from({ length: 10 }, (_, i) =>
      createMockArticle({ theme_1_level_1_label: `Theme${i}` }),
    )

    const result = getPrioritizedThemes(articles, mockConfig)

    expect(result).toHaveLength(3)
  })
})

describe('formatScoreBreakdown', () => {
  it('returns simple score string without breakdown', () => {
    const article = createMockArticle() as ScoredArticle
    article._score = 1.234

    const result = formatScoreBreakdown(article)

    expect(result).toBe('Score: 1.234')
  })

  it('returns detailed breakdown when available', () => {
    const article = createMockArticle() as ScoredArticle
    article._score = 1.234
    article._scoreBreakdown = {
      agencyWeight: 1.5,
      themeWeight: 1.3,
      recencyFactor: 0.8,
      contentBoosts: 1.1,
      baseScore: 1.56,
      finalScore: 1.234,
    }

    const result = formatScoreBreakdown(article)

    expect(result).toContain('Score: 1.234')
    expect(result).toContain('Agency:')
    expect(result).toContain('Theme:')
    expect(result).toContain('Recency:')
    expect(result).toContain('Content:')
    expect(result).toContain('Base:')
  })
})
