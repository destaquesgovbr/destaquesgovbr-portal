# Sistema de Priorização de Notícias

Este documento descreve o sistema de priorização de notícias implementado no portal Destaques Gov.br.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Como Funciona](#como-funciona)
3. [Configuração](#configuração)
4. [Preview Dashboard](#preview-dashboard)
5. [Guia de Uso](#guia-de-uso)
6. [FAQ](#faq)

---

## Visão Geral

O sistema permite configurar pesos para órgãos e temas, controlando quais notícias aparecem na home page e em que ordem. Isso substitui a simples ordenação cronológica por um sistema inteligente de scoring.

### Benefícios

- ✅ **Controle Editorial**: Priorize notícias de órgãos ou temas estratégicos
- ✅ **Flexibilidade**: Ajuste pesos dinamicamente sem modificar código
- ✅ **Preview em Tempo Real**: Veja resultado antes de publicar
- ✅ **Fallback Seguro**: Sistema volta para ordenação cronológica em caso de erro

---

## Como Funciona

### Fórmula de Scoring

```
score = (agencyWeight × themeWeight × recencyFactor) × contentBoosts

Onde:
  agencyWeight   = peso do órgão (padrão: 1.0)
  themeWeight    = maior peso entre os 3 níveis de tema (padrão: 1.0)
  recencyFactor  = 1 / (1 + hoursOld / recencyDecayHours)
  contentBoosts  = hasImageBoost × hasSummaryBoost
```

### Exemplo de Cálculo

**Notícia do MGI sobre Meio Ambiente, publicada há 24h, com imagem:**

```
agencyWeight    = 1.5  (configurado em prioritization.yaml)
themeWeight     = 1.5  (tema "05" = Meio Ambiente)
recencyFactor   = 1 / (1 + 24 / 72) = 0.75
contentBoosts   = 1.1 (tem imagem)

score = (1.5 × 1.5 × 0.75) × 1.1 = 1.86
```

**Notícia da Agência Brasil, tema neutro, publicada há 2h, sem imagem:**

```
agencyWeight    = 0.3  (despriorizado)
themeWeight     = 1.0  (neutro)
recencyFactor   = 1 / (1 + 2 / 72) = 0.97
contentBoosts   = 1.0  (sem imagem)

score = (0.3 × 1.0 × 0.97) × 1.0 = 0.29
```

A primeira notícia terá **6x mais prioridade** que a segunda!

---

## Configuração

### Arquivo: `src/lib/prioritization.yaml`

```yaml
# Pesos por Órgão
agencyWeights:
  mgi: 1.5              # +50% de prioridade
  secom: 1.5
  pr: 1.5
  casacivil: 1.5
  tvbrasil: 0.3         # -70% de prioridade
  agencia_brasil: 0.3

# Pesos por Tema (códigos de 1-3 níveis)
themeWeights:
  "05": 1.5   # Meio Ambiente (nível 1)
  "04": 1.5   # Segurança Pública
  "01": 1.5   # Economia
  "08": 1.5   # Cultura

  # Exemplo nível 2 (sub-tema):
  # "05.01": 2.0   # Preservação Ambiental

  # Exemplo nível 3 (tópico específico):
  # "05.01.01": 2.5   # Áreas Protegidas

# Configuração de Recência
recencyDecayHours: 72   # Notícias perdem relevância ao longo de 3 dias
recencyWeight: 0.5      # Peso da recência (0 = não importa, 1 = máximo)

# Boosts de Qualidade
hasImageBoost: 1.1      # +10% para notícias com imagem
hasSummaryBoost: 1.05   # +5% para notícias com resumo

# Filtros Absolutos (opcional)
maxArticleAgeDays: null        # Limite de idade (null = sem limite)
excludedAgencies: []           # Órgãos completamente excluídos
excludedThemes: []             # Temas completamente excluídos

# Temas em Foco
themeFocusMode: "weighted"     # "volume" | "weighted" | "manual"
manualThemes: []               # Usado se mode = "manual"
```

### Modos de "Temas em Foco"

1. **`volume`**: Seleciona temas com mais artigos (comportamento anterior)
2. **`weighted`**: Seleciona temas cujos artigos têm maior score total (padrão)
3. **`manual`**: Usa lista fixa de 3 temas definida em `manualThemes`

### Cache

- A configuração é cacheada por **5 minutos**
- Alterações no YAML levam até 10 minutos para aparecer na home (ISR)
- Para forçar atualização imediata, reinicie o servidor

---

## Preview Dashboard

Acesse [http://localhost:3000/admin/preview](http://localhost:3000/admin/preview) para:

### Funcionalidades

1. **Editar Pesos em Tempo Real**
   - Adicionar/remover órgãos e temas
   - Ajustar valores de recência e boosts
   - Alterar modo de "Temas em Foco"

2. **Visualizar Preview**
   - Comparação lado-a-lado: cronológico vs priorizado
   - Ver score detalhado de cada artigo
   - Breakdown do cálculo (agency, theme, recency, content)

3. **Exportar Configuração**
   - Baixar YAML pronto para uso
   - Copiar para `src/lib/prioritization.yaml`

### Exemplo de Uso

1. Acesse `/admin/preview`
2. Adicione peso para órgão: `saude` → `2.0`
3. Clique em "Preview"
4. Veja artigos do Ministério da Saúde subindo na lista
5. Clique em "Export" para baixar configuração
6. Copie para `prioritization.yaml` e faça commit

---

## Guia de Uso

### Cenário 1: Campanha de Vacinação

Priorize notícias do Ministério da Saúde sobre o tema Saúde:

```yaml
agencyWeights:
  saude: 2.0      # Dobrar peso do órgão

themeWeights:
  "03": 2.0       # Dobrar peso do tema Saúde

recencyDecayHours: 48  # Manter notícias relevantes por 2 dias
```

### Cenário 2: Semana do Meio Ambiente

```yaml
themeWeights:
  "05": 2.5       # Meio Ambiente
  "05.01": 3.0    # Preservação Ambiental (ainda mais prioritário)

# Excluir outros temas menos relevantes
excludedThemes: ["22"]  # Eventos Oficiais
```

### Cenário 3: Reduzir Ruído de Veículos de Mídia

```yaml
agencyWeights:
  tvbrasil: 0.2
  agencia_brasil: 0.2
  radiomec: 0.3
```

### Cenário 4: Temas Fixos na Home

```yaml
themeFocusMode: "manual"
manualThemes:
  - "Economia e Finanças"
  - "Educação"
  - "Saúde"
```

---

## FAQ

### Como adicionar um novo órgão?

Basta adicionar ao `agencyWeights`:

```yaml
agencyWeights:
  novo_orgao: 1.5
```

### Qual a diferença entre os níveis de tema?

- **Nível 1** (2 dígitos): Categoria ampla (ex: `"05"` = Meio Ambiente)
- **Nível 2** (4 dígitos): Sub-categoria (ex: `"05.01"` = Preservação Ambiental)
- **Nível 3** (6 dígitos): Tópico específico (ex: `"05.01.01"` = Áreas Protegidas)

O sistema usa o **maior peso** encontrado entre os 3 níveis.

### Como despriorizar um órgão?

Use peso < 1.0:

```yaml
agencyWeights:
  orgao_indesejado: 0.1  # 90% menos prioridade
```

### O que acontece se não houver peso configurado?

O sistema usa peso padrão `1.0` (neutro).

### Como remover uma notícia completamente?

Use `excludedAgencies` ou `excludedThemes`:

```yaml
excludedAgencies: ["orgao_bloqueado"]
excludedThemes: ["22"]  # Eventos Oficiais
```

### Posso ter pesos negativos?

Não. Use valores entre `0.1` e `10.0` para melhores resultados.

### O sistema afeta a página de busca?

Não. A busca continua usando ordenação cronológica. O scoring só afeta a **home page**.

### Quanto tempo leva para uma alteração no YAML aparecer?

- **Dev**: Imediato após reiniciar servidor
- **Produção**: Até 10 minutos (ISR = 600 segundos)

### Como reverter para ordenação cronológica?

Defina todos os pesos como `1.0` ou delete o arquivo `prioritization.yaml`.

---

## Arquitetura

### Arquivos Principais

```
src/
├── lib/
│   ├── prioritization.yaml         # Configuração de pesos
│   ├── prioritization-config.ts    # Schema e carregamento
│   └── prioritization.ts           # Lógica de scoring
├── app/
│   ├── actions.ts                  # getLatestArticles() modificado
│   ├── page.tsx                    # Home page (sem alterações)
│   └── admin/
│       └── preview/
│           ├── page.tsx            # Preview dashboard
│           └── actions.ts          # Server actions
└── components/
    └── ui/
        ├── label.tsx
        ├── select.tsx
        └── tabs.tsx
```

### Fluxo de Dados

```
1. Usuário acessa home page
2. getLatestArticles() busca 50 artigos mais recentes
3. loadConfig() carrega prioritization.yaml (cached)
4. getPrioritizedArticles() calcula scores e ordena
5. Top 11 artigos são retornados
6. Home page renderiza (sem mudanças)
```

---

## Próximos Passos

### Melhorias Futuras

- Dashboard de analytics com métricas de CTR por órgão/tema
- A/B testing de configurações
- Recomendação automática de pesos baseada em dados históricos
- UI para editar YAML direto no admin
- Histórico de configurações com rollback
- Alertas quando CTR cai abaixo de threshold

### Sugestões

- Adicionar peso baseado em popularidade (views, shares)
- Considerar diversidade de órgãos na home
- Penalizar artigos duplicados/similares
- Boost temporal para notícias "breaking"

---

## Suporte

Para dúvidas ou problemas:

1. Consulte este documento
2. Teste no Preview Dashboard
3. Verifique logs do servidor
4. Abra issue no repositório

---

**Última atualização**: 14/11/2025
**Versão do sistema**: 1.0.0
