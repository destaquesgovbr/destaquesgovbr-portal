'use client'

import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

const SearchBar = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    router.push(`/busca?q=${encodeURIComponent(query.trim())}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault()
      handleSubmit()
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
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
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
    </form>
  )
}

export default SearchBar
