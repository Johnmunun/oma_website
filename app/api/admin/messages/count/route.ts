/**
 * @file app/api/admin/messages/count/route.ts
 * @description Compteur de messages non lus (sidebar), scopé par structure
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/authz/guards'
import { buildMessageWhere, requireMessagesListAccess } from '@/lib/messages/message-scope'

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

    const scopeOrError = await requireMessagesListAccess(session!.user!.id!)
    if (scopeOrError instanceof NextResponse) return scopeOrError
    const scope = scopeOrError

    const where = buildMessageWhere(scope, { isRead: false, isHidden: false })

    try {
      const unreadCount = await prisma.contactMessage.count({ where })
      return NextResponse.json({ success: true, data: { unreadCount } })
    } catch (queryError) {
      if (!isSchemaMismatchError(queryError)) throw queryError

      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "ContactMessage"
          ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false
        `)
        const unreadCount = await prisma.contactMessage.count({ where })
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
  } catch (error: unknown) {
    console.error('[API] Erreur GET messages count:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du compteur',
        details: error instanceof Error ? error.message : null,
      },
      { status: 500 }
    )
  }
}
