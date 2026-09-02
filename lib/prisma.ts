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

const prismaClient =
  globalForPrisma.prisma ||
  (new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends({
    query: {
      $allOperations({ operation, model, args, query }) {
        return query(args).catch((error: unknown) => {
          console.error(`[Prisma] Erreur ${operation} sur ${model}:`, error)
          throw error
        })
      },
    },
  }) as unknown as PrismaClient)

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

export default prisma



