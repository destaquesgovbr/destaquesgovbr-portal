'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import NewsCard from '@/components/NewsCard'
import { queryArticles } from './actions'
import { useEffect, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { getExcerpt } from '@/lib/utils'
import { AgencyMultiSelect } from '@/components/AgencyMultiSelect'
import type { AgencyOption } from '@/lib/get-agencies-list'

type QueryPageClientProps = {
  agencies: AgencyOption[]
}

type DateFilterProps = {
  label: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
}

function DateFilter({ label, value, onChange }: DateFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-primary">{label}</label>
      <div className="relative">
        <Input
          type="date"
          onChange={(e) => onChange(new Date(e.target.value))}
          className={value ? 'pr-9' : undefined}
          value={value ? value.toISOString().split('T')[0] : ''}
        />
        {value && (
          <X
            onClick={() => onChange(undefined)}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground rounded-full p-2 hover:bg-gray-200 hover:cursor-pointer transition-colors"
          />
        )}
      </div>
    </div>
  )
}

export default function QueryPageClient({ agencies }: QueryPageClientProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || undefined

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([])

  const articlesQ = useInfiniteQuery({
    queryKey: ['articles', query, startDate, endDate, selectedAgencies],
    queryFn: ({ pageParam }: { pageParam: number | null }) =>
      queryArticles({
        query,
        page: pageParam ?? 1,
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime(),
        agencies: selectedAgencies.length > 0 ? selectedAgencies : undefined,
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

  useEffect(() => {
    articlesQ.refetch()
  }, [query, startDate, endDate, selectedAgencies, articlesQ])

  const articles = articlesQ.data?.pages.flatMap((page) => page.articles) ?? []

  const getAgencyName = useMemo(
    () => (key: string) => {
      const agency = agencies.find((a) => a.key === key)
      return agency?.name || key
    },
    [agencies]
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
          <aside className="lg:w-80 flex-shrink-0 lg:border-r lg:border-border lg:pr-8">
            <div className="sticky top-4">
              <h3 className="text-lg font-semibold text-primary mb-6">Filtros</h3>

              <div className="space-y-6">
                <DateFilter
                  label="Início da publicação"
                  value={startDate}
                  onChange={setStartDate}
                />

                <DateFilter
                  label="Fim da publicação"
                  value={endDate}
                  onChange={setEndDate}
                />

                {/* Agency Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-primary">
                    Agências
                  </label>
                  <AgencyMultiSelect
                    agencies={agencies}
                    selectedAgencies={selectedAgencies}
                    onSelectedAgenciesChange={setSelectedAgencies}
                    showBadges={false}
                  />
                </div>

                {/* Selected Agencies List */}
                {selectedAgencies.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-primary">
                        Agências selecionadas ({selectedAgencies.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedAgencies([])}
                        className="text-xs text-muted-foreground hover:text-primary underline"
                      >
                        Limpar todas
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedAgencies.map((key) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-md text-sm hover:bg-primary/10 transition-colors group"
                        >
                          <span className="truncate text-primary/90 flex-1 min-w-0">
                            {getAgencyName(key)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedAgencies(selectedAgencies.filter((k) => k !== key))}
                            className="text-primary/50 hover:text-primary p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            aria-label={`Remover ${getAgencyName(key)}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

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
          </main>
        </div>
      </div>
    </section>
  )
}
