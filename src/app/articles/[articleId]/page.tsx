import { ArrowLeft, Calendar, ExternalLink, Share2, Tag } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getArticleById } from "./get-article"

interface Props {
  params: Promise<{ articleId: number }>
}

export default async function Page({ params }: Props) {
  const { articleId } = await params
  const [article] = await getArticleById(articleId)
  if (!article) {
    notFound()
  }

  const articleUrl = new URL(article.url || "")
  const baseUrl = articleUrl.hostname.replace("www.", "")

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back navigation */}
      <div className="mb-6">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar às notícias
          </Button>
        </Link>
      </div>

      {/* Article header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Badge variant="secondary">
            <Tag className="w-3 h-3 mr-1" />
            {article.category}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1" />
            {article.published_at?.toDateString() ?? ""}
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Compartilhar
          </Button>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-foreground">
          {article.title}
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          {article.title}
        </p>
      </header>

      {/* Featured image */}
      {article.image && (
        <div className="mb-8">
          <img
            src={article.image}
            alt={article.title || ""}
            width={992}
            height={384}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Article content */}
      <article className="prose prose-lg max-w-none mb-8">
        <div
          className="text-foreground leading-relaxed space-y-4"
          // dangerouslySetInnerHTML={{ __html: article.content }}
        >
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </article>

      <Separator className="my-8" />

      {/* Article footer */}
      <footer className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <strong>Autor:</strong> {article.agency}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Fonte oficial:</span>
          <a
            href={article.url || "."}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {baseUrl}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t">
          Esta notícia foi publicada no portal oficial do Governo Federal do
          Brasil. Todas as informações são de responsabilidade do órgão emissor.
        </div>
      </footer>
    </main>
  )
}
