'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import KpiCard from './KpiCard'
import { ChartTooltip } from './ChartTooltip'
import { addDays } from 'date-fns'

type DashboardClientProps = {
  kpis: { total: number; temasAtivos: number; orgaosAtivos: number; mediaDiaria: number }
  prevKpis: { total: number; temasAtivos: number; orgaosAtivos: number; mediaDiaria: number }
  themes: { theme: string; count: number }[]
  agencies: { agency: string; count: number }[]
  timeline: { date: string; count: number }[]
  themeComparison: {
    growing: { theme: string; count: number; growth: number }[]
    declining: { theme: string; count: number; growth: number }[]
  }
  agencyComparison: {
    growing: { agency: string; agencyName: string; count: number; growth: number }[]
    declining: { agency: string; agencyName: string; count: number; growth: number }[]
  }
}

export default function DashboardClient(props: DashboardClientProps) {
  const { kpis, prevKpis, themes, agencies, timeline, themeComparison, agencyComparison } = props

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, percentage: '—' }
    const change = ((current - previous) / previous) * 100
    const sign = change > 0 ? '+' : ''
    return {
      value: change,
      percentage: `${sign}${change.toFixed(1)}%`
    }
  }

  const trends = {
    total: calculateTrend(kpis.total, prevKpis.total),
    temasAtivos: calculateTrend(kpis.temasAtivos, prevKpis.temasAtivos),
    orgaosAtivos: calculateTrend(kpis.orgaosAtivos, prevKpis.orgaosAtivos),
    mediaDiaria: calculateTrend(kpis.mediaDiaria, prevKpis.mediaDiaria)
  }

  // Temporal patterns
  const peakDay = timeline.reduce((max, day) => day.count > max.count ? day : max, timeline[0] || { date: '', count: 0 })
  const avgDaily = timeline.length > 0 ? timeline.reduce((sum, day) => sum + day.count, 0) / timeline.length : 0
  const stdDev = Math.sqrt(timeline.reduce((sum, day) => sum + Math.pow(day.count - avgDaily, 2), 0) / timeline.length)
  const consistency = stdDev < avgDaily * 0.3 ? 'Alta' : stdDev < avgDaily * 0.6 ? 'Moderada' : 'Baixa'

  // Distribution analysis
  const totalThemeCount = themes.reduce((sum, t) => sum + t.count, 0)
  const top3ThemesPercent = themes.slice(0, 3).reduce((sum, t) => sum + t.count, 0) / totalThemeCount * 100

  return (
    <div className="space-y-10">
      {/* KPIs with trends */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Total de notícias" value={kpis.total.toLocaleString('pt-BR')} trend={trends.total} />
        <KpiCard title="Temas ativos" value={kpis.temasAtivos.toString()} trend={trends.temasAtivos} />
        <KpiCard title="Órgãos emissores" value={kpis.orgaosAtivos.toString()} trend={trends.orgaosAtivos} />
        <KpiCard title="Média diária" value={kpis.mediaDiaria.toString()} trend={trends.mediaDiaria} />
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-start">
            <img
              src="/charts-ribbon.svg"
              alt="decorativo"
              className="w-2 h-12 mr-2 mt-1"
            />
            <div>
              <h3 className="font-semibold text-lg">Ritmo de publicações</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Conheça a cadência diária das notícias divulgadas pelo Governo Federal.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                    content={
                      <ChartTooltip
                        dataKey="date"
                        itemName="publicações"
                        formatLabel={(label) => addDays(new Date(label), 1).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      />
                  }
                  />
                <Line type="monotone" dataKey="count" stroke="#0D4C92" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Temas + Órgãos (lado a lado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start">
              <img
                src="/charts-ribbon.svg"
                alt="decorativo"
                className="w-2 h-12 mr-2 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg">Temas identificados</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Veja quais áreas concentram mais publicações no período analisado.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={themes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="theme" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={<ChartTooltip dataKey="theme" itemName="publicações"/>}
                  />
                  <Bar dataKey="count" fill="#2D9B78" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start">
              <img
                src="/charts-ribbon.svg"
                alt="decorativo"
                className="w-2 h-12 mr-2 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg">Órgãos mais ativos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Identifique quais instituições tiveram maior presença nas publicações recentes.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agencies}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agency" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={<ChartTooltip dataKey="agencyName" itemName="publicações"/>}
                  />
                  <Bar dataKey="count" fill="#F9C80E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temporal Patterns & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Peak Day */}
        <Card>
          <CardHeader>
            <div className="flex items-start">
              <img
                src="/charts-ribbon.svg"
                alt="decorativo"
                className="w-2 h-12 mr-2 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg">Pico de publicações</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Dia com maior volume de notícias no período.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-primary">{new Date(peakDay.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
              <p className="text-4xl font-semibold mt-2">{peakDay.count}</p>
              <p className="text-sm text-muted-foreground mt-1">publicações</p>
            </div>
          </CardContent>
        </Card>

        {/* Consistency */}
        <Card>
          <CardHeader>
            <div className="flex items-start">
              <img
                src="/charts-ribbon.svg"
                alt="decorativo"
                className="w-2 h-12 mr-2 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg">Consistência</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Regularidade do ritmo de publicações.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className={`text-4xl font-bold ${consistency === 'Alta' ? 'text-green-600' : consistency === 'Moderada' ? 'text-yellow-600' : 'text-red-600'}`}>
                {consistency}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">Média: {avgDaily.toFixed(1)} publicações/dia</p>
                <p className="text-sm text-muted-foreground">Desvio padrão: {stdDev.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-start">
              <img
                src="/charts-ribbon.svg"
                alt="decorativo"
                className="w-2 h-12 mr-2 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg">Concentração temática</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Distribuição da cobertura por temas.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-semibold">{top3ThemesPercent.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-2">dos artigos nos top 3 temas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme & Agency Growth Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Growth */}
        <Card>
          <CardHeader>
            <div className="flex items-start">
              <img
                src="/charts-ribbon.svg"
                alt="decorativo"
                className="w-2 h-12 mr-2 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg">Temas em movimento</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Temas com maior crescimento e declínio vs período anterior.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {themeComparison.growing.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <span>📈</span> Em alta
                  </h4>
                  <div className="space-y-2">
                    {themeComparison.growing.map((theme) => (
                      <div key={theme.theme} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm font-medium text-foreground truncate flex-1">{theme.theme}</span>
                        <span className="text-sm font-semibold text-green-600 ml-2">+{theme.growth.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {themeComparison.declining.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <span>📉</span> Em baixa
                  </h4>
                  <div className="space-y-2">
                    {themeComparison.declining.map((theme) => (
                      <div key={theme.theme} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm font-medium text-foreground truncate flex-1">{theme.theme}</span>
                        <span className="text-sm font-semibold text-red-600 ml-2">{theme.growth.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agency Growth */}
        <Card>
          <CardHeader>
            <div className="flex items-start">
              <img
                src="/charts-ribbon.svg"
                alt="decorativo"
                className="w-2 h-12 mr-2 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg">Órgãos em movimento</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Órgãos com maior crescimento e declínio vs período anterior.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {agencyComparison.growing.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <span>📈</span> Em alta
                  </h4>
                  <div className="space-y-2">
                    {agencyComparison.growing.map((agency) => (
                      <div key={agency.agency} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm font-medium text-foreground truncate flex-1">{agency.agencyName}</span>
                        <span className="text-sm font-semibold text-green-600 ml-2">+{agency.growth.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agencyComparison.declining.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <span>📉</span> Em baixa
                  </h4>
                  <div className="space-y-2">
                    {agencyComparison.declining.map((agency) => (
                      <div key={agency.agency} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm font-medium text-foreground truncate flex-1">{agency.agencyName}</span>
                        <span className="text-sm font-semibold text-red-600 ml-2">{agency.growth.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
