/**
 * @file app/api/admin/messages/route.ts
 * @description API routes pour gérer les messages de contact
 * GET: Récupère les messages (avec filtres)
 * PATCH: Marque un message comme lu/non lu
 * PROTÉGÉ : Requiert session NextAuth
 *
 * Note: fallback SQL si la colonne isHidden n'existe pas encore en production
 * (Prisma sélectionne toujours tous les champs → findMany échoue sans la colonne)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/authz/guards'
import {
  buildMessageWhere,
  requireMessagesListAccess,
  requireMessageMutationAccess,
} from '@/lib/messages/message-scope'

type MessageRow = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  structureId?: string | null
  isRead: boolean
  readAt: Date | null
  isHidden?: boolean
  createdAt: Date
}

function getErrorMeta(error: unknown) {
  const err = error as {
    code?: string
    message?: string
    meta?: unknown
    name?: string
  }
  return {
    code: err?.code,
    message: err?.message || String(error),
    meta: err?.meta,
    name: err?.name,
  }
}

function isSchemaMismatchError(error: unknown): boolean {
  const { code, message } = getErrorMeta(error)
  const msg = (message || '').toLowerCase()
  return (
    code === 'P2022' ||
    code === 'P2021' ||
    msg.includes('ishidden') ||
    msg.includes('does not exist') ||
    (msg.includes('column') && msg.includes('contactmessage'))
  )
}

async function ensureIsHiddenColumn(): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ContactMessage"
      ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false
    `)
    return true
  } catch (error) {
    console.warn('[API] Impossible d\'ajouter isHidden automatiquement:', getErrorMeta(error))
    return false
  }
}

async function fetchMessagesRaw(options: {
  isRead?: boolean
  limit: number
  offset: number
}): Promise<{ messages: MessageRow[]; total: number; unreadCount: number }> {
  const conditions: string[] = []
  const params: unknown[] = []

  if (typeof options.isRead === 'boolean') {
    params.push(options.isRead)
    conditions.push(`"isRead" = $${params.length}`)
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  params.push(options.limit)
  const limitIdx = params.length
  params.push(options.offset)
  const offsetIdx = params.length

  const messages = await prisma.$queryRawUnsafe<MessageRow[]>(
    `
      SELECT
        id,
        name,
        email,
        subject,
        message,
        "isRead",
        "readAt",
        "createdAt"
      FROM "ContactMessage"
      ${whereSql}
      ORDER BY "createdAt" DESC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx}
    `,
    ...params
  )

  const totalRows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::bigint AS count FROM "ContactMessage" ${whereSql}`,
    ...params.slice(0, conditions.length)
  )

  const unreadRows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::bigint AS count FROM "ContactMessage" WHERE "isRead" = false`
  )

  return {
    messages: (messages || []).map((m) => ({ ...m, isHidden: false })),
    total: Number(totalRows?.[0]?.count ?? 0),
    unreadCount: Number(unreadRows?.[0]?.count ?? 0),
  }
}

// GET /api/admin/messages
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const authError = requireAuth(session)
    if (authError) return authError

    const scopeOrError = await requireMessagesListAccess(session!.user!.id!)
    if (scopeOrError instanceof NextResponse) return scopeOrError
    const scope = scopeOrError

    const { searchParams } = new URL(request.url)
    const isReadParam = searchParams.get('isRead')
    const structureFilter = searchParams.get('structureId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)
    const offset = parseInt(searchParams.get('offset') || '0', 10) || 0
    const isReadFilter =
      isReadParam === 'true' || isReadParam === 'false'
        ? isReadParam === 'true'
        : undefined

    let structureIdFilter: string | null | undefined
    if (structureFilter === '__oma__') {
      structureIdFilter = null
    } else if (structureFilter && scope.canViewAll) {
      structureIdFilter = structureFilter
    } else if (structureFilter && !scope.canViewAll) {
      if (!scope.structureIds.includes(structureFilter)) {
        return NextResponse.json(
          { success: false, error: 'Accès refusé à cette structure' },
          { status: 403 }
        )
      }
      structureIdFilter = structureFilter
    }

    const where = buildMessageWhere(scope, {
      isRead: isReadFilter,
      isHidden: false,
      structureId: structureIdFilter,
    })

    try {
      const [messages, total, unreadCount, structures] = await Promise.all([
        prisma.contactMessage.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            structure: { select: { id: true, name: true } },
          },
        }),
        prisma.contactMessage.count({ where }),
        prisma.contactMessage.count({
          where: buildMessageWhere(scope, { isRead: false, isHidden: false }),
        }),
        scope.canViewAll
          ? prisma.structure.findMany({
              where: { isActive: true },
              select: { id: true, name: true },
              orderBy: { name: 'asc' },
            })
          : Promise.resolve(undefined),
      ])

      return NextResponse.json({
        success: true,
        data: {
          messages: messages ?? [],
          total,
          unreadCount,
          limit,
          offset,
          canViewAll: scope.canViewAll,
          structures: structures ?? [],
        },
      })
    } catch (queryError) {
      console.error('[API] Erreur Prisma messages:', getErrorMeta(queryError))

      if (!isSchemaMismatchError(queryError)) {
        throw queryError
      }

      // Tenter d'ajouter la colonne manquante, puis rejouer via Prisma
      const columnAdded = await ensureIsHiddenColumn()
      if (columnAdded) {
        try {
          const [messages, total, unreadCount, structures] = await Promise.all([
            prisma.contactMessage.findMany({
              where,
              orderBy: { createdAt: 'desc' },
              take: limit,
              skip: offset,
              include: {
                structure: { select: { id: true, name: true } },
              },
            }),
            prisma.contactMessage.count({ where }),
            prisma.contactMessage.count({
              where: buildMessageWhere(scope, { isRead: false, isHidden: false }),
            }),
            scope.canViewAll
              ? prisma.structure.findMany({
                  where: { isActive: true },
                  select: { id: true, name: true },
                  orderBy: { name: 'asc' },
                })
              : Promise.resolve(undefined),
          ])

          return NextResponse.json({
            success: true,
            data: {
              messages: messages ?? [],
              total,
              unreadCount,
              limit,
              offset,
              canViewAll: scope.canViewAll,
              structures: structures ?? [],
            },
          })
        } catch (retryError) {
          console.warn('[API] Retry Prisma après ALTER échoué:', getErrorMeta(retryError))
        }
      }

      // Fallback SQL sans isHidden (ancienne DB)
      console.warn('[API] Fallback SQL ContactMessage sans isHidden')
      const raw = await fetchMessagesRaw({
        isRead: isReadFilter,
        limit,
        offset,
      })

      return NextResponse.json({
        success: true,
        data: {
          messages: raw.messages,
          total: raw.total,
          unreadCount: raw.unreadCount,
          limit,
          offset,
        },
      })
    }
  } catch (error) {
    const meta = getErrorMeta(error)
    console.error('[API] Erreur GET messages:', meta)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des messages',
        details: meta.message,
        code: meta.code || null,
      },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/messages?id=...
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')
    const body = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'ID du message requis' },
        { status: 400 }
      )
    }

    const access = await requireMessageMutationAccess(messageId, 'messages.update')
    if (!access.ok) return access.response

    const updateData: Prisma.ContactMessageUpdateInput = {}
    if (typeof body.isRead === 'boolean') {
      updateData.isRead = body.isRead
      updateData.readAt = body.isRead ? new Date() : null
    }
    if (typeof body.isHidden === 'boolean') {
      updateData.isHidden = body.isHidden
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      )
    }

    try {
      const message = await prisma.contactMessage.update({
        where: { id: messageId },
        data: updateData,
        include: {
          structure: { select: { id: true, name: true } },
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Message mis à jour',
        data: message,
      })
    } catch (updateError) {
      if (isSchemaMismatchError(updateError)) {
        await ensureIsHiddenColumn()

        // Mise à jour via SQL si Prisma échoue encore sur isHidden
        if (typeof body.isHidden === 'boolean') {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "ContactMessage" SET "isHidden" = $1 WHERE id = $2::uuid`,
              body.isHidden,
              messageId
            )
          } catch {
            // colonne toujours absente : ignorer isHidden
          }
        }

        if (typeof body.isRead === 'boolean') {
          await prisma.$executeRawUnsafe(
            `UPDATE "ContactMessage" SET "isRead" = $1, "readAt" = $2 WHERE id = $3::uuid`,
            body.isRead,
            body.isRead ? new Date() : null,
            messageId
          )
        }

        const rows = await prisma.$queryRawUnsafe<MessageRow[]>(
          `SELECT id, name, email, subject, message, "isRead", "readAt", "createdAt"
           FROM "ContactMessage" WHERE id = $1::uuid LIMIT 1`,
          messageId
        )

        return NextResponse.json({
          success: true,
          message: 'Message mis à jour',
          data: rows?.[0] ? { ...rows[0], isHidden: body.isHidden ?? false } : null,
        })
      }
      throw updateError
    }
  } catch (error) {
    const meta = getErrorMeta(error)
    console.error('[API] Erreur PATCH message:', meta)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du message',
        details: meta.message,
        code: meta.code || null,
      },
      { status: 500 }
    )
  }
}
