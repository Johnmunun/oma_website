/**
 * Alias de permissions pour rétrocompatibilité des routes existantes.
 */
export const BROAD_TO_GRANULAR: Record<string, readonly string[]> = {
  'users.manage': ['users.create', 'users.update', 'users.delete', 'users.assign-roles'],
  'events.manage': ['events.create', 'events.update', 'events.delete', 'events.publish'],
  'messages.manage': ['messages.update', 'messages.delete'],
  'content.manage': ['content.update'],
  'team.manage': ['team.create', 'team.update', 'team.delete'],
  'testimonials.manage': [
    'testimonials.approve',
    'testimonials.reject',
    'testimonials.publish',
    'testimonials.delete',
  ],
  'partners.manage': ['partners.create', 'partners.update', 'partners.delete'],
  'seo.manage': ['seo.update'],
  'newsletter.manage': ['newsletter.export'],
}

const GRANULAR_TO_BROAD: Record<string, string> = {}
for (const [broad, granulars] of Object.entries(BROAD_TO_GRANULAR)) {
  for (const g of granulars) {
    GRANULAR_TO_BROAD[g] = broad
  }
}

export function hasPermissionInSet(
  userPermissions: Set<string>,
  requested: string
): boolean {
  if (userPermissions.has('*')) return true
  if (userPermissions.has(requested)) return true

  const granulars = BROAD_TO_GRANULAR[requested]
  if (granulars?.some((g) => userPermissions.has(g))) return true

  const broad = GRANULAR_TO_BROAD[requested]
  if (broad && userPermissions.has(broad)) return true

  return false
}
