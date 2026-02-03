# Portal Destaques Gov.br - Guia para Claude

## Visão Geral do Projeto

Portal de notícias do Governo Federal brasileiro, desenvolvido com Next.js 15, que agrega e exibe conteúdo de diversos ministérios e órgãos governamentais. O projeto utiliza Typesense para busca e indexação de artigos.

**Nome do projeto**: portal
**Tecnologia principal**: Next.js 15.5.3 com App Router
**Deploy**: Standalone mode (configurado para containers)

## Arquitetura e Stack

### Frontend

- **Framework**: Next.js 15.5.3 (App Router)
- **Linguagem**: TypeScript 5
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 4 + tailwindcss-animate
- **Animações**: Framer Motion
- **Gerenciamento de estado**: TanStack React Query (v5)
- **Formulários**: React Hook Form + Zod
- **Markdown**: react-markdown + remark-gfm + rehype-raw
- **Temas**: next-themes
- **Linting/Formatting**: Biome 2.2.0

### Backend/Dados

- **Busca**: Typesense 2.1.0
- **Revalidação**: ISR (Incremental Static Regeneration) a cada 10 minutos

### Ferramentas de Build

- **Package Manager**: pnpm
- **Build Tool**: Next.js Turbopack
- **Container**: Docker (Dockerfile presente)

## Estrutura de Diretórios

```
/portal
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── page.tsx           # Homepage principal
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── globals.css        # Estilos globais
│   │   ├── actions.ts         # Server actions da homepage
│   │   ├── artigos/           # Rota de artigos
│   │   │   ├── page.tsx       # Lista de artigos
│   │   │   ├── actions.ts     # Server actions de artigos
│   │   │   └── [articleId]/   # Página individual do artigo
│   │   │       ├── page.tsx
│   │   │       ├── actions.ts
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx
│   │   ├── busca/             # Página de busca
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── temas/             # Páginas de temas
│   │   │   ├── page.tsx
│   │   │   └── [themeLabel]/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   └── dados-editoriais/  # Dashboard de dados
│   │       ├── page.tsx
│   │       └── actions.ts
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── NewsCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── ClientArticle.tsx
│   │   ├── DashboardClient.tsx
│   │   ├── ChartTooltip.tsx
│   │   ├── KpiCard.tsx
│   │   └── Providers.tsx
│   └── lib/                   # Utilitários e helpers
│       ├── typesense-client.ts
│       ├── themes.ts
│       ├── utils.ts
│       ├── article-row.ts
│       ├── result.ts
│       ├── action-state.ts
│       └── getAgencyName.ts
├── public/                    # Assets estáticos
├── package.json
├── tsconfig.json
├── next.config.ts
├── components.json            # Config do shadcn/ui
├── biome.json                 # Config do Biome
├── Dockerfile
└── README.md
```

## Conceitos-Chave

### 1. Server Actions e Data Fetching

O projeto utiliza extensivamente Server Actions do Next.js 15 para buscar dados:

- **actions.ts**: Cada rota tem seu próprio arquivo de server actions
- **Padrão de Result**: Utiliza um tipo `Result<T>` para tratamento de erros consistente
- **Integração com Typesense**: Cliente configurado em `lib/typesense-client.ts`

Exemplo de uso:

```typescript
// Em app/actions.ts
export async function getLatestArticles() {
  // Retorna Result<ArticleRow[]>
}

// Em page.tsx
const result = await getLatestArticles();
if (result.type !== "ok") return <div>Erro...</div>;
const articles = result.data;
```

### 2. Tipos de Artigo

Estrutura principal definida em `lib/article-row.ts`:

- `unique_id`: Identificador único
- `title`: Título da notícia
- `content`: Conteúdo em texto/markdown
- `image`: URL da imagem
- `published_at`: Timestamp Unix
- `theme_1_level_1_label`: Tema principal
- `agency_slug`: Órgão/ministério responsável

### 3. Sistema de Temas

Definidos em `lib/themes.ts`:

- Mapeia temas para ícones e imagens
- Usado na página inicial e páginas de temas
- Estrutura: `{ [themeName: string]: { icon: React.Component, image: string } }`

