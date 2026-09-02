export { authorize, can } from './authorize'
export { getEffectivePermissions, getAggregatedEffectivePermissions } from './get-effective-permissions'
export { requirePermission, isPermissionDenied } from './require-permission'
export { requireAuth, requireEditorOrAdmin, requireAdmin } from './guards'
export {
  legacyRoleHasPermission,
  isEditorOrAdminRole,
  isAdminRole,
} from './legacy'
export {
  PERMISSIONS_CATALOG,
  ALL_PERMISSION_KEYS,
  getPermissionsByModule,
  type PermissionKey,
  type PermissionDef,
} from './permissions-catalog'
export { hasPermissionInSet, BROAD_TO_GRANULAR } from './permission-aliases'
export {
  assertCanAssignPermissions,
  assertCanAssignRole,
} from './escalation-guard'
export {
  OMA_STRUCTURE_ID,
  ROOT_ROLE_SLUG,
  ROOT_ROLE_ID,
  LEGACY_ROLE_SLUGS,
} from './constants'
export { isRbacSchemaMissingError, isPrismaClientOutdatedError, isAuthzRecoverableError } from './schema'
