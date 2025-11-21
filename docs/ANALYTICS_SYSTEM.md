# Sistema de Analytics e Telemetria

Este documento descreve o sistema de tracking e analytics implementado no portal Destaques Gov.br.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tracking Client-Side](#tracking-client-side)
4. [API de Tracking](#api-de-tracking)
5. [Dashboard de Analytics](#dashboard-de-analytics)
6. [Setup e Configuração](#setup-e-configuração)
7. [FAQ](#faq)

---

## Visão Geral

O sistema captura eventos de **impressão** (quando artigo é visualizado) e **clique** (quando usuário clica), permitindo análise de engajamento e efetividade editorial.

### Benefícios

- 📊 **Métricas de Engajamento**: CTR por órgão, tema e posição
- 🎯 **Decisões Data-Driven**: Identifique conteúdos mais efetivos
- 🔍 **Análise de Posições**: Compare performance de hero vs grid
- 📈 **Tracking Automático**: Sem necessidade de código manual
- 🔒 **Privacy-First**: Sem tracking individual de usuários

---

## Arquitetura

### Componentes

```
┌─────────────────┐
│   Home Page     │
│  (Client-Side)  │
└────────┬────────┘
         │
         │ useImpressionTracking()
         │ useClickTracking()
         │
         ▼
┌─────────────────┐
│  /api/analytics │
│     /track      │
│  (API Route)    │
└────────┬────────┘
         │
         │ POST event
         │
         ▼
┌─────────────────┐
│   Typesense     │
│   Collection:   │
│ analytics_events│
└────────┬────────┘
         │
         │ Query & Aggregate
         │
         ▼
┌─────────────────┐
│  /admin/        │
│   analytics     │
│  (Dashboard)    │
└─────────────────┘
```

### Fluxo de Dados

1. **Usuário acessa home page**
2. **Componentes com tracking** renderizam
3. **Intersection Observer** detecta impressões
4. **Eventos enviados** para `/api/analytics/track`
5. **Salvos no Typesense** na collection `analytics_events`
6. **Dashboard consulta** e agrega métricas

---

## Tracking Client-Side

### Hooks Customizados

#### `useImpressionTracking`

Detecta automaticamente quando um elemento entra no viewport:

```typescript
import { useImpressionTracking } from '@/lib/use-analytics'

const cardRef = useRef<HTMLDivElement>(null)

useImpressionTracking(
  cardRef,
  article,        // ArticleRow
  'hero',         // position
  0,              // position_index
  2.5             // score (opcional)
)
```

**Configuração:**
- Threshold: 50% do elemento visível
- Dispara apenas uma vez por artigo
- Usa Intersection Observer API

#### `useClickTracking`

Registra cliques em artigos:

```typescript
import { useClickTracking } from '@/lib/use-analytics'

const handleClick = useClickTracking(
  article,
  'latest-grid',
  5,
  1.8
)

<div onClick={handleClick}>
  {/* Conteúdo */}
</div>
```

### Componente TrackedNewsCard

Wrapper pronto para uso:

```typescript
import TrackedNewsCard from '@/components/TrackedNewsCard'

<TrackedNewsCard
  article={article}
  position="hero"
  positionIndex={0}
  score={2.5}
  // Props do NewsCard
  theme={article.theme_1_level_3_label || ''}
  date={article.published_at}
  internalUrl={`/artigos/${article.unique_id}`}
  imageUrl={article.image || ''}
  summary={getExcerpt(article.content || '', 250)}
  title={article.title || ''}
/>
```

### Session ID

- Gerado automaticamente no primeiro acesso
- Armazenado em `localStorage`
- Formato: `session-{timestamp}-{random}`
- Permite agregação por sessão

---

## API de Tracking

### Endpoint: POST /api/analytics/track

Registra um evento de analytics.

**Request:**

```bash
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "impression",
    "article_id": "abc123",
    "article_agency": "mgi",
    "article_theme_l1": "Economia e Finanças",
    "article_theme_l2": "01.01",
    "article_theme_l3": "01.01.01",
    "position": "hero",
    "position_index": 0,
    "calculated_score": 2.5,
    "session_id": "session-xyz"
  }'
```

**Response:**

```json
{
  "success": true,
  "event_id": "7f9fefa9-2962-4b3d-ad19-1cd918c77fb7"
}
```

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| event_type | `impression` \| `click` | Tipo de evento |
| article_id | string | ID único do artigo |
| article_agency | string | Slug do órgão |
| article_theme_l1 | string | Tema nível 1 |
| article_theme_l2 | string | Tema nível 2 |
| article_theme_l3 | string | Tema nível 3 |
| position | enum | Posição na home |
| position_index | number | Índice na posição |
| calculated_score | number | Score de priorização |
| session_id | string | ID da sessão |

**Posições válidas:**
- `hero`: Destaque principal
- `featured-side`: Destaques laterais
- `featured-bottom`: Destaques inferiores
- `latest-grid`: Grid de últimas notícias
- `theme-focus`: Temas em foco

### Endpoint: GET /api/analytics/track

Health check do serviço:

```bash
curl http://localhost:3000/api/analytics/track
```

```json
{
  "status": "ok",
  "service": "analytics-tracking",
  "timestamp": "2025-11-14T22:25:17.513Z"
}
```

---

## Dashboard de Analytics

### Acesso

[http://localhost:3000/admin/analytics](http://localhost:3000/admin/analytics)

### Métricas Disponíveis

#### 1. KPIs Principais

- **Total de Impressões**: Quantas vezes artigos foram visualizados
- **Total de Cliques**: Quantos cliques nos artigos
- **CTR Médio**: Taxa de clique geral (%)

#### 2. CTR por Órgão

Top 10 órgãos com:
- Número de impressões
- Número de cliques
- CTR (%)

**Use para:**
- Identificar órgãos com melhor engajamento
- Comparar performance entre ministérios
- Ajustar pesos de priorização

#### 3. CTR por Tema

Top 10 temas com:
- Impressões e cliques
- CTR (%)

**Use para:**
- Descobrir temas mais atrativos
- Ajustar pesos temáticos
- Planejar campanhas

#### 4. CTR por Posição

Performance de cada posição:
- Hero
- Featured (side/bottom)
- Latest grid
- Theme focus

**Use para:**
- Validar efetividade da hierarquia visual
- Otimizar layout da home
- Decidir onde colocar conteúdos prioritários

#### 5. Top Artigos

Top 20 artigos mais clicados com:
- ID do artigo
- Impressões e cliques
- CTR individual

**Use para:**
- Identificar conteúdos de sucesso
- Analisar padrões editoriais
- Replicar estratégias efetivas

### Filtros

- **Últimos 7 dias** (padrão)
- **Últimos 30 dias**
- **Últimos 90 dias**

### Refresh

Botão de atualização manual para carregar dados mais recentes.

---

## Setup e Configuração

### 1. Criar Collection no Typesense

**Desenvolvimento:**

```bash
npx tsx scripts/create-analytics-collection.ts
```

**Produção:**

Execute o script no ambiente de produção ou use a API do Typesense:

```bash
curl -X POST "http://YOUR_TYPESENSE_HOST:8108/collections" \
  -H "X-TYPESENSE-API-KEY: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "name": "analytics_events",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "event_type", "type": "string", "facet": true},
    {"name": "article_id", "type": "string", "facet": true},
    {"name": "article_agency", "type": "string", "facet": true, "optional": true},
    {"name": "article_theme_l1", "type": "string", "facet": true, "optional": true},
    {"name": "article_theme_l2", "type": "string", "facet": true, "optional": true},
    {"name": "article_theme_l3", "type": "string", "facet": true, "optional": true},
    {"name": "position", "type": "string", "facet": true},
    {"name": "position_index", "type": "int32"},
    {"name": "calculated_score", "type": "float"},
    {"name": "timestamp", "type": "int64"},
    {"name": "session_id", "type": "string", "facet": true},
    {"name": "user_agent", "type": "string", "optional": true},
    {"name": "referrer", "type": "string", "optional": true}
  ],
  "default_sorting_field": "timestamp"
}
EOF
```

### 2. Configurar Variáveis de Ambiente

```env
NEXT_PUBLIC_TYPESENSE_HOST=localhost  # ou IP do servidor
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=your_key_here
```

### 3. Integrar Tracking na Home

**Opção A**: Usar `TrackedNewsCard` (recomendado)

Substitua `<NewsCard>` por `<TrackedNewsCard>` e adicione props de tracking.

**Opção B**: Usar hooks diretamente

Implemente `useImpressionTracking` e `useClickTracking` em componentes customizados.

### 4. Testar

```bash
# Acesse a home
open http://localhost:3000

# Veja eventos no console
# Abra o dashboard
open http://localhost:3000/admin/analytics

# Consulte diretamente no Typesense
curl "http://localhost:8108/collections/analytics_events/documents/search?q=*&query_by=article_id" \
  -H "X-TYPESENSE-API-KEY: your_key"
```

---

## FAQ

### Os eventos são enviados em tempo real?

Sim. Impressões são enviadas quando o artigo fica 50% visível. Cliques são enviados imediatamente.

### O tracking afeta a performance?

Não. O tracking é:
- Assíncrono (não bloqueia renderização)
- Silencioso (erros não quebram UX)
- Leve (apenas HTTP POST)

### E se o Typesense estiver offline?

A API retorna sucesso mesmo se o Typesense estiver indisponível, evitando erros na UX. Logs de erro aparecem no servidor.

### Como excluir eventos de teste?

Filtre por `session_id` ou `user_agent` no Typesense:

```bash
# Excluir eventos de curl
filter_by: user_agent:!curl
```

### Os dados são anônimos?

Sim. Não capturamos:
- IPs
- Cookies de terceiros
- Dados pessoais
- Identificação individual

Apenas:
- Session ID (anônimo)
- User agent (navegador)
- Referrer (página anterior)

### Posso exportar os dados?

Sim. Use a API do Typesense:

```bash
curl "http://localhost:8108/collections/analytics_events/documents/export" \
  -H "X-TYPESENSE-API-KEY: your_key" > events.jsonl
```

### Como calcular CTR manualmente?

```
CTR = (Cliques / Impressões) × 100
```

Exemplo:
- 1000 impressões
- 50 cliques
- CTR = (50 / 1000) × 100 = 5%

### Qual é um CTR bom?

Depende da posição:
- **Hero**: 10-20% (muito visível)
- **Featured**: 5-10%
- **Grid**: 2-5%
- **Theme Focus**: 3-8%

### Posso adicionar métricas customizadas?

Sim. Edite:
1. `AnalyticsEvent` type em `analytics-schema.ts`
2. Schema do Typesense
3. Função `trackEvent()` em `use-analytics.ts`
4. Dashboard queries em `admin/analytics/actions.ts`

### Como deletar eventos antigos?

Use a API do Typesense com filtro de data:

```bash
curl -X DELETE \
  "http://localhost:8108/collections/analytics_events/documents?filter_by=timestamp:<TIMESTAMP" \
  -H "X-TYPESENSE-API-KEY: your_key"
```

---

## Próximos Passos

### Melhorias Futuras

- [ ] Gráficos de série temporal (impressões/cliques por dia)
- [ ] Comparação de períodos (semana atual vs anterior)
- [ ] Alertas automáticos (CTR abaixo de threshold)
- [ ] Export de relatórios (CSV, PDF)
- [ ] Segmentação por device (mobile vs desktop)
- [ ] Heatmap de posições
- [ ] A/B testing integrado
- [ ] Correlação score vs CTR

### Integrações

- Google Analytics 4
- Plausible Analytics
- Data warehouses (BigQuery, Redshift)
- BI tools (Metabase, Superset)

---

## Suporte

Para dúvidas ou problemas:

1. Consulte este documento
2. Verifique logs do servidor
3. Teste o endpoint de health check
4. Verifique collection no Typesense
5. Abra issue no repositório

---

**Última atualização**: 14/11/2025
**Versão do sistema**: 1.0.0
