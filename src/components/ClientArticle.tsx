'use client'

import { ArrowLeft, Calendar, ExternalLink, Share2, Tag, Check } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ArticleRow } from '@/lib/article-row'

export default function ClientArticle({ article, baseUrl, pageUrl }: { article: ArticleRow; baseUrl: string; pageUrl: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title || '',
          url: pageUrl,
        })
      } else {
        await navigator.clipboard.writeText(pageUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err)
    }
  }

  return (
    <main className="py-16 overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Botão de voltar */}
        <div className="mb-8">
          <Link href="/artigos">
            <Button
              variant="ghost"
              className="text-primary/80 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar às notícias
            </Button>
          </Link>
        </div>

        {/* Cabeçalho */}
        <header className="text-center mb-12">
          {/* Metadados */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-4 text-sm text-primary/70">
            {article.theme_1_level_1 && (
              <Badge className="bg-white text-primary/90 font-medium">
                <Tag className="w-3 h-3 mr-1 text-primary/70" />
                {article.theme_1_level_1}
              </Badge>
            )}

            {article.published_at && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-primary/60" />
                {new Date(article.published_at * 1000).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-primary/70 hover:text-primary transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-[#2D9B78]" />
                  Link copiado!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-1" />
                  Compartilhar
                </>
              )}
            </Button>
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight mb-4">
            {article.title}
          </h1>

          {/* Linha divisória SVG */}
          <div className="mx-auto mt-3 w-40">
            <svg xmlns="http://www.w3.org/2000/svg" width="180" height="6" viewBox="0 0 180 6">
              <rect x="0" y="0" width="22" height="6" fill="#0D4C92" />
              <path d="M22 0 L38 6 L54 0 Z" fill="#2D9B78" />
              <rect x="54" y="0" width="28" height="6" fill="#F9C80E" />
              <circle cx="96" cy="3" r="3" fill="#E63946" />
              <path d="M110 0 L122 6 L134 6 L122 0 Z" fill="#0D4C92" />
              <rect x="134" y="0" width="46" height="6" fill="#2D9B78" />
            </svg>
          </div>
        </header>

        {/* Imagem de capa */}
        {article.image && (
          <div className="mb-12">
            <img
              src={article.image}
              alt={article.title || ''}
              width={992}
              height={384}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Corpo do artigo */}
        <article
          className="prose prose-lg mx-auto max-w-3xl text-primary/90 leading-relaxed"
          style={
            article.image
              ? {
                  ['--cover-image' as any]: `url(${article.image})`,
                }
              : undefined
          }
        >
          <style>{`
            .prose img[src="${article.image}"] {
              opacity: 0.2;
              filter: grayscale(1);
              pointer-events: none;
            }
          `}</style>

          <MarkdownRenderer content={article.content ?? ''}/>
        </article>

        {/* Rodapé */}
        <footer className="mt-16 border-t pt-8 text-primary/70 text-sm space-y-4">
          <div>
            <strong>Fonte:</strong> {article.agency}
          </div>

          {article.url && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Fonte oficial:</span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {baseUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <p className="text-xs text-primary/60 pt-4">
            Esta notícia foi publicada no portal oficial do Governo Federal do Brasil.
            Todas as informações são de responsabilidade do órgão emissor.
          </p>
        </footer>
      </div>
    </main>
  )
}
