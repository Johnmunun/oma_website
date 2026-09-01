import { describe, expect, it } from 'vitest'
import {
  isAdminRole,
  isEditorOrAdminRole,
  legacyRoleHasPermission,
} from '../legacy'
import { hasPermissionInSet } from '../permission-aliases'

describe('legacy RBAC', () => {
  it('grants users.manage only to ADMIN', () => {
    expect(legacyRoleHasPermission('ADMIN', 'users.manage')).toBe(true)
    expect(legacyRoleHasPermission('EDITOR', 'users.manage')).toBe(false)
    expect(legacyRoleHasPermission('VIEWER', 'users.manage')).toBe(false)
  })

  it('allows EDITOR to view settings but not update', () => {
    expect(legacyRoleHasPermission('EDITOR', 'settings.view')).toBe(true)
    expect(legacyRoleHasPermission('EDITOR', 'settings.update')).toBe(false)
  })

  it('restricts VIEWER to stats.view', () => {
    expect(legacyRoleHasPermission('VIEWER', 'stats.view')).toBe(true)
    expect(legacyRoleHasPermission('VIEWER', 'events.view')).toBe(false)
  })

  it('identifies editor/admin roles', () => {
    expect(isEditorOrAdminRole('ADMIN')).toBe(true)
    expect(isEditorOrAdminRole('EDITOR')).toBe(true)
    expect(isEditorOrAdminRole('VIEWER')).toBe(false)
    expect(isAdminRole('ADMIN')).toBe(true)
    expect(isAdminRole('EDITOR')).toBe(false)
  })

  it('grants events permissions to ADMIN and EDITOR via alias', () => {
    expect(legacyRoleHasPermission('EDITOR', 'events.manage')).toBe(true)
    expect(legacyRoleHasPermission('EDITOR', 'events.create')).toBe(true)
    expect(legacyRoleHasPermission('VIEWER', 'events.view')).toBe(false)
  })
})

describe('permission aliases', () => {
  it('resolves broad alias from granular permissions', () => {
    const perms = new Set(['events.create', 'events.update'])
    expect(hasPermissionInSet(perms, 'events.manage')).toBe(true)
  })

  it('resolves granular from broad alias', () => {
    const perms = new Set(['events.manage'])
    expect(hasPermissionInSet(perms, 'events.create')).toBe(true)
  })
})
