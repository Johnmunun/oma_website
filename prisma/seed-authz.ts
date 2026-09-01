/**
 * @file prisma/seed-authz.ts
 * @description Seed RBAC ERP : catalogue permissions + rôle ROOT uniquement
 */

import {
  PrismaClient,
  StructureStatus,
  StructureType,
  UserRole,
} from '@prisma/client'
import { ALL_PERMISSION_KEYS, PERMISSIONS_CATALOG } from '../lib/authz/permissions-catalog'
import {
  OMA_STRUCTURE_ID,
  ROOT_ROLE_ID,
  ROOT_ROLE_SLUG,
  LEGACY_ROLE_SLUGS,
} from '../lib/authz/constants'

export async function seedAuthz(prisma: PrismaClient) {
  console.log('🔐 Seed RBAC (ERP)...')

  for (const perm of PERMISSIONS_CATALOG) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        module: perm.module,
        description: perm.description,
        isSystem: true,
      },
      create: {
        key: perm.key,
        module: perm.module,
        description: perm.description,
        isSystem: true,
      },
    })
  }
  console.log(`   ✅ ${PERMISSIONS_CATALOG.length} permissions`)

  const allPerms = await prisma.permission.findMany()
  const permByKey = new Map(allPerms.map((p) => [p.key, p.id]))

  // ── ROOT : seul rôle système précréé ──
  await prisma.role.upsert({
    where: { id: ROOT_ROLE_ID },
    update: {
      name: 'ROOT',
      slug: ROOT_ROLE_SLUG,
      description: 'Rôle technique suprême — tous les droits, non supprimable',
      isSystem: true,
      isRoot: true,
      isActive: true,
      structureId: null,
    },
    create: {
      id: ROOT_ROLE_ID,
      name: 'ROOT',
      slug: ROOT_ROLE_SLUG,
      description: 'Rôle technique suprême — tous les droits, non supprimable',
      isSystem: true,
      isRoot: true,
      isActive: true,
      structureId: null,
    },
  })

  for (const key of ALL_PERMISSION_KEYS) {
    const permissionId = permByKey.get(key)
    if (!permissionId) continue
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: ROOT_ROLE_ID, permissionId } },
      update: {},
      create: { roleId: ROOT_ROLE_ID, permissionId },
    })
  }
  console.log('   ✅ Rôle ROOT (toutes permissions)')

  // Désactiver les anciens rôles seed (ne pas supprimer — données existantes)
  await prisma.role.updateMany({
    where: {
      slug: {
        in: [
          LEGACY_ROLE_SLUGS.SUPER_ADMIN,
          LEGACY_ROLE_SLUGS.CONTENT_EDITOR,
          LEGACY_ROLE_SLUGS.VIEWER,
        ],
      },
      isRoot: false,
    },
    data: { isActive: false, isSystem: false },
  })

  // Structure mère OMA
  await prisma.structure.upsert({
    where: { id: OMA_STRUCTURE_ID },
    update: {
      name: 'Réseau OMA',
      slug: 'oma',
      type: StructureType.OMA_INTERNAL,
      description: 'Structure mère du réseau OMA',
      status: StructureStatus.ACTIVE,
      isActive: true,
    },
    create: {
      id: OMA_STRUCTURE_ID,
      name: 'Réseau OMA',
      slug: 'oma',
      type: StructureType.OMA_INTERNAL,
      description: 'Structure mère du réseau OMA',
      status: StructureStatus.ACTIVE,
      isActive: true,
    },
  })
  console.log('   ✅ Structure OMA')

  // Migrer les administrateurs vers ROOT
  const adminUsers = await prisma.user.findMany({
    where: { OR: [{ role: UserRole.ADMIN }, { isRoot: true }] },
    select: { id: true, email: true },
  })

  let rootCount = 0
  for (const user of adminUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isRoot: true },
    })

    await prisma.structureMembership.upsert({
      where: {
        userId_structureId_roleId: {
          userId: user.id,
          structureId: OMA_STRUCTURE_ID,
          roleId: ROOT_ROLE_ID,
        },
      },
      update: { isActive: true },
      create: {
        userId: user.id,
        structureId: OMA_STRUCTURE_ID,
        roleId: ROOT_ROLE_ID,
        isActive: true,
      },
    })
    rootCount++
  }
  console.log(`   ✅ ${rootCount} utilisateur(s) ROOT`)
}
