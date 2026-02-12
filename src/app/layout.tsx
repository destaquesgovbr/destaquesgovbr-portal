import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './govbr.css'
import './globals.css'
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
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
      'application/atom+xml': '/feed.atom',
      'application/feed+json': '/feed.json',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdngovbr-ds.estaleiro.serpro.gov.br/design-system/fonts/rawline/css/rawline.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Raleway:300,400,500,600,700,800,900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          <div className="pt-[110px] md:pt-[130px]">
            <Suspense>{children}</Suspense>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
