/**
 * @file app/api/admin/permissions/route.ts
 * @description Catalogue des permissions (lecture seule, groupé par module)
 */

import { NextResponse } from 'next/server'
import {
  getPermissionsByModule,
  PERMISSIONS_CATALOG,
} from '@/lib/authz/permissions-catalog'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'

export async function GET() {
  try {
    const session = await requirePermission('permissions.view')
    if (isPermissionDenied(session)) return session

    return NextResponse.json({
      success: true,
      data: {
        permissions: PERMISSIONS_CATALOG,
        byModule: getPermissionsByModule(),
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET permissions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des permissions' },
      { status: 500 }
    )
  }
}
