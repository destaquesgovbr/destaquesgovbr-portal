'use client'

import * as React from 'react'
import { X, Maximize2 } from 'lucide-react'

type Theme = {
  key: string
  name: string
}

type ThemeMultiSelectProps = {
  themes: Theme[]
  selectedThemes: string[]
  onSelectedThemesChange: (themes: string[]) => void
  showBadges?: boolean
}

export function ThemeMultiSelect({
  themes,
  selectedThemes,
  onSelectedThemesChange,
  showBadges = true,
}: ThemeMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Filter themes by search term
  const filteredThemes = React.useMemo(() => {
    if (!searchTerm) return themes

    const searchLower = searchTerm.toLowerCase()
    return themes.filter((theme) =>
      theme.name.toLowerCase().includes(searchLower)
    )
  }, [searchTerm, themes])

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

  const getThemeName = React.useCallback(
    (key: string) => {
      const theme = themes.find((t) => t.key === key)
      return theme?.name || key
    },
    [themes]
  )

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close modal on ESC key
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

  // Render theme list (reusable for both dropdown and modal)
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
            className="flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm transition-colors group"
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
      {/* Trigger Button */}
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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[320px] bg-white border border-border rounded-md shadow-lg z-[100] animate-in fade-in-0 zoom-in-95">
          {/* Search and Expand Button */}
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

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {renderThemeList()}
          </div>
        </div>
      )}

      {/* Expanded Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 animate-in fade-in-0 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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

            {/* Modal Search */}
            <div className="p-6 border-b border-border">
              <input
                type="text"
                placeholder="Buscar temas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                autoFocus
              />
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {renderThemeList()}
              </div>
            </div>

            {/* Modal Footer */}
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
      )}

      {/* Selected badges */}
      {showBadges && selectedThemes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedThemes.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <span className="max-w-[150px] truncate">{getThemeName(key)}</span>
              <button
                type="button"
                onClick={() => toggleTheme(key)}
                className="text-primary/70 hover:text-primary hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
                aria-label={`Remover ${getThemeName(key)}`}
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
