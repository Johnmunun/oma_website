/**
 * @file app/api/admin/expertise-domains/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import {
  createExpertiseDomainSchema,
} from '@/lib/expertise/domain-schema'
import { slugifyStructureName } from '@/lib/structures/slug'

export async function GET() {
  try {
    const session = await requirePermission('expertise.view')
    if (isPermissionDenied(session)) return session

    const domains = await prisma.expertiseDomain.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { structures: true } },
      },
    })

    return NextResponse.json({ success: true, data: domains })
  } catch (error) {
    console.error('[API] Erreur GET expertise-domains:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des domaines' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('expertise.create')
    if (isPermissionDenied(session)) return session

    const body = await request.json()
    const data = createExpertiseDomainSchema.parse(body)
    const slug = data.slug || slugifyStructureName(data.name)

    const existing = await prisma.expertiseDomain.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ce slug est déjà utilisé' },
        { status: 409 }
      )
    }

    const domain = await prisma.expertiseDomain.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        iconKey: data.iconKey,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
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
    console.error('[API] Erreur POST expertise-domains:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du domaine' },
      { status: 500 }
    )
  }
}
