import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
  },

  // The SQLite file is created and seeded by the build script, so it is not
  // imported anywhere and Next's file tracing cannot discover it on its own.
  // Without this the serverless bundle ships without a database and every
  // dynamic route 500s at runtime.
  outputFileTracingIncludes: {
    '/**': ['./prisma/dev.db'],
  },
}

export default nextConfig
