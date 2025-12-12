'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { ArticleFilters } from '@/components/ArticleFilters'
import NewsCard from '@/components/NewsCard'
import type { AgencyOption } from '@/lib/agencies-utils'
import type { ThemeOption } from '@/lib/themes-utils'
import { getExcerpt } from '@/lib/utils'
import { queryArticles } from './actions'

type QueryPageClientProps = {
  agencies: AgencyOption[]
  themes: ThemeOption[]
}

export default function QueryPageClient({
  agencies,
  themes,
}: QueryPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const query = searchParams.get('q') || undefined

  // Initialize state from URL params
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const dataInicio = searchParams.get('dataInicio')
    return dataInicio ? new Date(dataInicio) : undefined
  })

  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const dataFim = searchParams.get('dataFim')
    return dataFim ? new Date(dataFim) : undefined
  })

  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(() => {
    const agencias = searchParams.get('agencias')
    return agencias ? agencias.split(',') : []
  })

  const [selectedThemes, setSelectedThemes] = useState<string[]>(() => {
    const temas = searchParams.get('temas')
    return temas ? temas.split(',') : []
  })

  // Function to update URL params
  const updateUrlParams = useCallback(
    (updates: {
      dataInicio?: string | null
      dataFim?: string | null
      agencias?: string | null
      temas?: string | null
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      // Keep the search query
      if (query) {
        params.set('q', query)
      }

      // Update or remove each param
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, query, pathname, router],
  )

  // Wrapped setters that update URL
  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      setStartDate(date)
      updateUrlParams({
        dataInicio: date ? date.toISOString().split('T')[0] : null,
      })
    },
    [updateUrlParams],
  )

  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      setEndDate(date)
      updateUrlParams({
        dataFim: date ? date.toISOString().split('T')[0] : null,
      })
    },
    [updateUrlParams],
  )

  const handleAgenciesChange = useCallback(
    (agenciesList: string[]) => {
      setSelectedAgencies(agenciesList)
      updateUrlParams({
        agencias: agenciesList.length > 0 ? agenciesList.join(',') : null,
      })
    },
    [updateUrlParams],
  )

  const handleThemesChange = useCallback(
    (themesList: string[]) => {
      setSelectedThemes(themesList)
      updateUrlParams({
        temas: themesList.length > 0 ? themesList.join(',') : null,
      })
    },
    [updateUrlParams],
  )

  const articlesQ = useInfiniteQuery({
    queryKey: [
      'articles',
      query,
      startDate,
      endDate,
      selectedAgencies,
      selectedThemes,
    ],
    queryFn: ({ pageParam }: { pageParam: number | null }) =>
      queryArticles({
        query,
        page: pageParam ?? 1,
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime(),
        agencies: selectedAgencies.length > 0 ? selectedAgencies : undefined,
        themes: selectedThemes.length > 0 ? selectedThemes : undefined,
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

  const getAgencyName = useMemo(
    () => (key: string) => {
      const agency = agencies.find((a) => a.key === key)
      return agency?.name || key
    },
    [agencies],
  )

  const getThemeName = useMemo(
    () => (key: string) => {
      const theme = themes.find((t) => t.key === key)
      return theme?.name || key
    },
    [themes],
  )

  const getThemeHierarchyPath = useMemo(
    () => (key: string) => {
      const theme = themes.find((t) => t.key === key)
      return theme?.hierarchyPath || theme?.name || key
    },
    [themes],
  )

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

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <ArticleFilters
            agencies={agencies}
            themes={themes}
            startDate={startDate}
            endDate={endDate}
            selectedAgencies={selectedAgencies}
            selectedThemes={selectedThemes}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onAgenciesChange={handleAgenciesChange}
            onThemesChange={handleThemesChange}
            getAgencyName={getAgencyName}
            getThemeName={getThemeName}
            getThemeHierarchyPath={getThemeHierarchyPath}
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
                  theme={article.theme_1_level_3_label || ''}
                  date={article.published_at}
                  ref={index === articles.length - 1 ? ref : undefined}
                  summary={getExcerpt(article.content || '', 150)}
                  title={article.title || ''}
                  imageUrl={article.image || ''}
                />
              ))}
            </motion.div>
          </main>
        </div>
      </div>
    </section>
  )
}
