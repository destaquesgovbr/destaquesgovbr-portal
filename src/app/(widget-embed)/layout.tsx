import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Widget DGB',
  description: 'Widget embarcável do Destaques Gov.br',
  robots: {
    index: false, // Não indexar páginas de widget
    follow: false,
  },
}

/**
 * Layout minimalista para widgets embarcáveis
 * Sem Header, Footer, ou componentes de navegação
 */
export default function WidgetEmbedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Sem Providers para evitar Umami/Analytics/Cookies extras */}
        {children}
      </body>
    </html>
  )
}
