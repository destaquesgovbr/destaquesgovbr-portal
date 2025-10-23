'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const SearchBar = () => {
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!query) return

    const handler = setTimeout(() => {
      router.push(`/busca?q=${encodeURIComponent(query)}`)
    }, 2000)

    return () => clearTimeout(handler)
  }, [query, router])

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar notícias..."
        className="pl-10"
      />
    </div>
  )
}

export default SearchBar
