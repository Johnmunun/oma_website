/**
 * @file app/api/admin/structures/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { StructureStatus, StructureType } from '@prisma/client'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { isPrismaClientOutdatedError } from '@/lib/authz/schema'

const createStructureSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  type: z.nativeEnum(StructureType).default(StructureType.OMA_INTERNAL),
  description: z.string().max(500).optional().nullable(),
  domain: z.string().max(200).optional().nullable(),
  subdomain: z.string().max(100).optional().nullable(),
})

export async function GET() {
  try {
    const session = await requirePermission('structures.view')
    if (isPermissionDenied(session)) return session

    let structures
    try {
      structures = await prisma.structure.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { memberships: true, roles: true } },
        },
      })
    } catch (error) {
      if (!isPrismaClientOutdatedError(error)) throw error
      structures = await prisma.structure.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { memberships: true } },
        },
      })
    }

    return NextResponse.json({ success: true, data: structures })
  } catch (error) {
    console.error('[API] Erreur GET structures:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des structures' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('structures.create')
    if (isPermissionDenied(session)) return session

    const data = createStructureSchema.parse(await request.json())

    const existing = await prisma.structure.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ce slug est déjà utilisé' },
        { status: 409 }
      )
    }

    const structure = await prisma.structure.create({
      data: {
        ...data,
        status: StructureStatus.ACTIVE,
        isActive: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'structure.create',
        target: 'Structure',
        payload: { id: structure.id, name: structure.name },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Structure créée',
      data: structure,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur POST structures:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la structure' },
      { status: 500 }
    )
  }
}
