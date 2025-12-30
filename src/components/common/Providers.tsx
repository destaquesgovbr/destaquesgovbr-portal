'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClarityScript } from '@/components/analytics/ClarityScript'
import { ConsentProvider } from '@/components/consent/ConsentProvider'
import { CookieConsent } from '@/components/consent/CookieConsent'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <CookieConsent />
        <ClarityScript />
      </QueryClientProvider>
    </ConsentProvider>
  )
}
