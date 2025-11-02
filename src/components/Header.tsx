import { Menu } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import SearchBar from './SearchBar'
import Link from 'next/link'
import { Suspense } from 'react'

const Header = () => {
  return (
    <header className="border-b bg-card shadow-card">
      {/* Top bar with government branding */}
      <div className="header-banner py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-primary font-semibold">
            Todas as Notícias do Governo Federal em Um Só Lugar
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between p-2">
          {/* Logo and title */}
          <Link
            href="/"
            className="flex items-center space-x-4 hover:bg-gray-200 rounded-2xl hover:cursor-pointer pr-4"
          >
            <Image
              src="/logo.png"
              alt="Selo do Governo Federal"
              width={100}
              height={100}
              className="h-20 w-20"
            />
            <div>
              <h1 className="text-xl font-bold">DestaquesGovBr</h1>
              <p className="text-sm text-muted-foreground">Governo Federal</p>
            </div>
          </Link>

          {/* Search bar */}
          <Suspense>
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar />
            </div>
          </Suspense>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
