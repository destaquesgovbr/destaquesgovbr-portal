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

type DashboardClientProps = {
  kpis: { total: number; temasAtivos: number; orgaosAtivos: number; mediaDiaria: number }
  themes: { theme: string; count: number }[]
  agencies: { agency: string; count: number }[]
  timeline: { date: string; count: number }[]
}

export default function DashboardClient(props: DashboardClientProps) {
  const { kpis, themes, agencies, timeline} = props

  return (
    <div className="space-y-10">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Total de notícias" value={kpis.total.toLocaleString('pt-BR')} />
        <KpiCard title="Temas ativos" value={kpis.temasAtivos.toString()} />
        <KpiCard title="Órgãos emissores" value={kpis.orgaosAtivos.toString()} />
        <KpiCard title="Média diária" value={kpis.mediaDiaria.toString()} />
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
                <Tooltip />
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
                  <Tooltip />
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
                  <Tooltip />
                  <Bar dataKey="count" fill="#F9C80E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
