'use client'

import { useEffect } from 'react'
import { useConsent } from '@/components/consent/ConsentProvider'

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

export function ClarityScript() {
  const { hasConsent } = useConsent()

  useEffect(() => {
    if (!CLARITY_PROJECT_ID || hasConsent !== true) {
      return
    }

    // Skip if already loaded
    if (document.getElementById('clarity-script')) {
      return
    }

    // Initialize clarity function
    const w = window as Window & {
      clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] }
    }

    w.clarity =
      w.clarity ||
      ((...args: unknown[]) => {
        ;(w.clarity as { q?: unknown[][] }).q =
          (w.clarity as { q?: unknown[][] }).q || []
        ;(w.clarity as { q: unknown[][] }).q.push(args)
      })

    // Load Microsoft Clarity script
    const script = document.createElement('script')
    script.id = 'clarity-script'
    script.async = true
    script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`
    document.head.appendChild(script)
  }, [hasConsent])

  return null
}