### 4. Componentes de UI

Baseados em shadcn/ui (Radix UI):

- Configuração em `components.json`
- Componentes em `components/ui/`
- Estilos personalizados com cores do governo brasileiro

### 5. Homepage Layout

A página inicial (`app/page.tsx`) tem 5 seções principais:

1. **Hero**: 1 manchete grande + 2 cards laterais + 2 secundários sem imagem
2. **Últimas Notícias**: Grid de 6 cards com preview
3. **Temas em Foco**: 3 temas com 2 notícias cada
4. **Transparência**: Links para portais externos (Portal da Transparência, Dados Abertos, Ouvidoria)
5. **Estatísticas**: KPIs editoriais (notícias do mês, total, ministérios, etc.)

### 6. Revalidação

- **ISR**: `export const revalidate = 600` (10 minutos)
- Páginas são regeneradas em background
- Garante conteúdo atualizado sem rebuild completo

## Comandos Principais

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor dev com Turbopack

# Build
pnpm build        # Build de produção com Turbopack

# Produção
pnpm start        # Inicia servidor de produção

# Linting e Formatação
pnpm lint         # Verifica código com Biome
pnpm format       # Formata código com Biome
```

## Variáveis de Ambiente

O projeto requer configuração do Typesense. Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_TYPESENSE_HOST=localhost
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=sua-api-key
```

**Para desenvolvimento local:**

O container `govbrnews-typesense` busca a chave da API do GCP Secret Manager na inicialização. Para obter a chave correta, execute:

```bash
docker logs govbrnews-typesense | grep "API Key:"
```

Copie a chave exibida e configure no seu `.env.local`.

## Padrões de Código

### Server Components (padrão)

As páginas em `app/` são Server Components por padrão:

```tsx
// app/page.tsx
export default async function Page() {
  const data = await fetchData(); // Direto no componente
  return <div>{data}</div>;
}
```

### Client Components

Marcados com `'use client'`:

```tsx
// components/ClientArticle.tsx
"use client";
export default function ClientArticle() {
  const [state, setState] = useState();
  // ...
}
```

### Server Actions

```tsx
// app/artigos/actions.ts
"use server";

import { Result } from "@/lib/result";

export async function getArticles(): Promise<Result<Article[]>> {
  try {
    // Busca do Typesense
    return { type: "ok", data: articles };
  } catch (error) {
    return { type: "error", error: "Mensagem de erro" };
  }
}
```

### Tratamento de Erros

Sempre use o padrão `Result<T>`:

```typescript
type Result<T> = { type: "ok"; data: T } | { type: "error"; error: string };
```

## Estilo e Design

### Cores do Governo

Definidas em `app/globals.css`:

- `--government-blue`: Azul institucional
- `--government-red`: Vermelho
- `--government-green`: Verde
- `--government-yellow`: Amarelo

### Tailwind Classes Customizadas

```css
.theme-banner-1,
.theme-banner-2,
.theme-banner-3 .transparency-banner-1,
.transparency-banner-2,
.transparency-banner-3;
```

SVGs decorativos de fundo para cards de temas e transparência.

### Responsividade

- Mobile-first
- Breakpoints padrão do Tailwind
- Grid adapta de 1 coluna (mobile) para 3 colunas (desktop)

## Integração com Typesense

Cliente configurado em `lib/typesense-client.ts`:

```typescript
import Typesense from "typesense";

const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST ?? 'localhost';
const port = 8108;
const protocol = 'http';

const client = new Typesense.Client({
  nodes: [{ host, port, protocol }],
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY ??
    'govbrnews_api_key_change_in_production',
  connectionTimeoutSeconds: 10,
});
```

### Busca de Artigos

```typescript
const searchResults = await client.collections("articles").documents().search({
  q: query,
  query_by: "title,content",
  sort_by: "published_at:desc",
});
```

## Componentes Importantes

### NewsCard

Card de notícia reutilizável com suporte a diferentes layouts:

- Modo principal (manchete grande com imagem)
- Modo padrão (card médio)
- Modo compacto (sem imagem)

