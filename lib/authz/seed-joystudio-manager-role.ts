import type { PrismaClient } from '@prisma/client'
import {
  JOYSTUDIO_MANAGER_PERMISSION_KEYS,
  JOYSTUDIO_MANAGER_ROLE_ID,
  JOYSTUDIO_MANAGER_ROLE_SLUG,
} from '@/lib/authz/joystudio-manager-role'

const JOYSTUDIO_SLUG = 'joystudio'

async function syncRolePermissions(
  prisma: PrismaClient,
  roleId: string,
  permissionKeys: readonly string[]
) {
  const permissions = await prisma.permission.findMany({
    where: { key: { in: [...permissionKeys] } },
    select: { id: true, key: true },
  })

  const foundKeys = new Set(permissions.map((permission) => permission.key))
  const missing = permissionKeys.filter((key) => !foundKeys.has(key))
  if (missing.length > 0) {
    console.warn(`   ⚠️  Permissions introuvables pour le rôle JoyStudio : ${missing.join(', ')}`)
  }

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId } })
    if (permissions.length === 0) return
    await tx.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId,
        permissionId: permission.id,
      })),
    })
  })
}

export async function seedJoyStudioManagerRole(prisma: PrismaClient) {
  console.log('👤 Seed rôle Gestionnaire JoyStudio...')

  const joystudio = await prisma.structure.findUnique({
    where: { slug: JOYSTUDIO_SLUG },
    select: { id: true, name: true },
  })

  if (!joystudio) {
    console.log('   ⚠️  JoyStudio introuvable — exécutez d’abord seedJoyStudio.')
    return null
  }

  const role = await prisma.role.upsert({
    where: { id: JOYSTUDIO_MANAGER_ROLE_ID },
    update: {
      name: 'Gestionnaire JoyStudio',
      slug: JOYSTUDIO_MANAGER_ROLE_SLUG,
      description:
        'Gère le Challenge Talents Enfants, les candidats, les vidéos et les messages de JoyStudio.',
      structureId: joystudio.id,
      isActive: true,
      isSystem: false,
      isRoot: false,
    },
    create: {
      id: JOYSTUDIO_MANAGER_ROLE_ID,
      name: 'Gestionnaire JoyStudio',
      slug: JOYSTUDIO_MANAGER_ROLE_SLUG,
      description:
        'Gère le Challenge Talents Enfants, les candidats, les vidéos et les messages de JoyStudio.',
      structureId: joystudio.id,
      isActive: true,
      isSystem: false,
      isRoot: false,
    },
  })

  await syncRolePermissions(prisma, role.id, JOYSTUDIO_MANAGER_PERMISSION_KEYS)

  console.log(
    `   ✅ Rôle « ${role.name} » (${JOYSTUDIO_MANAGER_PERMISSION_KEYS.length} permissions, scope ${joystudio.name})`
  )

  return role
}
