'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import NewsCard from '@/components/NewsCard'
import { getArticles } from './actions'

export default function ArticlesPage() {
  const articlesQ = useInfiniteQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    initialPageParam: null,
  })

  const { ref } = useInView({
    onChange: (inView) => {
      console.log('inView', inView)
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Últimas Notícias</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article, index) => (
            <NewsCard
              key={article.id}
              internalUrl={`/articles/${article.id}`}
              category={article.category || ''}
              date={article.published_at || new Date(0)}
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
