'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import NewsCard from '@/components/NewsCard'
import { getArticles } from './actions'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { getExcerpt } from '@/lib/utils'

export default function ArticlesPage() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  function queryFn({ pageParam }: { pageParam: number | null }) {
    return getArticles({
      page: pageParam ?? 1,
      startDate: startDate?.getTime(),
      endDate: endDate?.getTime()
    })
  }

  const articlesQ = useInfiniteQuery({
    queryKey: ['articles'],
    queryFn,
    getNextPageParam: (lastPage) => lastPage.page ?? undefined,
    initialPageParam: 1
  })

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && articlesQ.hasNextPage && !articlesQ.isFetchingNextPage) {
        articlesQ.fetchNextPage()
      }
    }
  })

  const articles = articlesQ.data?.pages.flatMap((page) => page.articles) ?? []

  useEffect(() => {
    articlesQ.refetch()
  }, [startDate, endDate])

  if (articlesQ.isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">
          Ocorreu um erro ao carregar os artigos.
        </p>
      </div>
    )
  }

  return (
    <section className="py-16 overflow-hidden">
      {/* Cabeçalho institucional */}
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl font-bold text-primary">Notícias</h2>

        {/* Linha divisória SVG */}
        <div className="mx-auto mt-3 w-40">
          <img src="/underscore.svg" alt="" />
        </div>

        {/* Subtítulo institucional */}
        <p className="mt-4 text-base text-primary/80">
          Acompanhe as últimas notícias, atualizações e comunicados oficiais do portal.
        </p>
      </div>

      {/* Filtros de data */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap justify-center md:justify-end gap-6">
          <div>
            <span className="text-primary font-semibold text-xs">Início da publicação:</span>
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

          <div>
            <span className="text-primary font-semibold text-xs">Fim da publicação:</span>
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

      {/* Grid de artigos */}
      <div className="container mx-auto px-4">
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
