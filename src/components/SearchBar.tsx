'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const SearchBar = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  useEffect(() => {
    if (!query.trim()) return
    const handler = setTimeout(() => {
      router.push(`/busca?q=${encodeURIComponent(query)}`)
    }, 2000)
    return () => clearTimeout(handler)
  }, [query, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault()
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClear = () => {
    setQuery('')
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

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar notícias..."
        className={query ? 'pl-10 pr-10' : 'pl-10'}
      />
      {query && (
        <X
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground rounded-full p-2 hover:bg-gray-200 active:bg-gray-300 hover:cursor-pointer transition-colors touch-manipulation"
          aria-label="Limpar busca"
        />
      )}
    </div>
  )
}

export default SearchBar
