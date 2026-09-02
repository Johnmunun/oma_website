'use client'

import { useCallback, useEffect, useState } from 'react'
import { hasPermissionInSet } from '@/lib/authz/permission-aliases'

type PermissionsState = {
  permissionKeys: string[]
  isRoot: boolean
  loaded: boolean
}

export function useAdminPermissions() {
  const [state, setState] = useState<PermissionsState>({
    permissionKeys: [],
    isRoot: false,
    loaded: false,
  })

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/me/permissions', { cache: 'no-store' })
      if (!res.ok) {
        setState((s) => ({ ...s, loaded: true }))
        return
      }
      const json = await res.json()
      if (json.success && json.data) {
        setState({
          permissionKeys: Array.isArray(json.data.permissions) ? json.data.permissions : [],
          isRoot: Boolean(json.data.isRoot),
          loaded: true,
        })
      } else {
        setState((s) => ({ ...s, loaded: true }))
      }
    } catch {
      setState((s) => ({ ...s, loaded: true }))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const can = useCallback(
    (permission: string) => {
      if (state.isRoot) return true
      return hasPermissionInSet(new Set(state.permissionKeys), permission)
    },
    [state.isRoot, state.permissionKeys]
  )

  return { ...state, permissions: state.permissionKeys, can, reload: load }
}

/** Permission minimale pour afficher un lien de navigation admin */
export const ADMIN_NAV_PERMISSIONS: Record<string, string | null> = {
  '/admin': 'stats.view',
  '/admin/content': 'content.view',
  '/admin/challenges': 'challenges.view',
  '/admin/events': 'events.view',
  '/admin/team': 'team.view',
  '/admin/users': 'users.view',
  '/admin/roles': 'roles.view',
  '/admin/structures': 'structures.view',
  '/admin/messages': 'messages.view',
  '/admin/testimonials': 'testimonials.view',
  '/admin/newsletter': 'newsletter.view',
  '/admin/media': 'media.view',
  '/admin/partners': 'partners.view',
  '/admin/seo': 'seo.view',
  '/admin/pixels': 'pixels.view',
  '/admin/analytics': 'analytics.view',
  '/admin/settings': 'settings.view',
}
