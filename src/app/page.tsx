import Link from 'next/link'
import NewsCard from '@/components/NewsCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getThemes, getLatestArticles } from './actions'

export default async function Home() {
  const latestNewsResult = await getLatestArticles()
  const themesResult = await getThemes()

  if (themesResult.type !== 'ok') {
    return <div>Erro ao carregar os temas.</div>
  }
  const themes = themesResult.data

  if (latestNewsResult.type !== 'ok') {
    return <div>Erro ao carregar as notícias.</div>
  }
  const latestNews = latestNewsResult.data
  const lastArticle = latestNews[0]

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured news */}
              <div className="lg:col-span-2">
                <NewsCard
                  theme_1_level_1={lastArticle.theme_1_level_1 || ''}
                  date={lastArticle.published_at}
                  internalUrl={`/articles/${lastArticle.unique_id}`}
                  imageUrl={lastArticle.image || ''}
                  summary={lastArticle.title || ''}
                  title={lastArticle.title || ''}
                  isMain={true}
                />
              </div>

              {/* Themes sidebar */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Temas</h2>
                  <div className="space-y-3">
                    {themes.map((theme) => (
                      <Link
                        key={theme.name}
                        href={`/articles?theme=${encodeURIComponent(theme.name)}`}
                        className="flex items-center justify-between p-3 bg-card rounded-lg hover:shadow-card transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{theme.name}</span>
                        </div>
                        <Badge variant="secondary">{theme.count}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-government rounded-lg text-white">
                  <h3 className="font-semibold mb-2">Transparência Pública</h3>
                  <p className="text-sm mb-4 text-white/90">
                    Acesse dados e informações sobre gastos públicos e ações
                    governamentais.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-foreground hover:bg-white/90"
                  >
                    Acessar Portal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent News */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Últimas Notícias</h2>
              <Link href="/articles">
                <Button variant="outline" className="cursor-pointer">
                  Ver Todas
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {latestNews.slice(1).map((article, index) => (
                <NewsCard
                  key={index}
                  internalUrl={`/articles/${article.unique_id}`}
                  theme_1_level_1={article.theme_1_level_1 || ''}
                  date={article.published_at}
                  summary={article.title || ''}
                  title={article.title || ''}
                  imageUrl={article.image || ''}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-government-gray">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">156</div>
                <div className="text-sm text-muted-foreground">
                  Notícias publicadas este mês
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">27</div>
                <div className="text-sm text-muted-foreground">
                  Ministérios ativos
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-muted-foreground">
                  Taxa de transparência
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <div className="text-sm text-muted-foreground">
                  Atualização contínua
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