Props principais:

- `title`, `summary`, `date`, `theme_1_level_1`
- `imageUrl`, `internalUrl`
- `isMain` (boolean para manchete principal)

### MarkdownRenderer

Renderiza conteúdo markdown dos artigos:

- Suporta HTML bruto (rehype-raw)
- GitHub Flavored Markdown (remark-gfm)
- Estilos customizados para elementos markdown

### SearchBar

Barra de busca com:

- Debounce
- Navegação para `/busca?q=termo`
- Ícone de busca (Lucide React)

## Dicas para Desenvolvimento

### Adicionar Nova Página

1. Crie pasta em `src/app/`
2. Adicione `page.tsx` (Server Component)
3. Se precisar de dados, crie `actions.ts` com server actions
4. Adicione `loading.tsx` para estado de carregamento (opcional)
5. Adicione `error.tsx` para tratamento de erros (opcional)

### Adicionar Novo Componente UI

```bash
npx shadcn-ui@latest add [component-name]
```

Componentes são adicionados automaticamente em `components/ui/`

### Trabalhar com Temas

1. Adicione tema em `lib/themes.ts`
2. Importe ícone do lucide-react
3. Adicione imagem em `public/`
4. Use em componentes via `THEME_ICONS[themeName]`

### Debugging do Typesense

- Verifique conexão: `console.log(await client.health.retrieve())`
- Liste collections: `console.log(await client.collections().retrieve())`
- Teste queries manualmente antes de integrar

### Performance

- Use `loading.tsx` para Suspense boundaries
- Implemente paginação em listas longas
- Otimize imagens (Next.js Image component quando possível)
- Mantenha revalidação adequada (nem muito curta, nem muito longa)

## Deployment

O projeto está configurado para deploy standalone:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

### Com Docker

```bash
docker build -t portal-brasil .
docker run -p 3000:3000 portal-brasil
```

### Variáveis de Ambiente em Produção

Certifique-se de configurar:

- `NEXT_PUBLIC_TYPESENSE_HOST`
- `NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY`

## Troubleshooting Comum

### Erros de Build com Turbopack

- Limpe cache: `rm -rf .next`
- Reinstale dependências: `rm -rf node_modules && pnpm install`

### Erros de Typesense

- Verifique se o servidor está acessível
- Confirme API key
- Verifique se a collection existe
- Use try/catch e retorne Result<T>

### Problemas de Estilo

- Rode `pnpm format` para consistência
- Verifique imports do Tailwind em `globals.css`
- Limpe cache do navegador

### TypeScript Errors

- Rode `npx tsc --noEmit` para ver todos os erros
- Verifique tipos em `lib/article-row.ts`
- Use `Result<T>` consistentemente

## Links Úteis

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Typesense Docs](https://typesense.org/docs/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## Convenções do Projeto

### Nomenclatura

- Componentes: PascalCase (`NewsCard.tsx`)
- Utilitários: camelCase (`getAgencyName.ts`)
- Server Actions: camelCase (`getLatestArticles`)
- CSS Classes: kebab-case (`theme-banner-1`)

### Estrutura de Imports

```typescript
// 1. React/Next
import { useState } from "react";
import Link from "next/link";

// 2. Bibliotecas externas
import { useQuery } from "@tanstack/react-query";

// 3. Componentes internos
import { Button } from "@/components/ui/button";
import NewsCard from "@/components/NewsCard";

// 4. Utilitários e tipos
import { getExcerpt } from "@/lib/utils";
import type { ArticleRow } from "@/lib/article-row";
```

### Comentários

Use comentários descritivos para seções da página:

```tsx
{
  /* 1️⃣ HERO — destaque principal */
}
{
  /* 2️⃣ ÚLTIMAS NOTÍCIAS — grade */
}
```

## Contribuindo

Este projeto utiliza Biome para linting e formatação. Antes de commitar:

```bash
pnpm lint    # Verifica erros
pnpm format  # Formata código
```

---

**Última atualização**: Novembro 2024
**Mantido por**: Equipe MGI/Governo Federal
