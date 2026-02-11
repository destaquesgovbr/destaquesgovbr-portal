'use client'

import { BrButton, BrInput } from '@govbr-ds/webcomponents-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

export default function NotFound() {
  const router = useRouter()
  const searchRef = useRef('')

  function handleSearch() {
    const query = searchRef.current.trim()
    if (query) {
      router.push(`/busca?q=${encodeURIComponent(query)}`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 md:py-16">
      {/* Hero: Ilustração + Texto */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-16">
        <div className="w-full max-w-sm md:max-w-md">
          <Image
            src="/ilustracao-erro404.svg"
            alt="Ilustração de página não encontrada com o número 404"
            width={460}
            height={340}
            priority
          />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--government-blue)] mb-4">
            Não encontramos o que você procura
          </h1>
          <p className="text-lg text-gray-600">
            Verifique o endereço usado ou tente fazer uma nova busca.
          </p>
        </div>
      </section>

      {/* Busca */}
      <section className="max-w-2xl mx-auto mb-16">
        <p className="text-lg font-semibold mb-3">Faça uma nova busca</p>
        <search onKeyDown={handleKeyDown}>
          <BrInput
            type="search"
            placeholder="O que você procura?"
            density="medium"
            actionLabel="Buscar"
            onValueChange={(e: CustomEvent<string>) => {
              searchRef.current = e.detail
            }}
          />
        </search>
      </section>

      {/* Links de navegação */}
      <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12">
        <BrButton emphasis="tertiary" onClick={() => router.back()}>
          <i className="fas fa-chevron-left mr-2" />
          Ir para a Página Anterior
        </BrButton>

        <Link href="/">
          <BrButton emphasis="tertiary">
            <i className="fas fa-home mr-2" />
            Ir para a Página Principal
          </BrButton>
        </Link>

      </nav>
    </main>
  )
}
