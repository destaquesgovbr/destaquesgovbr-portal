'use client'

import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  getSearchSuggestions,
  type SearchSuggestion,
} from '@/app/(public)/busca/actions'
import { Input } from '@/components/ui/input'

// Remove diacritics (accents) from a string for comparison
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  // Normalize both text and query for accent-insensitive matching
  const normalizedText = removeDiacritics(text)
  const normalizedQuery = removeDiacritics(query)
  const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  // Find all match positions in the normalized text
  const matches: Array<{ start: number; end: number }> = []
  let match = regex.exec(normalizedText)

  while (match !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length })
    match = regex.exec(normalizedText)
  }

  if (matches.length === 0) return text

  // Build result using original text with matches highlighted
  const result: React.ReactNode[] = []
  let lastIndex = 0
  let matchCount = 0

  for (const { start, end } of matches) {
    // Add text before the match
    if (start > lastIndex) {
      result.push(text.slice(lastIndex, start))
    }
    // Add highlighted match (using original text, not normalized)
    const matchedText = text.slice(start, end)
    result.push(
      <mark
        key={`match-${matchCount++}-${start}`}
        className="bg-yellow-200 text-inherit rounded-sm px-0.5"
      >
        {matchedText}
      </mark>,
    )
    lastIndex = end
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result
}

const SearchBar = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize query from URL params
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync query with URL params when they change externally
  const urlQuery = searchParams.get('q') || ''
  if (urlQuery !== query && urlQuery !== '') {
    setQuery(urlQuery)
  }

  // Fetch suggestions with React Query
  const { data: suggestions = [] } = useQuery<SearchSuggestion[]>({
    queryKey: ['searchSuggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Derive isOpen state from suggestions
  const shouldShowDropdown =
    isOpen && suggestions.length > 0 && query.length >= 2

  // Close dropdown on click outside (this useEffect is necessary for document listeners)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setSelectedIndex(-1)

    // Debounce the query update
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(newValue)
      // Open dropdown when we have a query
      if (newValue.length >= 2) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }, 300)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    setIsOpen(false)
    router.push(`/busca?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title)
    setIsOpen(false)
    router.push(`/artigos/${suggestion.unique_id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Escape regardless of dropdown state
    if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      return
    }

    if (!shouldShowDropdown) {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault()
        handleSubmit()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        } else {
          handleSubmit()
        }
        break
    }
  }

  const handleClear = () => {
    setQuery('')
    setDebouncedQuery('')
    setIsOpen(false)

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Remove apenas o parâmetro 'q' da URL, mantendo os outros filtros
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')

    // Se estiver na página de busca e houver outros filtros, mantenha na página de busca
    // Caso contrário, volte para a home
    if (pathname === '/busca' && params.toString()) {
      router.push(`/busca?${params.toString()}`)
    } else if (pathname === '/busca') {
      router.push('/')
    }
    // Se não estiver na página de busca, apenas limpa o campo (não navega)
  }

  const listboxId = 'search-suggestions-listbox'

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Buscar notícias..."
            className={query ? 'pl-10 pr-10' : 'pl-10'}
            role="combobox"
            aria-expanded={shouldShowDropdown}
            aria-controls={listboxId}
            aria-activedescendant={
              selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
            }
            aria-autocomplete="list"
            autoComplete="off"
          />
          {query && (
            <X
              onClick={handleClear}
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground rounded-full p-2 hover:bg-gray-200 active:bg-gray-300 hover:cursor-pointer transition-colors touch-manipulation"
              aria-label="Limpar busca"
            />
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {shouldShowDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Sugestões de busca"
          className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-80 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <Link
              key={suggestion.unique_id}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              href={`/artigos/${suggestion.unique_id}`}
              onClick={() => {
                setIsOpen(false)
                setQuery(suggestion.title)
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`block px-4 py-3 text-sm cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <span className="line-clamp-2">
                {highlightMatch(suggestion.title, query)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
