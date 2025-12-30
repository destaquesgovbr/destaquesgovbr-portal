'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const CONSENT_KEY = 'clarity-consent'

interface ConsentContextType {
  hasConsent: boolean | null
  showBanner: boolean
  acceptCookies: () => void
  rejectCookies: () => void
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored !== null) {
      setHasConsent(stored === 'true')
    }
    setIsLoaded(true)
  }, [])

  const acceptCookies = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'true')
    setHasConsent(true)
  }, [])

  const rejectCookies = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'false')
    setHasConsent(false)
  }, [])

  const showBanner = isLoaded && hasConsent === null

  return (
    <ConsentContext.Provider
      value={{ hasConsent, showBanner, acceptCookies, rejectCookies }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const context = useContext(ConsentContext)
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }
  return context
}
