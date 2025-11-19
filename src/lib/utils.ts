import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Remove markdown formatting from text and returns clean plain text
 * Useful for displaying content previews in cards
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return ''

  return markdown
    // Remove images: ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links but keep text: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove headers: ## Header -> Header
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic: **text** or *text* -> text
    .replace(/\*\*([^\*]+)\*\*/g, '$1')
    .replace(/\*([^\*]+)\*/g, '$1')
    // Remove blockquotes: > text
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules: --- or ***
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove code blocks: ```code```
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code: `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim()
}

/**
 * Get a clean text excerpt from markdown content
 * @param content - Markdown content
 * @param maxLength - Maximum length of excerpt (default: 200)
 */
export function getExcerpt(content: string, maxLength: number = 200): string {
  const cleanText = stripMarkdown(content)

  if (cleanText.length <= maxLength) {
    return cleanText
  }

  // Find last space before maxLength to avoid cutting words
  const excerpt = cleanText.substring(0, maxLength)
  const lastSpace = excerpt.lastIndexOf(' ')

  if (lastSpace > 0) {
    return excerpt.substring(0, lastSpace) + '...'
  }

  return excerpt + '...'
}

/**
 * Format Unix timestamp to display date and time (if not midnight)
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string, with time if not 00:00
 *
 * Examples:
 * - 2024-01-15 00:00:00 → "15 de jan de 2024"
 * - 2024-01-15 19:24:43 → "15 de jan de 2024 às 19h24"
 */
export function formatDateTime(timestamp: number | null): string {
  if (!timestamp) return ''

  const date = new Date(timestamp * 1000)

  // Check if time is midnight (00:00)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const isMidnight = hours === 0 && minutes === 0

  // Format date
  const dateStr = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  // If midnight, return only date
  if (isMidnight) {
    return dateStr
  }

  // Format time (HH:MM in Brazilian format)
  const timeStr = `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}`

  return `${dateStr} às ${timeStr}`
}
