/**
 * @file app/api/admin/expertise-domains/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { updateExpertiseDomainSchema } from '@/lib/expertise/domain-schema'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('expertise.update')
    if (isPermissionDenied(session)) return session

    const { id } = await params
    const existing = await prisma.expertiseDomain.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Domaine introuvable' }, { status: 404 })
    }

    const data = updateExpertiseDomainSchema.parse(await request.json())

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.expertiseDomain.findUnique({ where: { slug: data.slug } })
      if (slugTaken) {
        return NextResponse.json(
          { success: false, error: 'Ce slug est déjà utilisé' },
          { status: 409 }
        )
      }
    }

    const domain = await prisma.expertiseDomain.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.iconKey !== undefined ? { iconKey: data.iconKey } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    })

    return NextResponse.json({ success: true, data: domain })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PUT expertise-domain:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('expertise.delete')
    if (isPermissionDenied(session)) return session

    const { id } = await params
    const existing = await prisma.expertiseDomain.findUnique({
      where: { id },
      include: { _count: { select: { structures: true } } },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Domaine introuvable' }, { status: 404 })
    }

    if (existing._count.structures > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de supprimer un domaine avec des structures associées',
        },
        { status: 409 }
      )
    }

    await prisma.expertiseDomain.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Domaine supprimé' })
  } catch (error) {
    console.error('[API] Erreur DELETE expertise-domain:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
