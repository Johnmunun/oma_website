import type { PrismaClient } from '@prisma/client'
import { ROOT_ROLE_ID, ROOT_ROLE_SLUG } from './constants'
import { isPrismaClientOutdatedError } from './schema'

export type RoleListItem = {
  id: string
  name: string
  slug: string
  description: string | null
  structureId: string | null
  structure: { id: string; name: string; slug: string } | null
  isSystem: boolean
  isRoot: boolean
  isActive: boolean
  permissionKeys: string[]
  membersCount: number
  createdAt: Date
  updatedAt: Date
}

export function resolveRoleIsRoot(role: {
  id: string
  slug: string
  isRoot?: boolean | null
}): boolean {
  return Boolean(role.isRoot) || role.id === ROOT_ROLE_ID || role.slug === ROOT_ROLE_SLUG
}

export async function listRolesForAdmin(
  prisma: PrismaClient,
  structureId?: string | null
): Promise<RoleListItem[]> {
  const permissionInclude = {
    permissions: {
      include: { permission: { select: { key: true, module: true } } },
    },
    _count: { select: { memberships: true } },
  }

  type RoleRow = {
    id: string
    name: string
    slug: string
    description: string | null
    structureId?: string | null
    isSystem: boolean
    isRoot?: boolean | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    structure?: { id: string; name: string; slug: string } | null
    permissions: Array<{ permission: { key: string; module: string } }>
    _count: { memberships: number }
  }

  let roles: RoleRow[]

  try {
    roles = await prisma.role.findMany({
      where: structureId ? { structureId } : {},
      orderBy: [{ isRoot: 'desc' }, { name: 'asc' }],
      include: {
        ...permissionInclude,
        structure: { select: { id: true, name: true, slug: true } },
      },
    })
  } catch (error) {
    if (!isPrismaClientOutdatedError(error)) throw error
    roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: permissionInclude,
    })
  }

  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    structureId: r.structureId ?? null,
    structure: r.structure ?? null,
    isSystem: r.isSystem,
    isRoot: resolveRoleIsRoot(r),
    isActive: r.isActive,
    permissionKeys: r.permissions.map((rp) => rp.permission.key),
    membersCount: r._count.memberships,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}
