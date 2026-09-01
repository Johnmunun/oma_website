import type { PermissionKey } from './permissions-catalog'

export type AuthorizeResult =
  | { allowed: true; source: 'membership' | 'legacy' | 'root' }
  | { allowed: false; reason: string }

export interface AuthorizeParams {
  userId: string
  permission: PermissionKey | string
  structureId?: string | null
  /** Rôle JWT / session — fallback si pas de membership */
  legacyRole?: string | null
}
