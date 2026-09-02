/**
 * @file app/api/admin/structures/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import {
  normalizeOptionalUrl,
  normalizeThemeColor,
  updateStructureSchema,
} from '@/lib/structures/structure-schema'
import {
  isProtectedStructure,
  isStructureParentCycle,
  normalizeOptionalString,
} from '@/lib/structures/structure-queries'
import { syncStructureLandingServices } from '@/lib/structures/sync-landing-services'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('structures.view')
    if (isPermissionDenied(session)) return session

    const { id } = await params
    const structure = await prisma.structure.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        expertiseDomain: { select: { id: true, name: true, slug: true } },
        landingServices: {
          orderBy: { sortOrder: 'asc' },
          select: { title: true, description: true, iconKey: true, sortOrder: true },
        },
        _count: { select: { memberships: true, roles: true, children: true } },
      },
    })

    if (!structure) {
      return NextResponse.json({ success: false, error: 'Structure introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: structure })
  } catch (error) {
    console.error('[API] Erreur GET structure:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la structure' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('structures.update')
    if (isPermissionDenied(session)) return session

    const { id } = await params
    const existing = await prisma.structure.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Structure introuvable' }, { status: 404 })
    }

    const data = updateStructureSchema.parse(await request.json())

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.structure.findUnique({ where: { slug: data.slug } })
      if (slugTaken) {
        return NextResponse.json(
          { success: false, error: 'Ce slug est déjà utilisé' },
          { status: 409 }
        )
      }
    }

    if (data.parentId !== undefined) {
      if (data.parentId === id) {
        return NextResponse.json(
          { success: false, error: 'Une structure ne peut pas être son propre parent' },
          { status: 400 }
        )
      }

      if (isProtectedStructure(id) && data.parentId) {
        return NextResponse.json(
          { success: false, error: 'La structure OMA ne peut pas avoir de parent' },
          { status: 400 }
        )
      }

      if (data.parentId) {
        const parent = await prisma.structure.findUnique({ where: { id: data.parentId } })
        if (!parent) {
          return NextResponse.json(
            { success: false, error: 'Structure parente introuvable' },
            { status: 400 }
          )
        }

        const cycle = await isStructureParentCycle(prisma, id, data.parentId)
        if (cycle) {
          return NextResponse.json(
            { success: false, error: 'Parent invalide (cycle hiérarchique)' },
            { status: 400 }
          )
        }
      }
    }

    const updateData: Record<string, unknown> = {}

    if (data.subdomain !== undefined) {
      const subdomain = normalizeOptionalString(data.subdomain)
      if (subdomain) {
        const subTaken = await prisma.structure.findFirst({
          where: { subdomain, NOT: { id } },
        })
        if (subTaken) {
          return NextResponse.json(
            { success: false, error: 'Ce sous-domaine est déjà utilisé' },
            { status: 409 }
          )
        }
      }
      updateData.subdomain = subdomain
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.type !== undefined) updateData.type = data.type
    if (data.description !== undefined) updateData.description = data.description
    if (data.logoUrl !== undefined) updateData.logoUrl = normalizeOptionalUrl(data.logoUrl)
    if (data.status !== undefined) updateData.status = data.status
    if (data.parentId !== undefined) updateData.parentId = data.parentId
    if (data.expertiseDomainId !== undefined) updateData.expertiseDomainId = data.expertiseDomainId
    if (data.showOnLanding !== undefined) updateData.showOnLanding = data.showOnLanding
    if (data.landingOrder !== undefined) updateData.landingOrder = data.landingOrder
    if (data.landingPagePath !== undefined) {
      updateData.landingPagePath = normalizeOptionalString(data.landingPagePath)
    }
    if (data.publicUrl !== undefined) updateData.publicUrl = normalizeOptionalUrl(data.publicUrl)
    if (data.domain !== undefined) updateData.domain = normalizeOptionalString(data.domain)
    if (data.landingHeroTitle !== undefined) {
      updateData.landingHeroTitle = normalizeOptionalString(data.landingHeroTitle)
    }
    if (data.landingHeroHighlight !== undefined) {
      updateData.landingHeroHighlight = normalizeOptionalString(data.landingHeroHighlight)
    }
    if (data.landingHeroSubtitle !== undefined) {
      updateData.landingHeroSubtitle = normalizeOptionalString(data.landingHeroSubtitle)
    }
    if (data.landingThemeColor !== undefined) {
      updateData.landingThemeColor = normalizeThemeColor(data.landingThemeColor)
    }
    if (data.landingServicesIntro !== undefined) {
      updateData.landingServicesIntro = normalizeOptionalString(data.landingServicesIntro)
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.status !== undefined && data.isActive === undefined) {
      updateData.isActive = data.status === 'ACTIVE'
    }

    const structure = await prisma.structure.update({
      where: { id },
      data: updateData,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        expertiseDomain: { select: { id: true, name: true, slug: true } },
      },
    })

    await syncStructureLandingServices(prisma, id, data.landingServices)

    const structureWithServices = await prisma.structure.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        expertiseDomain: { select: { id: true, name: true, slug: true } },
        landingServices: {
          orderBy: { sortOrder: 'asc' },
          select: { title: true, description: true, iconKey: true, sortOrder: true },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'structure.update',
        target: 'Structure',
        payload: { id: structure.id, changes: data },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Structure mise à jour',
      data: structureWithServices ?? structure,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PUT structure:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la structure' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('structures.delete')
    if (isPermissionDenied(session)) return session

    const { id } = await params

    if (isProtectedStructure(id)) {
      return NextResponse.json(
        { success: false, error: 'La structure OMA ne peut pas être supprimée' },
        { status: 403 }
      )
    }

    const existing = await prisma.structure.findUnique({
      where: { id },
      include: {
        _count: { select: { children: true, memberships: true, roles: true } },
      },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Structure introuvable' }, { status: 404 })
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer une structure avec des structures filles' },
        { status: 409 }
      )
    }

    if (existing._count.memberships > 0 || existing._count.roles > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de supprimer une structure avec des membres ou des rôles associés',
        },
        { status: 409 }
      )
    }

    await prisma.structure.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'structure.delete',
        target: 'Structure',
        payload: { id, name: existing.name },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Structure supprimée',
    })
  } catch (error) {
    console.error('[API] Erreur DELETE structure:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la structure' },
      { status: 500 }
    )
  }
}
