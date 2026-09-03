/**
 * Rôle métier JoyStudio — créé via seed, modifiable depuis /admin/roles
 */
export const JOYSTUDIO_MANAGER_ROLE_ID = '00000000-0000-0000-0000-000000000030'
export const JOYSTUDIO_MANAGER_ROLE_SLUG = 'gestionnaire-joystudio'

/** Permissions opérationnelles du gestionnaire JoyStudio (scope structure) */
export const JOYSTUDIO_MANAGER_PERMISSION_KEYS = [
  'challenges.view',
  'challenges.update',
  'challenges.publish',
  'challenges.settings',
  'candidates.view',
  'candidates.create',
  'candidates.update',
  'candidates.approve',
  'candidates.reject',
  'videos.view',
  'videos.upload',
  'videos.publish',
  'jury.view',
  'jury.create',
  'jury.update',
  'jury.delete',
  'jury.assign',
  'votes.view',
  'live.view',
  'live.update',
  'live.start',
  'live.stop',
  'live.publish',
  'messages.view',
  'messages.update',
] as const

export type JoyStudioManagerPermissionKey = (typeof JOYSTUDIO_MANAGER_PERMISSION_KEYS)[number]
