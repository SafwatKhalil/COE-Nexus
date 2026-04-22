import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@coe-nexus/shared'],
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
