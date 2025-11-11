'use client'

import * as React from 'react'
import { X, Maximize2, ChevronDown } from 'lucide-react'
import { Portal } from '@/components/Portal'

type Theme = {
  key: string
  name: string
}

type ThemeNode = {
  code: string
  label: string
  children?: ThemeNode[]
}

type ThemeMultiSelectProps = {
  themes: Theme[]
  selectedThemes: string[]
  onSelectedThemesChange: (themes: string[]) => void
  showBadges?: boolean
  themeHierarchy?: ThemeNode[]
}

// Component for tree view items
function ThemeTreeItem({
  node,
  level = 0,
  selectedThemes,
  onToggle,
  expandedNodes,
  onExpandToggle,
}: {
  node: ThemeNode
  level?: number
  selectedThemes: string[]
  onToggle: (code: string) => void
  expandedNodes: Set<string>
  onExpandToggle: (code: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedNodes.has(node.code)
  const isSelected = selectedThemes.includes(node.code)

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors cursor-pointer group`}
        style={{ marginLeft: `${level * 16}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onExpandToggle(node.code)}
            className="p-0 hover:bg-gray-200 rounded transition-colors"
            aria-label={isExpanded ? 'Recolher' : 'Expandir'}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            />
          </button>
        ) : (
          <div className="w-4" />
        )}

        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(node.code)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />

        <label
          className="flex-1 cursor-pointer text-sm font-medium"
          onClick={() => onToggle(node.code)}
        >
          {node.label}
        </label>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <ThemeTreeItem
              key={child.code}
              node={child}
              level={level + 1}
              selectedThemes={selectedThemes}
              onToggle={onToggle}
              expandedNodes={expandedNodes}
              onExpandToggle={onExpandToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ThemeMultiSelect({
  themes,
  selectedThemes,
  onSelectedThemesChange,
  showBadges = true,
  themeHierarchy = [],
}: ThemeMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set())
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const filteredThemes = React.useMemo(() => {
    if (!searchTerm) return themes
    const searchLower = searchTerm.toLowerCase()
    return themes.filter((theme) =>
      theme.name.toLowerCase().includes(searchLower)
    )
  }, [searchTerm, themes])

  const hierarchyNodes = React.useMemo(() => {
    return themeHierarchy && themeHierarchy.length > 0
      ? themeHierarchy
      : buildHierarchyFromFlat(themes)
  }, [themeHierarchy, themes])

  const toggleTheme = React.useCallback(
    (themeKey: string) => {
      onSelectedThemesChange(
        selectedThemes.includes(themeKey)
          ? selectedThemes.filter((key) => key !== themeKey)
          : [...selectedThemes, themeKey]
      )
    },
    [selectedThemes, onSelectedThemesChange]
  )

  const toggleExpandNode = React.useCallback((nodeCode: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeCode)) {
        next.delete(nodeCode)
      } else {
        next.add(nodeCode)
      }
      return next
    })
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false)
        } else if (isOpen) {
          setIsOpen(false)
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isExpanded, isOpen])

  const renderThemeList = () => (
    <>
      {filteredThemes.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">
          Nenhum tema encontrado
        </div>
      ) : (
        filteredThemes.map((theme) => (
          <label
            key={theme.key}
            className={`flex items-center cursor-pointer rounded-sm transition-colors group px-3 py-2 hover:bg-accent hover:text-accent-foreground`}
          >
            <input
              type="checkbox"
              checked={selectedThemes.includes(theme.key)}
              onChange={() => toggleTheme(theme.key)}
              className="mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span className="truncate text-sm group-hover:font-medium transition-all">
              {theme.name}
            </span>
          </label>
        ))
      )}
    </>
  )

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 py-2 border border-input rounded-md text-left text-sm bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={selectedThemes.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
          {selectedThemes.length === 0
            ? 'Selecione temas...'
            : `${selectedThemes.length} selecionado${selectedThemes.length > 1 ? 's' : ''}`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[320px] bg-white border border-border rounded-md shadow-lg z-[200] animate-in fade-in-0 zoom-in-95">
          <div className="p-3 border-b border-border flex gap-2">
            <input
              type="text"
              placeholder="Buscar temas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true)
                setIsOpen(false)
              }}
              className="px-3 py-2 border border-input rounded-md hover:bg-gray-50 transition-colors"
              title="Expandir visualização"
            >
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {renderThemeList()}
          </div>
        </div>
      )}

      {isExpanded && (
        <Portal>
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 animate-in fade-in-0 p-4 pointer-events-auto"
            onClick={() => setIsExpanded(false)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col animate-in zoom-in-95 relative z-[301]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Selecionar Temas</h2>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 border-b border-border flex gap-4">
                <input
                  type="text"
                  placeholder="Buscar temas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {hierarchyNodes.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    Nenhum tema encontrado
                  </div>
                ) : (
                  <div className="space-y-1">
                    {hierarchyNodes.map((node) => (
                      <ThemeTreeItem
                        key={node.code}
                        node={node}
                        level={0}
                        selectedThemes={selectedThemes}
                        onToggle={toggleTheme}
                        expandedNodes={expandedNodes}
                        onExpandToggle={toggleExpandNode}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border flex items-center justify-between bg-gray-50">
                <span className="text-sm text-muted-foreground">
                  {selectedThemes.length} tema{selectedThemes.length !== 1 ? 's' : ''} selecionado{selectedThemes.length !== 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {showBadges && selectedThemes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedThemes.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20 hover:bg-primary/15 transition-colors"
              title={themes.find((t) => t.key === key)?.name || key}
            >
              <span className="max-w-[150px] truncate">{themes.find((t) => t.key === key)?.name || key}</span>
              <button
                type="button"
                onClick={() => toggleTheme(key)}
                className="text-primary/70 hover:text-primary hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
                aria-label={`Remover ${themes.find((t) => t.key === key)?.name || key}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function buildHierarchyFromFlat(themes: Theme[]): ThemeNode[] {
  const roots: ThemeNode[] = []
  const map = new Map<string, ThemeNode>()

  for (const theme of themes) {
    // Only remove the tree characters (└), but keep the indentation spaces
    const cleanName = theme.name.replace(/└/g, '').trim()
    const node: ThemeNode = {
      code: theme.key,
      label: cleanName,
      children: [],
    }
    map.set(theme.key, node)

    const indentLevel = (theme.name.length - theme.name.trimLeft().length) / 2

    if (indentLevel === 0) {
      roots.push(node)
    }
  }

  let lastByLevel: Record<number, ThemeNode> = {}
  for (const theme of themes) {
    const indentLevel = (theme.name.length - theme.name.trimLeft().length) / 2

    if (indentLevel > 0) {
      const parentLevel = indentLevel - 1
      const parent = lastByLevel[parentLevel]
      if (parent) {
        const node = map.get(theme.key)
        if (node) {
          parent.children?.push(node)
        }
      }
    }

    const node = map.get(theme.key)
    if (node) {
      lastByLevel[indentLevel] = node
    }
  }

  return roots
}
