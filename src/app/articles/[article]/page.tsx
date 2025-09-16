import { ArrowLeft, Calendar, ExternalLink, Share2, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const article = {
  id: "1",
  title:
    "Ministério da Saúde anuncia nova campanha de vacinação contra a gripe",
  summary:
    "Nova campanha nacional de vacinação contra influenza será iniciada na próxima semana em todas as unidades básicas de saúde do país.",
  content: `
      <p>O Ministério da Saúde anunciou hoje o lançamento de uma nova campanha nacional de vacinação contra a gripe, que será iniciada na próxima segunda-feira (20) em todas as unidades básicas de saúde do país.</p>

      <p>A campanha tem como meta vacinar 90% do público-alvo, que inclui crianças de 6 meses a menores de 6 anos, gestantes, puérperas, trabalhadores da saúde, povos indígenas, idosos com 60 anos ou mais, e pessoas com doenças crônicas não transmissíveis e outras condições clínicas especiais.</p>

      <h3>Cronograma de Vacinação</h3>
      <p>A vacinação será realizada em etapas:</p>
      <ul>
        <li><strong>1ª etapa (20 a 31 de março):</strong> Crianças de 6 meses a menores de 6 anos, gestantes e puérperas</li>
        <li><strong>2ª etapa (1º a 30 de abril):</strong> Idosos com 60 anos ou mais</li>
        <li><strong>3ª etapa (1º a 31 de maio):</strong> Trabalhadores da saúde, povos indígenas e pessoas com comorbidades</li>
      </ul>

      <p>O secretário de Vigilância em Saúde do Ministério da Saúde, Dr. João Silva, destacou a importância da vacinação: "A imunização é a forma mais eficaz de prevenir a influenza e suas complicações. É fundamental que toda a população elegível procure as unidades de saúde para se vacinar."</p>

      <p>Este ano, o governo federal investiu R$ 1,2 bilhão na compra de 80 milhões de doses da vacina trivalente, que protege contra três cepas do vírus da influenza que mais circularam no Hemisfério Sul durante o inverno de 2023.</p>

      <h3>Locais de Vacinação</h3>
      <p>A vacina estará disponível em mais de 40.000 postos de saúde distribuídos por todo o território nacional. Os usuários podem consultar os endereços e horários de funcionamento através do site do Ministério da Saúde ou pelo aplicativo ConecteSUS.</p>

      <p>Para receber a vacina, é necessário apresentar documento de identidade com foto e cartão de vacinação. No caso de crianças, é obrigatória a presença de um responsável legal.</p>
    `,
  category: "Saúde",
  date: "15 de março de 2024",
  imageUrl: "/news-health.png",
  source: "Ministério da Saúde",
  sourceUrl: "https://www.gov.br/saude/pt-br",
  author: "Assessoria de Imprensa - Ministério da Saúde",
}

export default function Page() {
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
            {article.date}
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
          {article.summary}
        </p>
      </header>

      {/* Featured image */}
      {article.imageUrl && (
        <div className="mb-8">
          <Image
            src={article.imageUrl}
            alt={article.title}
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
          {article.content}
        </div>
      </article>

      <Separator className="my-8" />

      {/* Article footer */}
      <footer className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <strong>Autor:</strong> {article.author}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Fonte oficial:</span>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {article.source}
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
