import 'server-only'

import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { authorize } from './authorize'
import { requireAuth } from './guards'
import type { PermissionKey } from './permissions-catalog'

export type PermissionSession = Session & { user: { id: string; role?: string | null } }

/**
 * Vérifie session + permission RBAC (avec fallback legacy).
 * Retourne la session ou une NextResponse d'erreur.
 */
export async function requirePermission(
  permission: PermissionKey | string,
  options?: { structureId?: string | null }
): Promise<PermissionSession | NextResponse> {
  const session = await auth()
  const authError = requireAuth(session)
  if (authError) return authError

  const userSession = session as PermissionSession
  const result = await authorize({
    userId: userSession.user.id,
    permission,
    structureId: options?.structureId,
    legacyRole: userSession.user.role ?? null,
  })

  if (!result.allowed) {
    return NextResponse.json(
      { success: false, error: 'Accès refusé', reason: result.reason },
      { status: 403 }
    )
  }

  return userSession
}

export function isPermissionDenied(
  value: PermissionSession | NextResponse
): value is NextResponse {
  return value instanceof NextResponse
}
