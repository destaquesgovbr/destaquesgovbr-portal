import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gov.br',
      },
      {
        protocol: 'https',
        hostname: '**.ebc.com.br',
      },
    ],
  },
}

export default nextConfig
