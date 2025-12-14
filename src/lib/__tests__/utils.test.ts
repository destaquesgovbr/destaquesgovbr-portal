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
  it('formats midnight timestamps as date only', () => {
    // Create a midnight timestamp in local timezone
    const date = new Date(2024, 0, 15, 0, 0, 0) // Jan 15, 2024 00:00:00 local
    const timestamp = Math.floor(date.getTime() / 1000)
    const result = formatDateTime(timestamp)

    expect(result).toMatch(/15/)
    expect(result).toMatch(/jan/i)
    expect(result).not.toContain('às')
  })

  it('includes time for non-midnight timestamps', () => {
    // Create a non-midnight timestamp in local timezone
    const date = new Date(2024, 0, 15, 14, 30, 0) // Jan 15, 2024 14:30:00 local
    const timestamp = Math.floor(date.getTime() / 1000)
    const result = formatDateTime(timestamp)

    expect(result).toMatch(/15/)
    expect(result).toMatch(/jan/i)
    expect(result).toContain('às')
    expect(result).toMatch(/\d{2}h\d{2}/)
  })

  it('handles null timestamp', () => {
    expect(formatDateTime(null)).toBe('')
  })

  it('handles zero timestamp', () => {
    // Zero is falsy so should return empty
    expect(formatDateTime(0)).toBe('')
  })

  it('formats time with leading zeros', () => {
    // A timestamp with single-digit hours/minutes
    const date = new Date(2024, 0, 15, 1, 5, 0) // Jan 15, 2024 01:05:00 local
    const timestamp = Math.floor(date.getTime() / 1000)
    const result = formatDateTime(timestamp)

    // Should have proper hour formatting
    expect(result).toMatch(/\d{2}h\d{2}/)
  })

  it('uses Brazilian date format', () => {
    const date = new Date(2024, 0, 15, 12, 0, 0) // Jan 15, 2024 12:00:00 local
    const timestamp = Math.floor(date.getTime() / 1000)
    const result = formatDateTime(timestamp)

    // Brazilian format uses "de" for month separator
    expect(result).toMatch(/de.*de/)
  })
})
