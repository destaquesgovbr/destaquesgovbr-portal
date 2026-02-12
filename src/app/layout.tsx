import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { Providers } from '@/components/common/Providers'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Destaques GOV',
  description:
    'Portal de centralização das notícias oficiais do Governo Brasileiro',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Detecta se é uma página de widget embed via middleware
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isWidgetEmbed = pathname.startsWith('/embed')

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isWidgetEmbed ? (
          // Widget: sem Header, Footer, Providers
          children
        ) : (
          // Portal principal: com Header, Footer, Providers
          <Providers>
            <Header />
            <div className="pt-[110px] md:pt-[130px]">
              <Suspense>{children}</Suspense>
            </div>
            <Footer />
          </Providers>
        )}
      </body>
    </html>
  )
}
