/**
 * @file lib/db-error-handler.ts
 * @description Gestion centralisée des erreurs de base de données
 */

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export interface DBErrorResult {
  isConnectionError: boolean
  isRetryable: boolean
  message: string
  fallbackData?: any
}

/**
 * Vérifie si l'erreur est une erreur de connexion à la base de données
 */
export function isDatabaseConnectionError(error: any): boolean {
  if (!error) return false

  // Erreurs Prisma de connexion
  if (error instanceof PrismaClientKnownRequestError) {
    return error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008'
  }

  // Erreurs de connexion génériques
  const errorMessage = error?.message?.toLowerCase() || ''
  return (
    errorMessage.includes("can't reach database") ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
  )
}

/**
 * Vérifie si l'erreur est réessayable
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false

  // Erreurs de connexion sont généralement réessayables
  if (isDatabaseConnectionError(error)) {
    return true
  }

  // Erreurs Prisma réessayables
  if (error instanceof PrismaClientKnownRequestError) {
    return ['P1001', 'P1002', 'P1008', 'P1017'].includes(error.code)
  }

  return false
}

/**
 * Gère les erreurs de base de données et retourne un résultat structuré
 */
export function handleDatabaseError(error: any, fallbackData?: any): DBErrorResult {
  const isConnection = isDatabaseConnectionError(error)
  const isRetryable = isRetryableError(error)

  let message = 'Erreur de base de données'

  if (isConnection) {
    message = 'Impossible de se connecter à la base de données. Veuillez réessayer plus tard.'
  } else if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        message = 'Erreur de contrainte unique'
        break
      case 'P2025':
        message = 'Enregistrement non trouvé'
        break
      default:
        message = error.message || 'Erreur de base de données'
    }
  } else if (error?.message) {
    message = error.message
  }

  return {
    isConnectionError: isConnection,
    isRetryable,
    message,
    fallbackData,
  }
}

