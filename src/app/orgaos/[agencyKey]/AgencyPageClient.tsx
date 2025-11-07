'use client'

import NewsCard from '@/components/NewsCard'
import { getArticles } from './actions'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getExcerpt } from '@/lib/utils'
import { ArticleFilters } from '@/components/ArticleFilters'

type AgencyPageClientProps = {
  agencyKey: string
  agencyName: string
}

export default function AgencyPageClient({ agencyKey, agencyName }: AgencyPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize state from URL params
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const dataInicio = searchParams.get('dataInicio')
    return dataInicio ? new Date(dataInicio) : undefined
  })

  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const dataFim = searchParams.get('dataFim')
    return dataFim ? new Date(dataFim) : undefined
  })

  // Function to update URL params
  const updateUrlParams = useCallback(
    (updates: {
      dataInicio?: string | null
      dataFim?: string | null
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      // Update or remove each param
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(newUrl, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  // Wrapped setters that update URL
  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      setStartDate(date)
      updateUrlParams({
        dataInicio: date ? date.toISOString().split('T')[0] : null,
      })
    },
    [updateUrlParams]
  )

  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      setEndDate(date)
      updateUrlParams({
        dataFim: date ? date.toISOString().split('T')[0] : null,
      })
    },
    [updateUrlParams]
  )

  const articlesQ = useInfiniteQuery({
    queryKey: ['articles', agencyKey, startDate, endDate],
    queryFn: ({ pageParam }: { pageParam: number | null }) =>
      getArticles({
        page: pageParam ?? 1,
        agency: agencyKey,
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime(),
      }),
    getNextPageParam: (lastPage) => lastPage.page ?? undefined,
    initialPageParam: 1,
  })

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && articlesQ.hasNextPage && !articlesQ.isFetchingNextPage) {
        articlesQ.fetchNextPage()
      }
    },
  })

  const articles = articlesQ.data?.pages.flatMap((page) => page.articles) ?? []

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
    <section className="py-16">
      {/* Cabeçalho institucional do órgão */}
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl font-bold text-primary">{agencyName}</h2>

        {/* Linha divisória SVG */}
        <div className="mx-auto mt-3 w-40">
          <img src="/underscore.svg" alt="" />
        </div>

        {/* Subtítulo */}
        <p className="mt-4 text-base text-primary/80">
          Acompanhe as notícias e publicações oficiais deste órgão.
        </p>
      </div>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <ArticleFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            showAgencyFilter={false}
          />

          {/* Right Content - Results Grid */}
          <main className="flex-1 min-w-0">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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

            {articles.length === 0 && (
              <p className="text-center text-primary/60 mt-12">
                Nenhum artigo encontrado para este órgão no momento.
              </p>
            )}
          </main>
        </div>
      </div>
    </section>
  )
}
