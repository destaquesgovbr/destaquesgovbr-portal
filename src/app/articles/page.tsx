'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import NewsCard from '@/components/NewsCard'
import { getAllArticles } from './actions'

export default function ArticlesPage() {
  const articlesQuery = useInfiniteQuery({
    queryKey: ['articles'],
    queryFn: async () => getAllArticles(),
    getNextPageParam: () => null,
    initialPageParam: null,
  })

  if (articlesQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">
          Ocorreu um erro ao carregar os artigos.
        </p>
      </div>
    )
  }

  const articles =
    articlesQuery.data?.pages.flatMap((page) => page.articles) ?? []

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Últimas Notícias</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              internalUrl={`/articles/${article.id}`}
              category={article.category || ''}
              date={article.published_at || new Date(0)}
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
