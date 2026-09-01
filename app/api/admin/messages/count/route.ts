/**
 * @file app/api/admin/messages/count/route.ts
 * @description Compteur de messages non lus (sidebar)
 */

import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireEditorOrAdmin } from '@/lib/authz/guards'

function isSchemaMismatchError(error: unknown): boolean {
  const err = error as { code?: string; message?: string }
  const msg = (err?.message || '').toLowerCase()
  return (
    err?.code === 'P2022' ||
    err?.code === 'P2021' ||
    msg.includes('ishidden') ||
    msg.includes('does not exist')
  )
}

export async function GET() {
  try {
    const session = await auth()
    const authError = requireAuth(session)
    if (authError) return authError
    const roleError = requireEditorOrAdmin(session!)
    if (roleError) return roleError

    try {
      const unreadCount = await prisma.contactMessage.count({
        where: { isRead: false, isHidden: false },
      })
      return NextResponse.json({ success: true, data: { unreadCount } })
    } catch (queryError) {
      if (!isSchemaMismatchError(queryError)) throw queryError

      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "ContactMessage"
          ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false
        `)
        const unreadCount = await prisma.contactMessage.count({
          where: { isRead: false, isHidden: false },
        })
        return NextResponse.json({ success: true, data: { unreadCount } })
      } catch {
        const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
          `SELECT COUNT(*)::bigint AS count FROM "ContactMessage" WHERE "isRead" = false`
        )
        return NextResponse.json({
          success: true,
          data: { unreadCount: Number(rows?.[0]?.count ?? 0) },
        })
      }
    }
  } catch (error: any) {
    console.error('[API] Erreur GET messages count:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du compteur',
        details: error?.message || null,
      },
      { status: 500 }
    )
  }
}
