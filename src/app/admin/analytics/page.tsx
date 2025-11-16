'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAnalyticsSummary, getTopArticles } from './actions'
import { RefreshCwIcon } from 'lucide-react'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<number>(7)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [topArticles, setTopArticles] = useState<any[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [summaryResult, articlesResult] = await Promise.all([
        getAnalyticsSummary(period),
        getTopArticles(period),
      ])

      if (summaryResult.type === 'ok') {
        setSummary(summaryResult.data)
      }

      if (articlesResult.type === 'ok') {
        setTopArticles(articlesResult.data)
      }
    } catch (error) {
      console.error('[Analytics] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [period])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCwIcon className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Nenhum dado de analytics disponível
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Métricas de impressões e cliques nas notícias da home page
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={period.toString()}
            onValueChange={(value) => setPeriod(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCwIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Total de Impressões</CardDescription>
            <CardTitle className="text-3xl">{summary.totalImpressions.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total de Cliques</CardDescription>
            <CardTitle className="text-3xl">{summary.totalClicks.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>CTR Médio</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {summary.ctr.toFixed(2)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* CTR por Órgão */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>CTR por Órgão</CardTitle>
          <CardDescription>Top 10 órgãos com mais cliques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.byAgency.map((item: any, i: number) => (
              <div key={item.agency} className="flex items-center">
                <div className="w-8 text-sm text-muted-foreground">{i + 1}.</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate font-mono text-sm">{item.agency}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.impressions} impressões · {item.clicks} cliques
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{item.ctr.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">CTR</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTR por Tema */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>CTR por Tema</CardTitle>
          <CardDescription>Top 10 temas com mais cliques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.byTheme.map((item: any, i: number) => (
              <div key={item.theme} className="flex items-center">
                <div className="w-8 text-sm text-muted-foreground">{i + 1}.</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.theme}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.impressions} impressões · {item.clicks} cliques
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{item.ctr.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">CTR</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTR por Posição */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>CTR por Posição</CardTitle>
          <CardDescription>Performance por posição na home page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.byPosition.map((item: any) => (
              <div key={item.position} className="flex items-center">
                <div className="flex-1 min-w-0">
                  <div className="font-medium capitalize">{item.position.replace(/-/g, ' ')}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.impressions} impressões · {item.clicks} cliques
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{item.ctr.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">CTR</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Artigos */}
      <Card>
        <CardHeader>
          <CardTitle>Top Artigos Mais Clicados</CardTitle>
          <CardDescription>Top 20 artigos com mais cliques no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topArticles.map((item, i) => (
              <div key={item.article_id} className="flex items-center text-sm">
                <div className="w-8 text-muted-foreground">{i + 1}.</div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs truncate">{item.article_id}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.impressions} impressões · {item.clicks} cliques
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{item.ctr.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
