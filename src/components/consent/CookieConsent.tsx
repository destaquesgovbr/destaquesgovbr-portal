'use client'

import { useConsent } from './ConsentProvider'

export function CookieConsent() {
  const { showBanner, acceptCookies, rejectCookies } = useConsent()

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-700 text-center sm:text-left">
          Este portal utiliza cookies para análise de navegação, permitindo
          melhorar sua experiência. Ao aceitar, você concorda com a coleta de
          dados de uso.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={rejectCookies}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium text-white bg-government-blue rounded-md hover:bg-government-blue/90 transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
