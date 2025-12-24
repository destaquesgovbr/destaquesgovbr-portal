import { describe, expect, it } from 'vitest'
import { cn, formatDateTime, getExcerpt, stripMarkdown } from '../utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles tailwind merge (later classes override)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('handles undefined values', () => {
    expect(cn('text-red-500', undefined, 'bg-blue-500')).toBe(
      'text-red-500 bg-blue-500',
    )
  })

  it('handles conditional classes', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })

  it('handles false conditional classes', () => {
    const isActive = false
    expect(cn('base', isActive && 'active')).toBe('base')
  })

  it('handles array of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })
})

describe('stripMarkdown', () => {
  it('removes images', () => {
    const input = 'Text ![alt text](https://example.com/image.jpg) more text'
    expect(stripMarkdown(input)).toBe('Text  more text')
  })

  it('preserves link text but removes URL', () => {
    const input = 'Click [here](https://example.com) for more'
    expect(stripMarkdown(input)).toBe('Click here for more')
  })

  it('removes headers', () => {
    const input = '## Header\nContent'
    expect(stripMarkdown(input)).toBe('Header\nContent')
  })

  it('removes different header levels', () => {
    expect(stripMarkdown('# H1')).toBe('H1')
    expect(stripMarkdown('## H2')).toBe('H2')
    expect(stripMarkdown('### H3')).toBe('H3')
    expect(stripMarkdown('###### H6')).toBe('H6')
  })

  it('removes bold', () => {
    expect(stripMarkdown('**bold** text')).toBe('bold text')
  })

  it('removes italic', () => {
    expect(stripMarkdown('*italic* text')).toBe('italic text')
  })

  it('removes code blocks', () => {
    const input = '```js\nconst x = 1;\n```'
    expect(stripMarkdown(input)).toBe('')
  })

  it('removes inline code', () => {
    expect(stripMarkdown('Run `npm install`')).toBe('Run npm install')
  })

  it('removes HTML tags', () => {
    expect(stripMarkdown('<div>content</div>')).toBe('content')
  })

  it('removes blockquotes', () => {
    expect(stripMarkdown('> quoted text')).toBe('quoted text')
  })

  it('removes horizontal rules', () => {
    expect(stripMarkdown('text\n---\nmore')).toBe('text\n\nmore')
    expect(stripMarkdown('text\n***\nmore')).toBe('text\n\nmore')
  })

  it('handles empty input', () => {
    expect(stripMarkdown('')).toBe('')
  })

  it('handles null-like input', () => {
    expect(stripMarkdown(null as unknown as string)).toBe('')
    expect(stripMarkdown(undefined as unknown as string)).toBe('')
  })

  it('cleans up multiple newlines', () => {
    const input = 'text\n\n\n\n\nmore text'
    expect(stripMarkdown(input)).toBe('text\n\nmore text')
  })

  it('trims whitespace', () => {
    const input = '  \n  content  \n  '
    expect(stripMarkdown(input)).toBe('content')
  })
})

describe('getExcerpt', () => {
  it('returns full text if under maxLength', () => {
    const content = 'Short text'
    expect(getExcerpt(content, 200)).toBe('Short text')
  })

  it('truncates at word boundary', () => {
    const content = 'This is a longer text that needs truncation at some point'
    const excerpt = getExcerpt(content, 30)

    expect(excerpt.length).toBeLessThanOrEqual(33) // 30 + "..."
    expect(excerpt.endsWith('...')).toBe(true)
  })

  it('strips markdown before creating excerpt', () => {
    const content = '**Bold** and [link](url) text here'
    expect(getExcerpt(content, 100)).toBe('Bold and link text here')
  })

  it('uses default maxLength of 200', () => {
    const content = 'a'.repeat(250)
    const excerpt = getExcerpt(content)

    expect(excerpt.length).toBeLessThanOrEqual(203) // 200 + "..."
  })

  it('handles content exactly at maxLength', () => {
    const content = 'a'.repeat(100)
    const excerpt = getExcerpt(content, 100)

    expect(excerpt).toBe(content)
    expect(excerpt).not.toContain('...')
  })

  it('handles single long word', () => {
    const content = 'superlongwordwithoutanyspaces'
    const excerpt = getExcerpt(content, 10)

    expect(excerpt).toBe('superlongw...')
  })
})

describe('formatDateTime', () => {
  // Note: formatDateTime uses America/Sao_Paulo timezone (UTC-3)
  // Tests use UTC timestamps that correspond to specific times in Sao Paulo

  it('formats midnight timestamps as date only', () => {
    // Jan 15, 2024 00:00:00 in Sao Paulo = Jan 15, 2024 03:00:00 UTC
    const timestamp = Date.UTC(2024, 0, 15, 3, 0, 0) / 1000
    const result = formatDateTime(timestamp)

    expect(result).toMatch(/15/)
    expect(result).toMatch(/jan/i)
    expect(result).not.toContain('às')
  })

  it('includes time for non-midnight timestamps', () => {
    // Jan 15, 2024 14:30:00 in Sao Paulo = Jan 15, 2024 17:30:00 UTC
    const timestamp = Date.UTC(2024, 0, 15, 17, 30, 0) / 1000
    const result = formatDateTime(timestamp)

    expect(result).toMatch(/15/)
    expect(result).toMatch(/jan/i)
    expect(result).toContain('às')
    expect(result).toContain('14h30')
  })

  it('handles null timestamp', () => {
    expect(formatDateTime(null)).toBe('')
  })

  it('handles zero timestamp', () => {
    // Zero is falsy so should return empty
    expect(formatDateTime(0)).toBe('')
  })

  it('formats time with leading zeros', () => {
    // Jan 15, 2024 01:05:00 in Sao Paulo = Jan 15, 2024 04:05:00 UTC
    const timestamp = Date.UTC(2024, 0, 15, 4, 5, 0) / 1000
    const result = formatDateTime(timestamp)

    expect(result).toContain('01h05')
  })

  it('uses Brazilian date format', () => {
    // Jan 15, 2024 12:00:00 in Sao Paulo = Jan 15, 2024 15:00:00 UTC
    const timestamp = Date.UTC(2024, 0, 15, 15, 0, 0) / 1000
    const result = formatDateTime(timestamp)

    // Brazilian format uses "de" for month separator
    expect(result).toMatch(/de.*de/)
  })

  it('uses consistent timezone regardless of server/client location', () => {
    // This test verifies that the same timestamp produces the same output
    // regardless of where the code runs (important for SSR hydration)
    const timestamp = Date.UTC(2024, 0, 15, 17, 30, 0) / 1000

    // Run multiple times to ensure consistency
    const result1 = formatDateTime(timestamp)
    const result2 = formatDateTime(timestamp)

    expect(result1).toBe(result2)
    expect(result1).toContain('14h30') // Always Sao Paulo time
  })
})
