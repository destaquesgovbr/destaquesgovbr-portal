import { notFound } from 'next/navigation'
import { getArticleById } from './actions'
import ClientArticle from '@/components/ClientArticle'

interface Props {
  params: Promise<{ articleId: string }>
}

export default async function ArticlePage({ params }: Props) {
  const { articleId } = await params
  const articleResult = await getArticleById(articleId)

  if (articleResult.type === 'err') {
    if (articleResult.error === 'not_found') notFound()
    if (articleResult.error === 'db_error')
      return <div>Erro no banco de dados.</div>
  }

  if (articleResult.type !== 'ok') {
    return <div>Erro desconhecido ao carregar a notícia.</div>
  }

  const article = articleResult.data
  const articleUrl = new URL(article.url || '', 'https://www.gov.br')
  const baseUrl = articleUrl.hostname.replace('www.', '')
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/artigos/${article.unique_id}`

  return <ClientArticle article={article} baseUrl={baseUrl} pageUrl={pageUrl} />
}
