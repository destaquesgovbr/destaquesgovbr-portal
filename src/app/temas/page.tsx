import { getThemesHierarchy } from '@/lib/themes-utils'
import { getThemeArticleCounts } from './actions'
import ThemesPageClient from './ThemesPageClient'
import { ThemeTreeDisplay } from '@/components/ThemeTreeDisplay'

export default async function ThemesPage() {
  // Fetch theme hierarchy and article counts
  const [themeHierarchy, articleCountsMap] = await Promise.all([
    getThemesHierarchy(),
    getThemeArticleCounts(),
  ])

  return (
    <section className="py-16 overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl font-bold text-primary">Temas</h2>
        <div className="mx-auto mt-3 w-40">
          <img src="/underscore.svg" alt="" />
        </div>
        <p className="mt-4 text-base text-primary/80">
          Conheça os temas que estruturam as políticas e ações do Estado brasileiro.
        </p>
      </div>

      <div className="container mx-auto px-4">
        <ThemesPageClient />
      </div>

      {/* Theme Tree Section */}
      <div className="container mx-auto px-4 mt-16">
        <div className="border-t border-gray-200 pt-12">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary mb-2">
              Distribuição de Notícias por Tema
            </h3>
            <p className="text-sm text-muted-foreground">
              Quantidade de artigos publicados nos últimos 30 dias por tema
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <ThemeTreeDisplay
              themeHierarchy={themeHierarchy}
              articleCounts={articleCountsMap}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
