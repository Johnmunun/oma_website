import type { UserRole } from '@prisma/client'
import { ALL_PERMISSION_KEYS } from './permissions-catalog'
import { hasPermissionInSet } from './permission-aliases'

/**
 * Mapping legacy User.role → permissions (transition uniquement).
 * Sera retiré quand tous les utilisateurs auront des memberships RBAC.
 */
const LEGACY_ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  ADMIN: ALL_PERMISSION_KEYS,
  EDITOR: ALL_PERMISSION_KEYS.filter(
    (k) =>
      !k.startsWith('users.') &&
      !k.startsWith('roles.') &&
      !k.startsWith('permissions.') &&
      !k.startsWith('structures.') &&
      k !== 'settings.update'
  ),
  VIEWER: ['stats.view'],
}

export function legacyRoleHasPermission(role: UserRole, permission: string): boolean {
  const allowed = LEGACY_ROLE_PERMISSIONS[role]
  if (!allowed) return false
  return hasPermissionInSet(new Set(allowed), permission)
}

export function isEditorOrAdminRole(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'EDITOR'
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN'
}

/** Permissions effectives selon User.role legacy (transition) */
export function getLegacyPermissions(role: UserRole): readonly string[] {
  return LEGACY_ROLE_PERMISSIONS[role] ?? []
}
