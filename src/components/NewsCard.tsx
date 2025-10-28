import { Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import type { Ref } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export interface NewsCardProps {
  title: string
  summary?: string
  theme_1_level_1: string
  internalUrl: string
  date?: number | null
  imageUrl?: string
  isMain?: boolean
  ref?: Ref<HTMLAnchorElement>
}

const NewsCard = ({
  title,
  summary,
  theme_1_level_1,
  internalUrl,
  date,
  imageUrl,
  ref,
  isMain = false,
}: NewsCardProps) => {
  const hasTheme = Boolean(theme_1_level_1 && theme_1_level_1.trim() !== '')

  return (
    <Link href={internalUrl} className="h-full" ref={ref}>
      <Card
        className={`transition-all overflow-hidden duration-300 h-full cursor-pointer group
        hover:shadow-lg hover:shadow-[#0D4C92]/10 hover:scale-[1.01] bg-white/90
        ${isMain ? 'col-span-2 row-span-2' : ''}`}
      >
        {/* Imagem de capa */}
        {imageUrl && (
          <div
            className={`relative overflow-hidden ${isMain ? 'h-64' : 'h-40'}`}
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Overlay sutil */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/10 via-transparent to-transparent" />

            {/* Badge de tema (somente se existir) */}
            {hasTheme && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-white text-primary font-medium shadow-sm">
                  <Tag className="w-3 h-3 mr-1 text-primary/70" />
                  {theme_1_level_1}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Cabeçalho */}
        <CardHeader className={isMain ? 'p-6' : 'p-4'}>
          {/* Badge caso não haja imagem */}
          {!imageUrl && hasTheme && (
            <Badge className="mb-2 bg-[#F5E6D3] text-primary/90 font-medium">
              <Tag className="w-3 h-3 mr-1 text-primary/70" />
              {theme_1_level_1}
            </Badge>
          )}

          {/* Título */}
          <h3
            className={`font-semibold text-primary leading-snug group-hover:text-[#2D9B78] transition-colors line-clamp-2
            ${isMain ? 'text-lg' : 'text-base'}`}
          >
            {title}
          </h3>
        </CardHeader>

        {/* Conteúdo */}
        <CardContent className={isMain ? 'px-6 pb-6' : 'px-4 pb-4'}>
          {summary && (
            <p
              className={`text-muted-foreground mb-4 line-clamp-3 ${
                isMain ? 'text-base' : 'text-sm'
              }`}
            >
              {summary}
            </p>
          )}

          {date && (
            <div className="flex items-center text-xs text-primary/70">
              <Calendar className="w-3 h-3 mr-1 text-primary/60" />
              <span>
                {new Date(date * 1000).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default NewsCard
