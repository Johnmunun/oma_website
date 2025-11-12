/**
 * @file lib/prisma.ts
 * @description Prisma Client singleton pour Next.js
 * Évite la création de multiples instances en développement (hot-reload safe)
 * Compatible avec Neon PostgreSQL
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
    // Optimisation: connection pooling pour de meilleures performances
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends({
    query: {
      $allOperations({ operation, model, args, query }) {
        return query(args).catch((error: any) => {
          console.error(`[Prisma] Erreur ${operation} sur ${model}:`, error)
          throw error
        })
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma



