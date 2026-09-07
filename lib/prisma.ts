/**
 * @file lib/prisma.ts
 * @description Prisma Client singleton pour Next.js
 * Évite la création de multiples instances (hot-reload + serverless)
 * Compatible avec Neon PostgreSQL
 *
 * Important (Vercel build): ne jamais passer `datasources.db.url: undefined`
 * au constructeur — cela provoque l'erreur "client-constructor" pendant
 * "Failed to collect page data".
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient(): PrismaClient {
  const log: Array<'error' | 'warn'> =
    process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']

  const databaseUrl = process.env.DATABASE_URL?.trim()

  // N'override l'URL que si elle est réellement définie (évite crash au build Vercel)
  const client = databaseUrl
    ? new PrismaClient({
        log,
        datasources: {
          db: { url: databaseUrl },
        },
      })
    : new PrismaClient({ log })

  return client.$extends({
    query: {
      $allOperations({ operation, model, args, query }) {
        return query(args).catch((error: unknown) => {
          console.error(`[Prisma] Erreur ${operation} sur ${model}:`, error)
          throw error
        })
      },
    },
  }) as unknown as PrismaClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Toujours cacher en serverless (évite trop de connexions en prod Vercel)
globalForPrisma.prisma = prisma

export default prisma
