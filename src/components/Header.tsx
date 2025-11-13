'use client'

import { Menu, Search } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import SearchBar from './SearchBar'
import Link from 'next/link'
import { Suspense, useState } from 'react'

const navLinks = [
  { href: '/temas/Meio%20Ambiente%20e%20Sustentabilidade', label: 'Meio ambiente' },
  { href: '/temas/Economia%20e%20Finanças', label: 'Economia' },
  { href: '/temas/Segurança%20Pública', label: 'Segurança pública' },
  { href: '/temas', label: 'Todos os temas' },
  { href: '/orgaos', label: 'Órgãos' },
  { href: '/dados-editoriais', label: 'Dados e análises' },
]

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b bg-card shadow-card">
      {/* Top bar with government branding */}
      <div className="header-banner py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-primary font-semibold">
            Todas as notícias do Governo Federal em um só lugar
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between p-2">
          {/* Logo and title */}
          <Link
            href="/"
            className="flex items-center space-x-2 md:space-x-4 hover:bg-gray-200 rounded-2xl hover:cursor-pointer pr-2 md:pr-4"
          >
            <Image
              src="/logo.png"
              alt="Selo do Governo Federal"
              width={100}
              height={100}
              className="h-14 w-14 md:h-20 md:w-20"
            />
            <div>
              <h1 className="text-base md:text-xl font-bold">DestaquesGovBr</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Governo Federal</p>
            </div>
          </Link>

          {/* Desktop search bar */}
          <Suspense>
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar />
            </div>
          </Suspense>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile search icon */}
            <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="w-full">
                <SheetHeader>
                  <SheetTitle>Buscar notícias</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <Suspense>
                    <SearchBar />
                  </Suspense>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile menu */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-base font-medium px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t pt-4 mt-2">
                    <Link
                      href="/artigos"
                      onClick={() => setMenuOpen(false)}
                      className="text-base font-medium px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors block"
                    >
                      Todas as notícias
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Navigation menu - Desktop only */}
      <div className="border-t bg-background">
        <div className="container mx-auto px-4">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-4 py-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium rounded-md px-2 py-1 hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
