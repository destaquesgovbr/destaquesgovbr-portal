import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Optimize for production
  poweredByHeader: false,
  compress: true,

  // Configure images for optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gov.br',
      },
    ],
  },
}

export default nextConfig
