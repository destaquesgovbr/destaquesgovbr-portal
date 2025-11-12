'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import type { AgencyOption } from '@/lib/agencies-utils'

type OrgaosPageClientProps = {
  agencies: AgencyOption[]
}

export default function OrgaosPageClient({ agencies }: OrgaosPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter agencies based on search term
  const filteredAgencies = useMemo(() => {
    if (!searchTerm.trim()) {
      return agencies
    }

    const searchLower = searchTerm.toLowerCase()
    return agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchLower)
    )
  }, [agencies, searchTerm])

  // Group filtered agencies by type
  const ministerios = filteredAgencies.filter(a => a.type === 'Ministério')
  const otherAgencies = filteredAgencies.filter(a => a.type !== 'Ministério')

  // Group other agencies by type
  const otherByType: Record<string, typeof agencies> = {}
  for (const agency of otherAgencies) {
    if (!otherByType[agency.type]) {
      otherByType[agency.type] = []
    }
    otherByType[agency.type].push(agency)
  }

  // Sort types alphabetically
  const sortedTypes = Object.keys(otherByType).sort()

  // Function to pluralize agency types in Portuguese
  const pluralize = (type: string): string => {
    if (type === 'Portal') return 'Portais'
    if (type.endsWith('ão')) return type.slice(0, -2) + 'ões' // Fundação -> Fundações
    return type + 's' // Default: add 's'
  }

  return (
    <section className="py-16">
      {/* Cabeçalho institucional */}
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl font-bold text-primary">Órgãos do Governo Federal</h2>

        {/* Linha divisória SVG */}
        <div className="mx-auto mt-3 w-40">
          <img src="/underscore.svg" alt="" />
        </div>

        {/* Subtítulo */}
        <p className="mt-4 text-base text-primary/80">
          Explore as notícias por órgão do governo federal.
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Buscar órgãos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </div>

      <div className="container mx-auto px-4">
        {filteredAgencies.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            Nenhum órgão encontrado
          </div>
        ) : (
          <>
            {/* Ministérios */}
            {ministerios.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-primary mb-6">Ministérios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ministerios.map((agency) => (
                    <Link
                      key={agency.key}
                      href={`/orgaos/${agency.key}`}
                      className="block p-4 bg-white border border-border rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all group"
                    >
                      <h4 className="font-semibold text-primary group-hover:text-primary/90 transition-colors">
                        {agency.name}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Other agencies grouped by type */}
            {sortedTypes.map((type) => (
              <div key={type} className="mb-12">
                <h3 className="text-2xl font-bold text-primary mb-6">{pluralize(type)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherByType[type].map((agency) => (
                    <Link
                      key={agency.key}
                      href={`/orgaos/${agency.key}`}
                      className="block p-4 bg-white border border-border rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all group"
                    >
                      <h4 className="font-semibold text-primary group-hover:text-primary/90 transition-colors">
                        {agency.name}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  )
}
