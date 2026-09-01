import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import type { UserRole } from '@prisma/client'
import { isAdminRole, isEditorOrAdminRole } from './legacy'

type GuardResponse = NextResponse | null

/** 401 si pas de session */
export function requireAuth(session: Session | null): GuardResponse {
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Non authentifié' },
      { status: 401 }
    )
  }
  return null
}

/** 403 si rôle VIEWER (ou autre) — aligné sur le comportement admin actuel */
export function requireEditorOrAdmin(session: Session): GuardResponse {
  const role = session.user.role as UserRole
  if (!isEditorOrAdminRole(role)) {
    return NextResponse.json(
      { success: false, error: 'Accès refusé' },
      { status: 403 }
    )
  }
  return null
}

/** 403 si pas ADMIN */
export function requireAdmin(session: Session): GuardResponse {
  const role = session.user.role as UserRole
  if (!isAdminRole(role)) {
    return NextResponse.json(
      { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent effectuer cette action.' },
      { status: 403 }
    )
  }
  return null
}
