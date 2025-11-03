/**
 * Get the site URL for the current environment
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL env var (if set)
 * 2. Vercel URL (if deployed on Vercel)
 * 3. Request headers (for Cloud Run or other platforms)
 * 4. Localhost fallback (for development)
 */
export function getSiteUrl(headers?: Headers): string {
  // If explicitly configured, use it
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Cloud Run or other platform - detect from request headers
  if (headers) {
    const host = headers.get('host')
    const protocol = headers.get('x-forwarded-proto') || 'https'
    if (host) {
      return `${protocol}://${host}`
    }
  }

  // Development fallback
  return 'http://localhost:3000'
}

/**
 * Get the base URL for the site (no trailing slash)
 */
export function getBaseUrl(headers?: Headers): string {
  return getSiteUrl(headers).replace(/\/$/, '')
}
