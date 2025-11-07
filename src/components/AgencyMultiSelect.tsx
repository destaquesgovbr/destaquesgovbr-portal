'use client'

import * as React from 'react'
import { X } from 'lucide-react'

type Agency = {
  key: string
  name: string
  type: string
}

type AgencyMultiSelectProps = {
  agencies: Agency[]
  selectedAgencies: string[]
  onSelectedAgenciesChange: (agencies: string[]) => void
  showBadges?: boolean
}

export function AgencyMultiSelect({
  agencies,
  selectedAgencies,
  onSelectedAgenciesChange,
  showBadges = true,
}: AgencyMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Group and sort agencies by type
  const agenciesByType = React.useMemo(() => {
    const grouped: Record<string, Agency[]> = {}
    for (const agency of agencies) {
      if (!grouped[agency.type]) {
        grouped[agency.type] = []
      }
      grouped[agency.type].push(agency)
    }
    return grouped
  }, [agencies])

  // Filter agencies by search term
  const { filteredAgenciesByType, filteredTypes } = React.useMemo(() => {
    let result = agenciesByType

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const filtered: Record<string, Agency[]> = {}

      for (const [type, typeAgencies] of Object.entries(agenciesByType)) {
        const matchingAgencies = typeAgencies.filter((agency) =>
          agency.name.toLowerCase().includes(searchLower)
        )
        if (matchingAgencies.length > 0) {
          filtered[type] = matchingAgencies
        }
      }
      result = filtered
    }

    return {
      filteredAgenciesByType: result,
      filteredTypes: Object.keys(result).sort(),
    }
  }, [searchTerm, agenciesByType])

  const toggleAgency = React.useCallback(
    (agencyKey: string) => {
      onSelectedAgenciesChange(
        selectedAgencies.includes(agencyKey)
          ? selectedAgencies.filter((key) => key !== agencyKey)
          : [...selectedAgencies, agencyKey]
      )
    },
    [selectedAgencies, onSelectedAgenciesChange]
  )

  const getAgencyName = React.useCallback(
    (key: string) => {
      const agency = agencies.find((a) => a.key === key)
      return agency?.name || key
    },
    [agencies]
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

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 py-2 border border-input rounded-md text-left text-sm bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={selectedAgencies.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
          {selectedAgencies.length === 0
            ? 'Selecione agências...'
            : `${selectedAgencies.length} selecionada${selectedAgencies.length > 1 ? 's' : ''}`}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[320px] bg-white border border-border rounded-md shadow-lg z-[9999] animate-in fade-in-0 zoom-in-95">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <input
              type="text"
              placeholder="Buscar agências..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              autoFocus
            />
          </div>

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredTypes.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma agência encontrada
              </div>
            ) : (
              filteredTypes.map((type) => (
                <div key={type} className="mb-2">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wide px-3 py-2 bg-muted/50 rounded-sm">
                    {type}
                  </div>
                  <div className="mt-1">
                    {filteredAgenciesByType[type].map((agency) => (
                      <label
                        key={agency.key}
                        className="flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAgencies.includes(agency.key)}
                          onChange={() => toggleAgency(agency.key)}
                          className="mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="truncate text-sm group-hover:font-medium transition-all">
                          {agency.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected badges */}
      {showBadges && selectedAgencies.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedAgencies.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <span className="max-w-[150px] truncate">{getAgencyName(key)}</span>
              <button
                type="button"
                onClick={() => toggleAgency(key)}
                className="text-primary/70 hover:text-primary hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
                aria-label={`Remover ${getAgencyName(key)}`}
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
