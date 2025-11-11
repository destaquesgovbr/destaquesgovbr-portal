'use server'

import { typesense } from '@/lib/typesense-client'
import { withResult } from '@/lib/result'
import { differenceInHours, getUnixTime, Interval } from 'date-fns'
import { ArticleRow } from '@/lib/article-row'
import { getAgenciesByName } from '@/lib/agencies-utils'

const BASE_FILTER = (r: Interval) => {
  const { start, end } = r
  const startSeconds = new Date(start).getTime() / 1000
  const endSeconds = new Date(end).getTime() / 1000

  return `published_at:>=${startSeconds} && published_at:<${endSeconds} && image:!=null && image:!=""`
}

export const getKpis = withResult(async (range: Interval) => {
  // total
  const totalRes = await typesense.collections<ArticleRow>('news').documents().search({
    q: '*',
    filter_by: BASE_FILTER(range),
    per_page: 1
  })

  // temas ativos
  const temasRes = await typesense.collections<ArticleRow>('news').documents().search({
    q: '*',
    filter_by: BASE_FILTER(range),
    group_by: 'theme_1_level_1_label',
    per_page: 250
  })
  const temasAtivos = (temasRes.grouped_hits ?? []).filter(g => g.group_key?.[0]).length

  // órgãos ativos
  const orgaosRes = await typesense.collections<ArticleRow>('news').documents().search({
    q: '*',
    filter_by: BASE_FILTER(range),
    group_by: 'agency',
    per_page: 250
  })
  const orgaosAtivos = (orgaosRes.grouped_hits ?? []).filter(g => g.group_key?.[0]).length

  // média diária (aprox.)
  const days = Math.max(1, differenceInHours(range.end, range.start) / 24)
  const mediaDiaria = Math.round((totalRes.found ?? 0) / days)

  return {
    total: totalRes.found ?? 0,
    temasAtivos,
    orgaosAtivos,
    mediaDiaria
  }
})

export const getTopThemes = withResult(async (range: Interval, limit: number = 8) => {
  const res = await typesense.collections<ArticleRow>('news').documents().search({
    q: '*',
    filter_by: BASE_FILTER(range),
    group_by: 'theme_1_level_1_label',
    group_limit: 1,
    per_page: 100 // suficiente para ranking
  })

  const rows =
    (res.grouped_hits ?? [])
      .map(g => ({ theme: g.group_key?.[0] ?? '—', count: g.found ?? 0 }))
      .filter(r => r.theme && r.theme !== 'undefined' && r.theme !== '')
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

  return rows
})

export const getTopAgencies = withResult(async (range: Interval, limit: number = 8) => {
  const res = await typesense.collections<ArticleRow>('news').documents().search({
    q: '*',
    filter_by: BASE_FILTER(range),
    group_by: 'agency',
    group_limit: 1,
    per_page: 100
  })

  const agenciesMap = await getAgenciesByName()

  const rows =
    (res.grouped_hits ?? [])
      .map(g => ({
        agency: g.group_key[0] ?? '—',
        count: g.found ?? 0,
        agencyName: agenciesMap[g.group_key[0]]?.name ?? '-'
      }))
      .filter(r => r.agency && r.agency !== 'undefined')
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

  return rows
})

export const getTimelineDaily = withResult(async (range: Interval) => {
  // Fase de teste: varremos 30 buckets (1 consulta por dia).
  // Em produção, ideal indexar um campo "published_day" (YYYY-MM-DD) para facet.
  const buckets: { date: string; count: number }[] = []
  const daySec = 86400
  for (let t = getUnixTime(range.start); t < getUnixTime(range.end); t += daySec) {
    const dayStart = t
    const dayEnd = Math.min(t + daySec, getUnixTime(range.end))
    const res = await typesense.collections<ArticleRow>('news').documents().search({
      q: '*',
      filter_by: `published_at:>=${dayStart} && published_at:<${dayEnd} && image:!=null && image:!=""`,
      per_page: 1
    })
    const date = new Date(dayStart * 1000).toISOString().slice(0, 10)
    buckets.push({ date, count: res.found ?? 0 })
  }
  return buckets
})

// Comparison: get theme growth (current vs previous period)
export const getThemeComparison = withResult(async (current: Interval, previous: Interval) => {
  const [currentThemes, previousThemes] = await Promise.all([
    getTopThemes(current, 20),
    getTopThemes(previous, 20)
  ])

  if (currentThemes.type !== 'ok' || previousThemes.type !== 'ok') {
    return { growing: [], declining: [] }
  }

  const prevMap = new Map(previousThemes.data.map(t => [t.theme, t.count]))

  const withGrowth = currentThemes.data.map(curr => {
    const prevCount = prevMap.get(curr.theme) ?? 0
    const growth = prevCount > 0 ? ((curr.count - prevCount) / prevCount) * 100 : 100
    return { ...curr, growth, prevCount }
  })

  const growing = withGrowth
    .filter(t => t.growth > 0 && t.prevCount > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5)

  const declining = withGrowth
    .filter(t => t.growth < 0)
    .sort((a, b) => a.growth - b.growth)
    .slice(0, 5)

  return { growing, declining }
})

// Comparison: get agency growth (current vs previous period)
export const getAgencyComparison = withResult(async (current: Interval, previous: Interval) => {
  const [currentAgencies, previousAgencies] = await Promise.all([
    getTopAgencies(current, 20),
    getTopAgencies(previous, 20)
  ])

  if (currentAgencies.type !== 'ok' || previousAgencies.type !== 'ok') {
    return { growing: [], declining: [] }
  }

  const prevMap = new Map(previousAgencies.data.map(a => [a.agency, a.count]))

  const withGrowth = currentAgencies.data.map(curr => {
    const prevCount = prevMap.get(curr.agency) ?? 0
    const growth = prevCount > 0 ? ((curr.count - prevCount) / prevCount) * 100 : 100
    return { ...curr, growth, prevCount }
  })

  const growing = withGrowth
    .filter(a => a.growth > 0 && a.prevCount > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5)

  const declining = withGrowth
    .filter(a => a.growth < 0)
    .sort((a, b) => a.growth - b.growth)
    .slice(0, 5)

  return { growing, declining }
})
