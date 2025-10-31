import { addDays, startOfDay, subDays } from 'date-fns'
import { getKpis, getTopThemes, getTopAgencies, getTimelineDaily } from './actions'
import DashboardClient from '@/components/DashboardClient'


export const dynamic = 'force-dynamic' // sem cache agressivo para testes

export default async function DashboardPage() {
  const end = startOfDay(new Date())
  const start = startOfDay(subDays(end, 29)) // 30 dias (inclui hoje)
  const range = { start: start, end: addDays(end, 1) }

  const [kpisR, themesR, agenciesR, timelineR] = await Promise.all([
    getKpis(range),
    getTopThemes(range, 8),
    getTopAgencies(range, 8),
    getTimelineDaily(range)
  ])

  // Normaliza resultados (com fallback seguro)
  const kpis = kpisR.type === 'ok' ? kpisR.data : { total: 0, temasAtivos: 0, orgaosAtivos: 0, mediaDiaria: 0 }
  const themes = themesR.type === 'ok' ? themesR.data : []
  const agencies = agenciesR.type === 'ok' ? agenciesR.data : []
  const timeline = timelineR.type === 'ok' ? timelineR.data : []

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Cabeçalho institucional */}
        <div className="container mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Dashboard editorial</h2>

          {/* Linha divisória SVG */}
          <div className="mx-auto mt-3 w-40">
            <img src="/underscore.svg" alt="" />
          </div>

          {/* Subtítulo institucional */}
          <p className="mt-4 text-base text-primary/80">
            Análise em tempo real da produção de notícias do Governo Federal (últimos 30 dias).
          </p>
        </div>

        <DashboardClient
          kpis={kpis}
          themes={themes}
          agencies={agencies}
          timeline={timeline}
        />
      </div>
    </section>
  )
}
