import { Menu, Search } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const Header = () => {
  return (
    <header className="border-b bg-card shadow-card">
      {/* Top bar with government branding */}
      <div className="bg-gradient-government py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-white">
            Portal Oficial de Notícias do Governo Federal do Brasil
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center space-x-4">
            <Image
              src="/logoKKKKKKKKKKKKKKKKKK.png"
              width={50}
              height={50}
              alt="Selo do Governo Federal"
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold">Destaques GOVBR</h1>
              <p className="text-sm text-muted-foreground">Governo Federal</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar notícias..." className="pl-10" />
            </div>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 py-4 border-t">
          <a
            href="."
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Todas as Notícias
          </a>
          <a
            href="."
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Presidência
          </a>
          <a
            href="."
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Ministérios
          </a>
          <a
            href="."
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Economia
          </a>
          <a
            href="."
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Saúde
          </a>
          <a
            href="."
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Educação
          </a>
          <a
            href="."
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Infraestrutura
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header
