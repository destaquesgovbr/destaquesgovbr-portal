'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const SearchBar = () => {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("tema") || "")
  const router = useRouter()

  useEffect(() => {
    if (!query) return

    const handler = setTimeout(() => {
      router.push(`/busca?q=${encodeURIComponent(query)}`)
    }, 2000)

    return () => clearTimeout(handler)
  }, [query, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar notícias..."
        className="pl-10"
      />
    </div>
  )
}

export default SearchBar
