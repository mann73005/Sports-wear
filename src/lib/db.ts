import { PrismaClient } from '@prisma/client'

// Next dev reloads modules on every edit; without this the process ends up
// holding dozens of connection pools.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
