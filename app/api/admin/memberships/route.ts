/**
 * @file app/api/admin/memberships/route.ts
 * @description Attribution de rôles aux utilisateurs (multi-rôles par structure)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { assertCanAssignRole } from '@/lib/authz/escalation-guard'

const assignSchema = z.object({
  userId: z.string().uuid(),
  structureId: z.string().uuid(),
  roleId: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('users.view')
    if (isPermissionDenied(session)) return session

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const structureId = searchParams.get('structureId')

    const memberships = await prisma.structureMembership.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(structureId ? { structureId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        structure: { select: { id: true, name: true, slug: true } },
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: memberships })
  } catch (error) {
    console.error('[API] Erreur GET memberships:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des attributions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('users.assign-roles')
    if (isPermissionDenied(session)) return session

    const data = assignSchema.parse(await request.json())

    const escalation = await assertCanAssignRole(
      session,
      data.roleId,
      data.structureId
    )
    if (!escalation.ok) {
      return NextResponse.json(
        { success: false, error: escalation.reason },
        { status: 403 }
      )
    }

    const membership = await prisma.structureMembership.upsert({
      where: {
        userId_structureId_roleId: {
          userId: data.userId,
          structureId: data.structureId,
          roleId: data.roleId,
        },
      },
      update: { isActive: true },
      create: {
        userId: data.userId,
        structureId: data.structureId,
        roleId: data.roleId,
        isActive: true,
      },
      include: {
        role: { select: { name: true, slug: true } },
        structure: { select: { name: true, slug: true } },
        user: { select: { email: true, name: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'membership.assign',
        target: 'StructureMembership',
        payload: data,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Rôle attribué avec succès',
      data: membership,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur POST memberships:', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'attribution du rôle" },
      { status: 500 }
    )
  }
}
