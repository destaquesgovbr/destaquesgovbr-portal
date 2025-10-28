'use client'

import NewsCard from '@/components/NewsCard'
import { getArticles } from './actions'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import ReactMarkdown from 'react-markdown'
import THEME_ICONS from '@/lib/themes'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ThemePage() {
  const params = useParams()
  const themeLabel = decodeURIComponent(params.themeLabel as string)

  function queryFn({ pageParam }: { pageParam: number | null }) {
    return getArticles({
      page: pageParam ?? 1,
      theme_1_level_1: themeLabel
    })
  }

  const articlesQ = useInfiniteQuery({
    queryKey: ['articles', themeLabel],
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

  const themeData = THEME_ICONS[themeLabel]

  return (
    <section className="py-16 overflow-hidden">
      {/* Cabeçalho institucional do tema */}
      <div className="container mx-auto px-4 text-center mb-12">
        <div className="flex flex-col items-center justify-center">
          <img
            alt={themeLabel}
            src={themeData.image}
            className="w-28 h-28 mb-4 object-contain"
          />
          <h2 className="text-3xl font-bold text-primary">{themeLabel}</h2>

          {/* Linha divisória SVG */}
          <div className="mx-auto mt-3 w-40">
            <img src="/underscore.svg" alt="" />
          </div>

          {/* Descrição do tema */}
          {themeData?.description && (
            <div className="mt-6 text-base text-primary/80 leading-relaxed max-w-3xl mx-auto">
              <ReactMarkdown>{themeData.description}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Grid de artigos relacionados */}
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
              theme_1_level_1={article.theme_1_level_1 || ''}
              date={article.published_at}
              ref={index === articles.length - 1 ? ref : undefined}
              summary={article.title || ''}
              title={article.title || ''}
              imageUrl={article.image || ''}
            />
          ))}
        </motion.div>

        {articles.length === 0 && (
          <p className="text-center text-primary/60 mt-12">
            Nenhum artigo encontrado para este tema no momento.
          </p>
        )}
      </div>
    </section>
  )
}
