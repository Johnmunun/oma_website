/**
 * Détecte si les tables RBAC ne sont pas encore migrées en base.
 */
export function isRbacSchemaMissingError(error: unknown): boolean {
  const err = error as { code?: string; message?: string }
  const msg = (err?.message || '').toLowerCase()

  return (
    err?.code === 'P2021' ||
    err?.code === 'P2022' ||
    msg.includes('structuremembership') ||
    msg.includes('does not exist') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  )
}

/**
 * Client Prisma non régénéré après migration schéma (ex. champ isRoot).
 * Permet le fallback legacy jusqu'au redémarrage du serveur.
 */
export function isPrismaClientOutdatedError(error: unknown): boolean {
  const err = error as { name?: string; message?: string; clientVersion?: string }
  const msg = (err?.message || '').toLowerCase()
  return (
    err?.name === 'PrismaClientValidationError' ||
    msg.includes('unknown field') ||
    msg.includes('unknown argument') ||
    msg.includes('landingservices') ||
    msg.includes('landingservice') ||
    msg.includes('invalid `prisma.')
  )
}

export function isAuthzRecoverableError(error: unknown): boolean {
  return isRbacSchemaMissingError(error) || isPrismaClientOutdatedError(error)
}
