import { addDays, startOfDay, subDays, subMonths, subYears, differenceInDays } from 'date-fns'
import { getKpis, getTopThemes, getTopAgencies, getTimelineDaily, getThemeComparison, getAgencyComparison } from './actions'
import DashboardClient from '@/components/DashboardClient'
import { DashboardFilters } from '@/components/DashboardFilters'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic' // sem cache agressivo para testes

type DatePreset = 'week' | 'month' | 'semester' | 'year' | 'custom'

function getDateRangeFromPreset(preset: DatePreset, customStart?: string, customEnd?: string) {
  const end = startOfDay(new Date())
  let start: Date

  switch (preset) {
    case 'week':
      start = startOfDay(subDays(end, 6)) // 7 dias
      break
    case 'semester':
      start = startOfDay(subMonths(end, 6)) // 6 meses
      break
    case 'year':
      start = startOfDay(subYears(end, 1)) // 1 ano
      break
    case 'custom':
      if (customStart && customEnd) {
        start = startOfDay(new Date(customStart))
        return { start, end: addDays(startOfDay(new Date(customEnd)), 1) }
      }
      // Fallback to month if custom dates are invalid
      start = startOfDay(subDays(end, 29))
      break
    case 'month':
    default:
      start = startOfDay(subDays(end, 29)) // 30 dias (inclui hoje)
      break
  }

  return { start, end: addDays(end, 1) }
}

function getPresetLabel(preset: DatePreset): string {
  switch (preset) {
    case 'week':
      return 'últimos 7 dias'
    case 'semester':
      return 'últimos 6 meses'
    case 'year':
      return 'último ano'
    case 'custom':
      return 'período personalizado'
    case 'month':
    default:
      return 'últimos 30 dias'
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { preset?: string; start?: string; end?: string }
}) {
  const preset = (searchParams.preset as DatePreset) || 'month'
  const range = getDateRangeFromPreset(preset, searchParams.start, searchParams.end)
  const presetLabel = getPresetLabel(preset)

  // Calculate previous period for comparison
  const periodDays = differenceInDays(range.end, range.start)
  const previousRange = {
    start: subDays(range.start, periodDays),
    end: range.start
  }

  const [kpisR, themesR, agenciesR, timelineR, prevKpisR, themeCompR, agencyCompR] = await Promise.all([
    getKpis(range),
    getTopThemes(range, 8),
    getTopAgencies(range, 8),
    getTimelineDaily(range),
    getKpis(previousRange),
    getThemeComparison(range, previousRange),
    getAgencyComparison(range, previousRange)
  ])

  // Normaliza resultados (com fallback seguro)
  const kpis = kpisR.type === 'ok' ? kpisR.data : { total: 0, temasAtivos: 0, orgaosAtivos: 0, mediaDiaria: 0 }
  const prevKpis = prevKpisR.type === 'ok' ? prevKpisR.data : { total: 0, temasAtivos: 0, orgaosAtivos: 0, mediaDiaria: 0 }
  const themes = themesR.type === 'ok' ? themesR.data : []
  const agencies = agenciesR.type === 'ok' ? agenciesR.data : []
  const timeline = timelineR.type === 'ok' ? timelineR.data : []
  const themeComparison = themeCompR.type === 'ok' ? themeCompR.data : { growing: [], declining: [] }
  const agencyComparison = agencyCompR.type === 'ok' ? agencyCompR.data : { growing: [], declining: [] }

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
            Análise em tempo real da produção de notícias do Governo Federal ({presetLabel}).
          </p>
        </div>

        {/* Layout with sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <Suspense fallback={<div className="lg:w-80 flex-shrink-0" />}>
            <DashboardFilters />
          </Suspense>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <DashboardClient
              kpis={kpis}
              prevKpis={prevKpis}
              themes={themes}
              agencies={agencies}
              timeline={timeline}
              themeComparison={themeComparison}
              agencyComparison={agencyComparison}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
