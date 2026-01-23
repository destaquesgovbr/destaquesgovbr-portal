# Claude Code Skills

Este documento explica o que são Skills no Claude Code e como utilizá-las neste repositório.

## O que são Skills?

Skills são extensões que adicionam conhecimento especializado e capacidades ao Claude Code. Elas permitem que o Claude aplique diretrizes específicas, melhores práticas e padrões de código ao trabalhar no projeto.

Cada skill é definida por arquivos markdown que contêm:
- Metadados (nome, descrição, autor, versão)
- Instruções de quando aplicar
- Regras e diretrizes específicas
- Exemplos de código

## Skills Disponíveis

### 1. vercel-react-best-practices

Guia de otimização de performance para aplicações React e Next.js, mantido pela Vercel. Contém 45 regras organizadas em 8 categorias por prioridade de impacto.

**Quando usar:**
- Escrevendo novos componentes React ou páginas Next.js
- Implementando data fetching (client ou server-side)
- Revisando código para problemas de performance
- Refatorando código React/Next.js existente
- Otimizando bundle size ou tempos de carregamento

**Categorias de regras:**

| Prioridade | Categoria | Impacto | Prefixo |
|------------|-----------|---------|---------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

### 2. web-design-guidelines

Revisa código de UI para conformidade com Web Interface Guidelines.

**Quando usar:**
- "review my UI"
- "check accessibility"
- "audit design"
- "review UX"
- "check my site against best practices"

## Como Usar as Skills

### Invocação Automática

O Claude Code detecta automaticamente quando uma skill é relevante para sua tarefa e a aplica. Por exemplo, ao pedir para otimizar performance de um componente React, a skill `vercel-react-best-practices` será ativada automaticamente.

### Invocação Manual

Você pode invocar uma skill diretamente usando o comando de barra:

```
/vercel-react-best-practices
```

ou

```
/web-design-guidelines src/components/Header.tsx
```

### Exemplos de Uso

**Revisar performance de um componente:**
```
Revise o componente NewsCard.tsx seguindo as melhores práticas de performance
```

**Auditar acessibilidade:**
```
/web-design-guidelines src/components/SearchBar.tsx
```

**Otimizar bundle:**
```
Analise os imports do projeto e sugira otimizações de bundle
```

## Estrutura de Arquivos

As skills estão localizadas em `.claude/skills/`:

```
.claude/
└── skills/
    ├── vercel-react-best-practices/
    │   ├── SKILL.md           # Definição e metadados
    │   ├── AGENTS.md          # Guia completo (2400+ linhas)
    │   └── rules/             # 48 arquivos de regras individuais
    │       ├── async-*.md     # Regras de waterfalls
    │       ├── bundle-*.md    # Regras de bundle
    │       ├── server-*.md    # Regras server-side
    │       ├── client-*.md    # Regras client-side
    │       ├── rerender-*.md  # Regras de re-render
    │       ├── rendering-*.md # Regras de rendering
    │       ├── js-*.md        # Regras de JavaScript
    │       └── advanced-*.md  # Padrões avançados
    └── web-design-guidelines/
        └── SKILL.md           # Definição da skill
```

## Criando Novas Skills

Para adicionar uma nova skill ao projeto:

### 1. Criar a estrutura de diretórios

```bash
mkdir -p .claude/skills/minha-skill
```

### 2. Criar o arquivo SKILL.md

O arquivo `SKILL.md` é obrigatório e define os metadados da skill:

```markdown
---
name: minha-skill
description: Descrição da skill e quando ela deve ser usada.
license: MIT
metadata:
  author: seu-nome
  version: "1.0.0"
  argument-hint: <argumento-opcional>
---

# Nome da Skill

Explicação detalhada do que a skill faz.

## Quando Aplicar

- Situação 1
- Situação 2

## Regras/Diretrizes

Conteúdo da skill...
```

### 3. Adicionar regras (opcional)

Para skills com múltiplas regras, organize em arquivos separados:

```
.claude/skills/minha-skill/
├── SKILL.md
└── rules/
    ├── regra-01.md
    ├── regra-02.md
    └── ...
```

Cada arquivo de regra pode ter frontmatter YAML:

```markdown
---
title: Nome da Regra
impact: HIGH
impactDescription: "Descrição do impacto"
tags: performance, react
---

# Nome da Regra

## Problema
Descrição do problema...

## Solução
Código correto...
```

## Regras Mais Importantes

### Performance Crítica

1. **async-parallel** - Use `Promise.all()` para operações independentes
2. **bundle-barrel-imports** - Evite imports de barrel files (impacto de 200-800ms)
3. **bundle-dynamic-imports** - Use `next/dynamic` para componentes pesados
4. **server-cache-react** - Use `React.cache()` para deduplicação por request

### Otimizações de Re-render

1. **rerender-memo** - Extraia trabalho pesado em componentes memoizados
2. **rerender-derived-state** - Subscribe a booleanos derivados, não valores brutos
3. **rerender-functional-setstate** - Use setState funcional para callbacks estáveis

### Boas Práticas de Bundle

1. Importe diretamente de módulos, não de arquivos index/barrel
2. Carregue analytics/logging após hydration
3. Use preload em hover/focus para velocidade percebida

## Referências

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Vercel Engineering Blog](https://vercel.com/blog)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
