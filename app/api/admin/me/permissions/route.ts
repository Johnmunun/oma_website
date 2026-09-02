/**
 * @file app/api/admin/me/permissions/route.ts
 * @description Permissions effectives de l'utilisateur connecté (pour l'UI admin)
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAggregatedEffectivePermissions } from '@/lib/authz/get-effective-permissions'
import { getLegacyPermissions } from '@/lib/authz/legacy'
import { ALL_PERMISSION_KEYS } from '@/lib/authz/permissions-catalog'
import type { UserRole } from '@prisma/client'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const effective = await getAggregatedEffectivePermissions(session.user.id)

    if (effective.isRoot) {
      return NextResponse.json({
        success: true,
        data: {
          isRoot: true,
          permissions: ALL_PERMISSION_KEYS,
          source: 'root',
        },
      })
    }

    if (effective.permissions.size > 0) {
      return NextResponse.json({
        success: true,
        data: {
          isRoot: false,
          permissions: Array.from(effective.permissions),
          source: 'membership',
        },
      })
    }

    const legacyRole = (session.user.role ?? 'EDITOR') as UserRole
    return NextResponse.json({
      success: true,
      data: {
        isRoot: legacyRole === 'ADMIN',
        permissions: [...getLegacyPermissions(legacyRole)],
        source: 'legacy',
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET me/permissions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des permissions' },
      { status: 500 }
    )
  }
}
