import { Card, CardContent, CardHeader } from '@/components/ui/card'
import THEME_ICONS from '@/lib/themes'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function ThemesPage() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Temas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.keys(THEME_ICONS).map(theme => (
            <Link key={theme} href={`/temas/${theme}`}>
              <Card className="hover:shadow-government transition-all cursor-pointer group h-full">
                <img
                  src={THEME_ICONS[theme].image}
                  alt={theme}
                />
                <CardHeader>
                  <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors text-base">
                    {theme}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground mb-4 text-sm line-clamp-3">
                    <ReactMarkdown>
                      {THEME_ICONS[theme].description}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
