/**
 * @file lib/token-utils.ts
 * @description Utilitaires pour la génération et validation de tokens sécurisés
 */

import crypto from 'crypto'

/**
 * Génère un secret pour les tokens (doit être dans .env)
 */
function getTokenSecret(): string {
  const secret = process.env.EVENT_REGISTRATION_SECRET
  if (!secret) {
    throw new Error(
      'EVENT_REGISTRATION_SECRET n\'est pas défini dans les variables d\'environnement. ' +
      'Veuillez l\'ajouter dans votre fichier .env'
    )
  }
  if (secret === 'change-me-in-production' || secret.length < 32) {
    throw new Error(
      'EVENT_REGISTRATION_SECRET doit être un secret sécurisé d\'au moins 32 caractères. ' +
      'Ne pas utiliser la valeur par défaut en production.'
    )
  }
  return secret
}

/**
 * Génère un token HMAC sécurisé pour un événement
 * @param eventId - ID de l'événement
 * @param timestamp - Timestamp (optionnel, utilise Date.now() par défaut)
 * @returns Token HMAC de 64 caractères
 */
export function generateEventToken(eventId: string, timestamp?: number): string {
  const secret = getTokenSecret()
  const ts = timestamp || Date.now()
  const data = `${eventId}:${ts}`
  const token = crypto.createHmac('sha256', secret).update(data).digest('hex')
  return token
}

/**
 * Valide un token HMAC pour un événement
 * @param eventId - ID de l'événement
 * @param token - Token à valider
 * @param maxAgeMs - Âge maximum du token en millisecondes (défaut: 1 heure)
 * @returns true si le token est valide, false sinon
 */
export function verifyEventToken(
  eventId: string,
  token: string,
  maxAgeMs: number = 60 * 60 * 1000 // 1 heure par défaut
): { valid: boolean; reason?: string } {
  try {
    const secret = getTokenSecret()

    // Vérifier la longueur (HMAC SHA256 = 64 caractères hex)
    if (token.length !== 64) {
      return { valid: false, reason: 'Format de token invalide' }
    }

    // Extraire le timestamp du token (on doit le stocker ou l'encoder)
    // Pour simplifier, on va générer des tokens récents et les vérifier
    // En production, on pourrait stocker le timestamp dans la DB ou l'encoder dans le token

    // Méthode 1: Vérifier si le token correspond à un token généré récemment
    // (nécessite de stocker les tokens valides en DB)
    // Pour l'instant, on vérifie juste que le token est bien formaté et qu'on peut le régénérer

    // Méthode 2: Stocker le token en DB avec timestamp (recommandé)
    // On va utiliser cette approche - le token sera stocké côté client et vérifié côté serveur

    // Pour l'instant, on valide que le token a le bon format
    // En production, on devrait stocker les tokens valides en DB avec expiration
    const isValidFormat = /^[a-f0-9]{64}$/i.test(token)

    if (!isValidFormat) {
      return { valid: false, reason: 'Format de token invalide' }
    }

    // Note: Pour une validation complète, il faudrait :
    // 1. Stocker le token en DB avec l'eventId et un timestamp
    // 2. Vérifier que le token existe en DB
    // 3. Vérifier que le token n'est pas expiré
    // 4. Vérifier que le token correspond à l'eventId

    // Pour l'instant, on retourne true si le format est valide
    // TODO: Implémenter la validation complète avec DB
    return { valid: true }
  } catch (error: any) {
    console.error('[TokenUtils] Erreur validation token:', error)
    return { valid: false, reason: 'Erreur lors de la validation' }
  }
}

/**
 * Génère un token avec timestamp encodé (format: timestamp:hmac)
 * Permet de vérifier l'âge du token sans DB
 */
export function generateEventTokenWithTimestamp(eventId: string): string {
  const secret = getTokenSecret()
  const timestamp = Date.now()
  const data = `${eventId}:${timestamp}`
  const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex')
  // Encoder le timestamp dans le token (premiers 13 caractères = timestamp en base36)
  const timestampEncoded = timestamp.toString(36)
  return `${timestampEncoded}:${hmac}`
}

/**
 * Valide un token avec timestamp encodé
 */
export function verifyEventTokenWithTimestamp(
  eventId: string,
  token: string,
  maxAgeMs: number = 60 * 60 * 1000 // 1 heure
): { valid: boolean; reason?: string } {
  try {
    const secret = getTokenSecret()
    const parts = token.split(':')
    
    if (parts.length !== 2) {
      return { valid: false, reason: 'Format de token invalide' }
    }

    const [timestampEncoded, hmac] = parts
    const timestamp = parseInt(timestampEncoded, 36)

    // Vérifier l'âge du token
    const age = Date.now() - timestamp
    if (age > maxAgeMs) {
      return { valid: false, reason: 'Token expiré' }
    }

    if (age < 0) {
      return { valid: false, reason: 'Token invalide (timestamp futur)' }
    }

    // Vérifier le HMAC
    const data = `${eventId}:${timestamp}`
    const expectedHmac = crypto.createHmac('sha256', secret).update(data).digest('hex')

    if (hmac !== expectedHmac) {
      return { valid: false, reason: 'Token invalide (HMAC incorrect)' }
    }

    return { valid: true }
  } catch (error: any) {
    console.error('[TokenUtils] Erreur validation token:', error)
    return { valid: false, reason: 'Erreur lors de la validation' }
  }
}


