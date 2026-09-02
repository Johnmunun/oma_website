/**
 * @file app/api/admin/structures/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { isPrismaClientOutdatedError } from '@/lib/authz/schema'
import {
  createStructureSchema,
  normalizeOptionalUrl,
  normalizeThemeColor,
} from '@/lib/structures/structure-schema'
import {
  isStructureParentCycle,
  listStructuresForAdmin,
  normalizeOptionalString,
} from '@/lib/structures/structure-queries'
import { syncStructureLandingServices } from '@/lib/structures/sync-landing-services'

export async function GET() {
  try {
    const session = await requirePermission('structures.view')
    if (isPermissionDenied(session)) return session

    let structures
    try {
      structures = await listStructuresForAdmin(prisma)
    } catch (error) {
      if (!isPrismaClientOutdatedError(error)) throw error
      structures = await prisma.structure.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { memberships: true, roles: true } },
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

    if (data.parentId) {
      const parent = await prisma.structure.findUnique({ where: { id: data.parentId } })
      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Structure parente introuvable' },
          { status: 400 }
        )
      }
    }

    const subdomain = normalizeOptionalString(data.subdomain)
    if (subdomain) {
      const subTaken = await prisma.structure.findFirst({ where: { subdomain } })
      if (subTaken) {
        return NextResponse.json(
          { success: false, error: 'Ce sous-domaine est déjà utilisé' },
          { status: 409 }
        )
      }
    }

    const structure = await prisma.structure.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description ?? null,
        logoUrl: normalizeOptionalUrl(data.logoUrl),
        status: data.status,
        parentId: data.parentId ?? null,
        expertiseDomainId: data.expertiseDomainId ?? null,
        showOnLanding: data.showOnLanding,
        landingOrder: data.landingOrder,
        landingPagePath: normalizeOptionalString(data.landingPagePath),
        landingHeroTitle: normalizeOptionalString(data.landingHeroTitle),
        landingHeroHighlight: normalizeOptionalString(data.landingHeroHighlight),
        landingHeroSubtitle: normalizeOptionalString(data.landingHeroSubtitle),
        landingThemeColor: normalizeThemeColor(data.landingThemeColor),
        landingServicesIntro: normalizeOptionalString(data.landingServicesIntro),
        publicUrl: normalizeOptionalUrl(data.publicUrl),
        domain: normalizeOptionalString(data.domain),
        subdomain,
        isActive: data.status === 'ACTIVE',
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        expertiseDomain: { select: { id: true, name: true, slug: true } },
      },
    })

    await syncStructureLandingServices(prisma, structure.id, data.landingServices)

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'structure.create',
        target: 'Structure',
        payload: { id: structure.id, name: structure.name, slug: structure.slug },
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
