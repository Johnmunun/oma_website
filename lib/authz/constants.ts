/**
 * Identifiants stables pour le seed RBAC.
 */
export const OMA_STRUCTURE_ID = '00000000-0000-0000-0000-000000000010'

/** Seul rôle système précréé */
export const ROOT_ROLE_SLUG = 'root' as const
export const ROOT_ROLE_ID = '00000000-0000-0000-0000-000000000020'

/** Rôle métier JoyStudio (seed — modifiable depuis l'admin) */
export {
  JOYSTUDIO_MANAGER_ROLE_ID,
  JOYSTUDIO_MANAGER_ROLE_SLUG,
  JOYSTUDIO_MANAGER_PERMISSION_KEYS,
} from './joystudio-manager-role'

/** @deprecated Anciens rôles seed — conservés pour migration uniquement */
export const LEGACY_ROLE_SLUGS = {
  SUPER_ADMIN: 'super-admin',
  CONTENT_EDITOR: 'content-editor',
  VIEWER: 'viewer',
} as const
