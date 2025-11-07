'use client'

import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { AgencyMultiSelect } from '@/components/AgencyMultiSelect'
import type { AgencyOption } from '@/lib/get-agencies-list'

type DateFilterProps = {
  label: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
}

function DateFilter({ label, value, onChange }: DateFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-primary">{label}</label>
      <div className="relative">
        <Input
          type="date"
          onChange={(e) => onChange(new Date(e.target.value))}
          className={value ? 'pr-9' : undefined}
          value={value ? value.toISOString().split('T')[0] : ''}
        />
        {value && (
          <X
            onClick={() => onChange(undefined)}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground rounded-full p-2 hover:bg-gray-200 hover:cursor-pointer transition-colors"
          />
        )}
      </div>
    </div>
  )
}

type ArticleFiltersProps = {
  agencies: AgencyOption[]
  startDate: Date | undefined
  endDate: Date | undefined
  selectedAgencies: string[]
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  onAgenciesChange: (agencies: string[]) => void
  getAgencyName: (key: string) => string
}

export function ArticleFilters({
  agencies,
  startDate,
  endDate,
  selectedAgencies,
  onStartDateChange,
  onEndDateChange,
  onAgenciesChange,
  getAgencyName,
}: ArticleFiltersProps) {
  return (
    <aside className="lg:w-80 flex-shrink-0 lg:border-r lg:border-border lg:pr-8 relative z-40">
      <div className="sticky top-4">
        <h3 className="text-lg font-semibold text-primary mb-6">Filtros</h3>

        <div className="space-y-6">
          <DateFilter
            label="Início da publicação"
            value={startDate}
            onChange={onStartDateChange}
          />

          <DateFilter
            label="Fim da publicação"
            value={endDate}
            onChange={onEndDateChange}
          />

          {/* Agency Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-primary">
              Órgãos
            </label>
            <AgencyMultiSelect
              agencies={agencies}
              selectedAgencies={selectedAgencies}
              onSelectedAgenciesChange={onAgenciesChange}
              showBadges={false}
            />
          </div>

          {/* Selected Agencies List */}
          {selectedAgencies.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-primary">
                  Órgãos selecionados ({selectedAgencies.length})
                </span>
                <button
                  type="button"
                  onClick={() => onAgenciesChange([])}
                  className="text-xs text-muted-foreground hover:text-primary underline"
                >
                  Limpar todos
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedAgencies.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-md text-sm hover:bg-primary/10 transition-colors group"
                  >
                    <span className="truncate text-primary/90 flex-1 min-w-0">
                      {getAgencyName(key)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAgenciesChange(selectedAgencies.filter((k) => k !== key))}
                      className="text-primary/50 hover:text-primary p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      aria-label={`Remover ${getAgencyName(key)}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
