'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import NewsCard from '@/components/NewsCard'
import { queryArticles } from './actions'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { getExcerpt } from '@/lib/utils'
import { AgencyMultiSelect } from '@/components/AgencyMultiSelect'
import type { AgencyOption } from '@/lib/get-agencies-list'

type QueryPageClientProps = {
  agencies: AgencyOption[]
}

export default function QueryPageClient({ agencies }: QueryPageClientProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || undefined

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([])

  function queryFn({ pageParam }: { pageParam: number | null }) {
    return queryArticles({
      query,
      page: pageParam ?? 1,
      startDate: startDate?.getTime(),
      endDate: endDate?.getTime(),
      agencies: selectedAgencies.length > 0 ? selectedAgencies : undefined
    })
  }

  const articlesQ = useInfiniteQuery({
    queryKey: ['articles', query, startDate, endDate, selectedAgencies],
    queryFn,
    getNextPageParam: (lastPage) => lastPage.page ?? undefined,
    initialPageParam: 1
  })

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && articlesQ.hasNextPage && !articlesQ.isFetchingNextPage) {
        articlesQ.fetchNextPage()
      }
    },
  })

  useEffect(() => {
    articlesQ.refetch()
  }, [query, startDate, endDate, selectedAgencies])

  const articles = articlesQ.data?.pages.flatMap((page) => page.articles) ?? []

  if (articlesQ.isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">
          Ocorreu um erro ao carregar os resultados.
        </p>
      </div>
    )
  }

  return (
    <section className="py-16">
      {/* Cabeçalho institucional */}
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl font-bold text-primary">
          Resultados para "{query}"
        </h2>

        {/* Linha divisória SVG */}
        <div className="mx-auto mt-3 w-40">
          <img src="/underscore.svg" alt="" />
        </div>

        {/* Frase de apoio */}
        <p className="mt-4 text-base text-primary/80">
          Veja os artigos e publicações que correspondem à sua busca no portal.
        </p>
      </div>

      {/* Filtros */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap justify-center md:justify-end gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-primary font-semibold text-xs block">Agências:</span>
            <AgencyMultiSelect
              agencies={agencies}
              selectedAgencies={selectedAgencies}
              onSelectedAgenciesChange={setSelectedAgencies}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-primary font-semibold text-xs block">Início da publicação:</span>
            <div className="relative w-full">
              <Input
                type="date"
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className={startDate ? 'pr-9' : undefined}
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
              />
              {startDate && (
                <X
                  onClick={() => setStartDate(undefined)}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground rounded-full p-2 hover:bg-gray-200 hover:cursor-pointer"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-primary font-semibold text-xs block">Fim da publicação:</span>
            <div className="relative w-full">
              <Input
                type="date"
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className={endDate ? 'pr-9' : undefined}
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
              />
              {endDate && (
                <X
                  onClick={() => setEndDate(undefined)}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground rounded-full p-2 hover:bg-gray-200 hover:cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de resultados */}
      <div className="container mx-auto px-4 overflow-hidden">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {articles.map((article, index) => (
            <NewsCard
              key={index}
              internalUrl={`/artigos/${article.unique_id}`}
              theme_1_level_1={article.theme_1_level_1_label || ''}
              date={article.published_at}
              ref={index === articles.length - 1 ? ref : undefined}
              summary={getExcerpt(article.content || '', 150)}
              title={article.title || ''}
              imageUrl={article.image || ''}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
