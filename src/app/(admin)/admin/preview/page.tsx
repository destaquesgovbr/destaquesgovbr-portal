'use client'

import { DownloadIcon, PlayIcon, RefreshCwIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ArticleRow } from '@/types/article'
import type { ScoredArticle } from '@/config/prioritization'
import type {
  PrioritizationConfig,
  ThemeFocusMode,
} from '@/config/prioritization-config'
import { formatDateTime } from '@/lib/utils'
import { getThemeCodeToNameMap, previewPrioritization } from './actions'

export default function PreviewPage() {
  // Config state
  const [agencyWeights, setAgencyWeights] = useState<Record<string, number>>({
    mgi: 1.5,
    secom: 1.5,
    pr: 1.5,
    casacivil: 1.5,
    tvbrasil: 0.3,
    agencia_brasil: 0.3,
  })

  const [themeWeights, setThemeWeights] = useState<Record<string, number>>({
    '05': 1.5, // Meio Ambiente
    '04': 1.5, // Segurança Pública
    '01': 1.5, // Economia
    '08': 1.5, // Cultura
  })

  // Theme code to name mapping
  const [themeCodeToName, setThemeCodeToName] = useState<
    Record<string, string>
  >({})

  const [recencyDecayHours, setRecencyDecayHours] = useState<number>(72)
  const [recencyWeight, setRecencyWeight] = useState<number>(0.5)
  const [hasImageBoost, setHasImageBoost] = useState<number>(1.1)
  const [hasSummaryBoost, setHasSummaryBoost] = useState<number>(1.05)
  const [themeFocusMode, setThemeFocusMode] =
    useState<ThemeFocusMode>('weighted')

  // Results state
  const [chronological, setChronological] = useState<ArticleRow[]>([])
  const [prioritized, setPrioritized] = useState<ScoredArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Temporary input states for adding new weights
  const [newAgency, setNewAgency] = useState('')
  const [newAgencyWeight, setNewAgencyWeight] = useState('1.0')
  const [newTheme, setNewTheme] = useState('')
  const [newThemeWeight, setNewThemeWeight] = useState('1.0')

  // Run preview
  const runPreview = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const config: Partial<PrioritizationConfig> = {
        agencyWeights,
        themeWeights,
        recencyDecayHours,
        recencyWeight,
        hasImageBoost,
        hasSummaryBoost,
        themeFocusMode,
        excludedAgencies: [],
        excludedThemes: [],
        maxArticleAgeDays: null,
        manualThemes: [],
      }

      const result = await previewPrioritization(config)

      if (result.type === 'ok') {
        setChronological(result.data.chronological)
        setPrioritized(result.data.prioritized)
      } else {
        setError('Erro ao buscar preview')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [
    agencyWeights,
    themeWeights,
    recencyDecayHours,
    recencyWeight,
    hasImageBoost,
    hasSummaryBoost,
    themeFocusMode,
  ])

  // Add agency weight
  const addAgencyWeight = () => {
    if (newAgency && newAgencyWeight) {
      setAgencyWeights({
        ...agencyWeights,
        [newAgency]: parseFloat(newAgencyWeight),
      })
      setNewAgency('')
      setNewAgencyWeight('1.0')
    }
  }

  // Remove agency weight
  const removeAgencyWeight = (agency: string) => {
    const updated = { ...agencyWeights }
    delete updated[agency]
    setAgencyWeights(updated)
  }

  // Add theme weight
  const addThemeWeight = () => {
    if (newTheme && newThemeWeight) {
      setThemeWeights({
        ...themeWeights,
        [newTheme]: parseFloat(newThemeWeight),
      })
      setNewTheme('')
      setNewThemeWeight('1.0')
    }
  }

  // Remove theme weight
  const removeThemeWeight = (theme: string) => {
    const updated = { ...themeWeights }
    delete updated[theme]
    setThemeWeights(updated)
  }

  // Export config as YAML
  const exportYAML = () => {
    const yaml = `# Configuração de Priorização de Notícias

agencyWeights:
${Object.entries(agencyWeights)
  .map(([k, v]) => `  ${k}: ${v}`)
  .join('\n')}

themeWeights:
${Object.entries(themeWeights)
  .map(([k, v]) => `  "${k}": ${v}`)
  .join('\n')}

recencyDecayHours: ${recencyDecayHours}
recencyWeight: ${recencyWeight}
hasImageBoost: ${hasImageBoost}
hasSummaryBoost: ${hasSummaryBoost}
themeFocusMode: "${themeFocusMode}"

maxArticleAgeDays: null
excludedAgencies: []
excludedThemes: []
manualThemes: []
`

    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prioritization.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Load theme code to name mapping on mount
  useEffect(() => {
    const loadThemeMapping = async () => {
      const result = await getThemeCodeToNameMap()
      if (result.type === 'ok') {
        setThemeCodeToName(result.data)
      }
    }
    loadThemeMapping()
  }, [])

  // Auto-run on mount
  useEffect(() => {
    runPreview()
  }, [runPreview])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Preview de Priorização</h1>
        <p className="text-muted-foreground">
          Configure pesos e visualize como as notícias serão ordenadas na home
          page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
              <CardDescription>Ajuste os pesos de priorização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="agencies">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="agencies">Órgãos</TabsTrigger>
                  <TabsTrigger value="themes">Temas</TabsTrigger>
                </TabsList>

                <TabsContent value="agencies" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    {Object.entries(agencyWeights).map(([agency, weight]) => (
                      <div key={agency} className="flex items-center gap-2">
                        <Input
                          value={agency}
                          disabled
                          className="flex-1 text-sm font-mono"
                        />
                        <Input
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={(e) =>
                            setAgencyWeights({
                              ...agencyWeights,
                              [agency]: parseFloat(e.target.value),
                            })
                          }
                          className="w-20"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAgencyWeight(agency)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Adicionar órgão</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="slug"
                        value={newAgency}
                        onChange={(e) => setNewAgency(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="1.0"
                        value={newAgencyWeight}
                        onChange={(e) => setNewAgencyWeight(e.target.value)}
                        className="w-20"
                      />
                      <Button size="sm" onClick={addAgencyWeight}>
                        +
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="themes" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    {Object.entries(themeWeights).map(([theme, weight]) => (
                      <div key={theme} className="flex items-center gap-2">
                        <Input
                          value={`${theme} - ${themeCodeToName[theme] || theme}`}
                          disabled
                          className="flex-1 text-sm"
                        />
                        <Input
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={(e) =>
                            setThemeWeights({
                              ...themeWeights,
                              [theme]: parseFloat(e.target.value),
                            })
                          }
                          className="w-16"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeThemeWeight(theme)}
                          className="shrink-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Adicionar tema</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="código"
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="1.0"
                        value={newThemeWeight}
                        onChange={(e) => setNewThemeWeight(e.target.value)}
                        className="w-20"
                      />
                      <Button size="sm" onClick={addThemeWeight}>
                        +
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>Recency Decay (horas)</Label>
                  <Input
                    type="number"
                    value={recencyDecayHours}
                    onChange={(e) =>
                      setRecencyDecayHours(parseFloat(e.target.value))
                    }
                  />
                </div>

                <div>
                  <Label>Recency Weight (0-1)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={recencyWeight}
                    onChange={(e) =>
                      setRecencyWeight(parseFloat(e.target.value))
                    }
                  />
                </div>

                <div>
                  <Label>Image Boost</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={hasImageBoost}
                    onChange={(e) =>
                      setHasImageBoost(parseFloat(e.target.value))
                    }
                  />
                </div>

                <div>
                  <Label>Summary Boost</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={hasSummaryBoost}
                    onChange={(e) =>
                      setHasSummaryBoost(parseFloat(e.target.value))
                    }
                  />
                </div>

                <div>
                  <Label>Theme Focus Mode</Label>
                  <Select
                    value={themeFocusMode}
                    onValueChange={(value) =>
                      setThemeFocusMode(value as ThemeFocusMode)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="weighted">Weighted</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={runPreview}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <PlayIcon className="w-4 h-4 mr-2" />
                  )}
                  Preview
                </Button>
                <Button variant="outline" onClick={exportYAML}>
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Results */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="comparison">
            <TabsList>
              <TabsTrigger value="comparison">Comparação</TabsTrigger>
              <TabsTrigger value="prioritized">Priorizado</TabsTrigger>
              <TabsTrigger value="chronological">Cronológico</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cronológico</CardTitle>
                    <CardDescription>
                      Ordenação atual (sem priorização)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ArticleList articles={chronological} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Priorizado</CardTitle>
                    <CardDescription>Com scoring aplicado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScoredArticleList articles={prioritized} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="prioritized" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Artigos Priorizados</CardTitle>
                  <CardDescription>
                    Top 11 artigos com scoring detalhado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoredArticleList articles={prioritized} detailed />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chronological" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ordenação Cronológica</CardTitle>
                  <CardDescription>Baseline (sem priorização)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArticleList articles={chronological} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Component for basic article list
function ArticleList({ articles }: { articles: ArticleRow[] }) {
  if (articles.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhum artigo</div>
  }

  return (
    <div className="space-y-3">
      {articles.map((article, i) => (
        <div
          key={article.unique_id}
          className="border rounded-lg p-3 text-sm hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-2">
            <div className="font-bold text-muted-foreground">{i + 1}.</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium line-clamp-2">{article.title}</div>
              <div className="text-xs text-muted-foreground mt-1 space-x-2">
                <span className="font-mono">{article.agency ?? 'N/A'}</span>
                <span>•</span>
                <span>{article.theme_1_level_1_label ?? 'N/A'}</span>
                {article.published_at && (
                  <>
                    <span>•</span>
                    <span>{formatDateTime(article.published_at)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Component for scored article list
function ScoredArticleList({
  articles,
  detailed,
}: {
  articles: ScoredArticle[]
  detailed?: boolean
}) {
  if (articles.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhum artigo</div>
  }

  return (
    <div className="space-y-3">
      {articles.map((article, i) => (
        <div
          key={article.unique_id}
          className="border rounded-lg p-3 text-sm hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-2">
            <div className="font-bold text-muted-foreground">{i + 1}.</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-medium line-clamp-2 flex-1">
                  {article.title}
                </div>
                <div className="font-mono font-bold text-primary shrink-0">
                  {article._score.toFixed(2)}
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-x-2">
                <span className="font-mono">{article.agency ?? 'N/A'}</span>
                <span>•</span>
                <span>{article.theme_1_level_1_label ?? 'N/A'}</span>
                {article.published_at && (
                  <>
                    <span>•</span>
                    <span>{formatDateTime(article.published_at)}</span>
                  </>
                )}
              </div>

              {detailed && article._scoreBreakdown && (
                <div className="mt-2 text-xs font-mono bg-muted/50 p-2 rounded space-y-0.5">
                  <div>
                    Agency: {article._scoreBreakdown.agencyWeight.toFixed(2)}
                  </div>
                  <div>
                    Theme: {article._scoreBreakdown.themeWeight.toFixed(2)}
                  </div>
                  <div>
                    Recency: {article._scoreBreakdown.recencyFactor.toFixed(3)}
                  </div>
                  <div>
                    Content: {article._scoreBreakdown.contentBoosts.toFixed(2)}
                  </div>
                  <div className="font-bold text-primary mt-1">
                    Score: {article._scoreBreakdown.finalScore.toFixed(3)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
