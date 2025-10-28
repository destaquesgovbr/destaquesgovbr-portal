import Link from 'next/link'
import NewsCard from '@/components/NewsCard'
import { Button } from '@/components/ui/button'
import {
  getLatestArticles,
  getThemes,
  countMonthlyNews,
  getLatestByTheme,
} from './actions'
import { ArrowRight } from 'lucide-react'
import THEME_ICONS from '@/lib/themes'

export default async function Home() {
  // ===== Fetch principal =====
  const [latestNewsResult, themesResult, newsThisMonth] = await Promise.all([
    getLatestArticles(),
    getThemes(),
    countMonthlyNews(),
  ])

  if (themesResult.type !== 'ok') return <div>Erro ao carregar os temas.</div>
  if (latestNewsResult.type !== 'ok') return <div>Erro ao carregar as notícias.</div>

  const themes = themesResult.data
  const latestNews = latestNewsResult.data

  // ===== Hero: 1 manchete + 2 secundárias =====
  const [featuredMain, ...rest] = latestNews
  const featuredSide = rest.slice(0, 2)
  const featuredBottom = rest.slice(2, 4)

  // ===== Últimas notícias (prévia) =====
  const latestPreview = rest.slice(4, 10) // 6 cards em média

  // ===== Temas em foco (3 temas × 2 notícias cada) =====
  const focusThemes = themes.slice(0, 3)
  const themesWithNews = await Promise.all(
    focusThemes.map(async (t: { name: string }) => {
      const r = await getLatestByTheme(t.name, 2)
      return {
        theme: t.name,
        articles: r.type === 'ok' ? r.data ?? [] : [],
      }
    })
  )

  return (
    <main className="min-h-screen bg-background">
      {/* 1️⃣ HERO — destaque principal (1 grande + 2 sem imagem + 2 laterais) */}
      <section className="py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manchete principal */}
          <div className="md:col-span-2 grid grid-cols-1 gap-6">
            <NewsCard
              key={featuredMain.unique_id}
              theme_1_level_1={featuredMain.theme_1_level_1 || ''}
              date={featuredMain.published_at}
              internalUrl={`/artigos/${featuredMain.unique_id}`}
              imageUrl={featuredMain.image || ''}
              summary={featuredMain.content || ''}
              title={featuredMain.title || ''}
              isMain
            />
            {/* Duas notícias secundárias sem imagem */}
            <div className="flex gap-6">
              {featuredBottom.map(article =>
                <NewsCard
                  key={article.unique_id}
                  theme_1_level_1={article.theme_1_level_1 || ''}
                  date={article.published_at}
                  internalUrl={`/artigos/${article.unique_id}`}
                  imageUrl=''
                  summary={article.content || ''}
                  title={article.title || ''}
                />
              )}
            </div>
          </div>

          {/* Duas notícias secundárias */}
          <aside className="grid grid-cols-1 gap-6">
            {featuredSide.map(
              (article) =>
                article && (
                  <NewsCard
                    key={article.unique_id}
                    theme_1_level_1={article.theme_1_level_1 || ''}
                    date={article.published_at}
                    internalUrl={`/artigos/${article.unique_id}`}
                    imageUrl={article.image || ''}
                    summary={article.content || ''}
                    title={article.title || ''}
                  />
                )
            )}
          </aside>
        </div>
      </section>

      {/* 2️⃣ ÚLTIMAS NOTÍCIAS — grade */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPreview.map((article) => (
              <NewsCard
                key={article.unique_id}
                internalUrl={`/artigos/${article.unique_id}`}
                theme_1_level_1={article.theme_1_level_1 || ''}
                date={article.published_at}
                summary={article.content || ''}
                title={article.title || ''}
                imageUrl={article.image || ''}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3️⃣ TEMAS EM FOCO — 3 blocos com 2 notícias cada */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Temas em foco</h2>
            <p className="text-sm text-muted-foreground">
              Os principais eixos de atuação e debate público, com notícias recentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themesWithNews.map(({ theme, articles }) => (
              <div key={theme} className="rounded-lg border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={THEME_ICONS[theme]?.image}
                    alt={theme}
                    className="h-10 w-10 object-contain"
                  />
                  <Link href={`/temas/${theme}`} className="hover:underline">
                    <h3 className="font-semibold">{theme}</h3>
                  </Link>
                </div>

                <ul className="space-y-3">
                  {articles.map((a: any) => (
                    <li key={a.unique_id} className="text-sm">
                      <Link
                        href={`/artigos/${a.unique_id}`}
                        className="text-primary hover:underline"
                      >
                        {a.title}
                      </Link>
                      {a.published_at && (
                        <span className="ml-2 text-muted-foreground">
                          · {new Date(a.published_at * 1000).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </li>
                  ))}
                  {articles.length === 0 && (
                    <li className="text-sm text-muted-foreground">Sem notícias recentes.</li>
                  )}
                </ul>

                <div>
                  <Link href={`/temas/${theme}`}>
                    <Button variant="ghost" size="sm" className="cursor-pointer">
                      Ver mais
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4️⃣ TRANSPARÊNCIA / DADOS PÚBLICOS — 3 cards verticais com SVG de fundo */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Transparência e dados públicos</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe informações oficiais, dados abertos e canais de controle social.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <a
              href="https://portaldatransparencia.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border bg-card overflow-hidden block transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#0D4C92]/20 transparency-banner-1"
            >
              <div className="m-8 bg-white/80 p-3 transition-all rounded-xl group-hover:bg-white/90 duration-300 group-hover:-translate-y-[2px] group-hover:shadow-sm">
                <h3 className="font-semibold text-lg transition-colors duration-300 group-hover:text-primary">
                  Portal da Transparência
                </h3>
                <p className="text-sm mt-1 text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                  Consulte gastos públicos e execução orçamentária.
                </p>
              </div>
            </a>

            {/* Card 2 */}
            <a
              href="https://dados.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border bg-card overflow-hidden block transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#0D4C92]/20 transparency-banner-2"
            >
              <div className="m-8 bg-white/80 p-3 transition-all rounded-xl group-hover:bg-white/90 duration-300 group-hover:-translate-y-[2px] group-hover:shadow-sm">
                <h3 className="font-semibold text-lg transition-colors duration-300 group-hover:text-primary">
                  Dados Abertos
                </h3>
                <p className="text-sm mt-1 text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                  Catálogo de bases e APIs públicas do governo federal.
                </p>
              </div>
            </a>

            {/* Card 3 */}
            <a
              href="https://www.gov.br/ouvidorias"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border bg-card overflow-hidden block transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#0D4C92]/20 transparency-banner-3"
            >
              <div className="m-8 bg-white/80 p-3 transition-all rounded-xl group-hover:bg-white/90 duration-300 group-hover:-translate-y-[2px] group-hover:shadow-sm">
                <h3 className="font-semibold text-lg transition-colors duration-300 group-hover:text-primary">
                  Ouvidoria
                </h3>
                <p className="text-sm mt-1 text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                  Registre manifestações e acompanhe o retorno dos órgãos.
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 5️⃣ ESTATÍSTICAS RÁPIDAS */}
      <section className="py-10 bg-government-gray">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-government-red mb-1">
              {new Intl.NumberFormat('pt-BR').format(newsThisMonth.data ?? 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              Notícias publicadas este mês
            </div>
          </div>
          <div className="border-l md:border-l md:pl-8">
            <div className="text-3xl font-bold text-government-green mb-1">31</div>
            <div className="text-sm text-muted-foreground">Ministérios ativos</div>
          </div>
          <div className="border-l md:border-l md:pl-8">
            <div className="text-3xl font-bold text-government-blue mb-1">24h</div>
            <div className="text-sm text-muted-foreground">Atualização contínua</div>
          </div>
        </div>
      </section>
    </main>
  )
}
