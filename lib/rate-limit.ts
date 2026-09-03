/**
 * @file lib/rate-limit.ts
 * @description Rate limiting basé sur la base de données PostgreSQL
 * Alternative à Redis qui fonctionne avec toutes les instances Vercel
 */

import { prisma } from '@/lib/prisma'

export interface RateLimitOptions {
  maxRequests: number // Nombre maximum de requêtes
  windowMs: number // Fenêtre de temps en millisecondes
  keyPrefix?: string // Préfixe pour la clé (ex: "register", "contact")
}

/** Désactivé en local pour faciliter les tests (inscriptions, contact, votes, etc.). */
export function isRateLimitBypassed(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.RATE_LIMIT_DISABLED === 'true'
}

/**
 * Vérifie et incrémente le compteur de rate limiting
 * @param key - Clé unique (ex: IP, email, etc.)
 * @param options - Options de rate limiting
 * @returns true si la requête est autorisée, false si limitée
 */
export async function checkRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const { maxRequests, windowMs, keyPrefix = 'default' } = options
  const resetAt = new Date(Date.now() + windowMs)

  if (isRateLimitBypassed()) {
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt,
    }
  }

  const fullKey = `${keyPrefix}:${key}`
  const now = new Date()

  try {
    // Nettoyer les anciennes entrées (celles dont resetAt est passé)
    await prisma.rateLimit.deleteMany({
      where: {
        resetAt: {
          lt: now,
        },
      },
    })

    // Chercher ou créer l'entrée
    const rateLimit = await prisma.rateLimit.upsert({
      where: { key: fullKey },
      create: {
        key: fullKey,
        count: 1,
        resetAt,
      },
      update: {
        // Si resetAt est passé, réinitialiser
        count: {
          increment: 1,
        },
        resetAt,
      },
    })

    // Si le compteur dépasse la limite, vérifier si on doit réinitialiser
    if (rateLimit.count > maxRequests) {
      // Vérifier si la fenêtre est expirée
      if (rateLimit.resetAt < now) {
        // Réinitialiser
        await prisma.rateLimit.update({
          where: { key: fullKey },
          data: {
            count: 1,
            resetAt,
          },
        })
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetAt,
        }
      }

      // Limite atteinte
      return {
        allowed: false,
        remaining: 0,
        resetAt: rateLimit.resetAt,
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - rateLimit.count),
      resetAt: rateLimit.resetAt,
    }
  } catch (error) {
    // En cas d'erreur DB, autoriser la requête (fail open)
    // Mais logger l'erreur
    console.error('[RateLimit] Erreur:', error)
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt,
    }
  }
}

/**
 * Obtient l'IP du client depuis les headers
 */
export function getClientIP(request: Request): string {
  const headers = request.headers as Headers
  const forwardedFor = headers.get('x-forwarded-for')
  const realIP = headers.get('x-real-ip')
  const cfConnectingIP = headers.get('cf-connecting-ip') // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs, prendre la première
    return forwardedFor.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return 'unknown'
}

/**
 * Configuration par défaut pour différentes routes
 */
export const RATE_LIMIT_CONFIGS = {
  // Inscription aux événements
  eventRegistration: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'event-register',
  },
  // Inscription aux challenges
  challengeRegistration: {
    maxRequests: 3,
    windowMs: 15 * 60 * 1000,
    keyPrefix: 'challenge-register',
  },
  // Vote public challenge
  challengeVote: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    keyPrefix: 'challenge-vote',
  },
  // Chat live challenge (par IP)
  liveChat: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 msg / minute
    keyPrefix: 'live-chat',
  },
  // Formulaire de contact
  contact: {
    maxRequests: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'contact',
  },
  // Newsletter
  newsletter: {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000, // 1 heure
    keyPrefix: 'newsletter',
  },
  // Témoignages
  testimonial: {
    maxRequests: 1,
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
    keyPrefix: 'testimonial',
  },
  // Général (par défaut)
  default: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'default',
  },
} as const


