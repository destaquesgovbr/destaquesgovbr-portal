'use client'

import NewsCard from '@/components/NewsCard'
import { getArticles } from './actions'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import ReactMarkdown from 'react-markdown'
import THEME_ICONS from '@/lib/themes'
import { useParams } from 'next/navigation'

export default function ThemePage() {
  const params = useParams()
  const themeLabel = decodeURIComponent(params.themeLabel as string)

  function queryFn({ pageParam }: { pageParam: string | null }) {
    return getArticles({ cursor: pageParam ?? undefined, theme_1_level_1: themeLabel })
  }

  const articlesQ = useInfiniteQuery({
    queryKey: ['articles'],
    queryFn,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    initialPageParam: null,
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
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <img
            alt={themeLabel}
            src={THEME_ICONS[themeLabel].image}
            style={{ height: 150, width: 150 }}
          />
          <div className="container">
            <h2 className="text-2xl text-primary font-bold py-4">{themeLabel}</h2>
            <div className="text-primary leading-relaxed space-y-4 flex flex-col">
              <ReactMarkdown>{THEME_ICONS[themeLabel]?.description}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </div>
      </div>
    </section>
  )
}
