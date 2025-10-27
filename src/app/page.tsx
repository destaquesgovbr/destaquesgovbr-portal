import Link from 'next/link'
import NewsCard from '@/components/NewsCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getThemes, getLatestArticles, countMonthlyNews } from './actions'
import { ArrowRight } from 'lucide-react'

export default async function Home() {
  const latestNewsResult = await getLatestArticles()
  const themesResult = await getThemes()
  const newsThisMonth = await countMonthlyNews()

  if (themesResult.type !== 'ok') {
    return <div>Erro ao carregar os temas.</div>
  }
  const themes = themesResult.data

  if (latestNewsResult.type !== 'ok') {
    return <div>Erro ao carregar as notícias.</div>
  }
  const latestNews = latestNewsResult.data
  const latestArticles = latestNews.slice(0, 2)

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured news */}
              {latestArticles.map(article => (
                <div key={article.unique_id} className="lg:col-span-1">
                  <NewsCard
                    theme_1_level_1={article.theme_1_level_1 || ''}
                    date={article.published_at}
                    internalUrl={`/artigos/${article.unique_id}`}
                    imageUrl={article.image || ''}
                    summary={article.title || ''}
                    title={article.title || ''}
                    isMain={true}
                    />
                </div>
              ))}

              {/* Themes sidebar */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Temas em alta</h2>
                  <div className="flex flex-col gap-2">
                    {themes.map((theme) => (
                      <Link
                        key={theme.name}
                        href={`/temas/${theme.name}`}
                        className="w-full py-1"
                      >
                        <Button
                          variant="ghost"
                          size="lg"
                          className="flex items-center justify-between p-3 w-full bg-card cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{theme.name}</span>
                          </div>
                          <Badge variant="secondary">{theme.count}</Badge>
                        </Button>
                      </Link>
                    ))}
                    <Link
                      href="/temas"
                      className="w-full py-1"
                    >
                      <Button
                        variant="ghost"
                        size="lg"
                        className="flex items-center justify-between p-3 w-full bg-card cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">Ver todos</span>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-9 transparency-banner rounded-lg text-primary">
                  <h3 className="font-semibold mb-2">Transparência Pública</h3>
                  <p className="text-sm mb-4 text-primary/90">
                    Acesse dados e informações sobre gastos públicos e ações
                    governamentais.
                  </p>
                  <a href="https://portaldatransparencia.gov.br/" target="_blank">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white text-foreground hover:bg-white/90 hover:cursor-pointer"
                      >
                      Acessar portal
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent News */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Últimas notícias</h2>
              <Link href="/artigos">
                <Button variant="outline" className="cursor-pointer">
                  Ver todas
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {latestNews.slice(2).map((article, index) => (
                <NewsCard
                  key={index}
                  internalUrl={`/artigos/${article.unique_id}`}
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
          <div
            className="container mx-auto px-4 flex"
            style={{ justifyContent: "space-around" }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-government-red mb-2">
                {new Intl.NumberFormat('pt-BR').format(newsThisMonth.data ?? 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Notícias publicadas este mês
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-government-green mb-2">31</div>
              <div className="text-sm text-muted-foreground">
                Ministérios ativos
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-government-blue mb-2">24h</div>
              <div className="text-sm text-muted-foreground">
                Atualização contínua
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
