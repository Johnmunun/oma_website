// ============================================
// API ROUTE: ADMIN ÉVÉNEMENT SPÉCIFIQUE
// ============================================
// Gère les opérations sur un événement spécifique (GET, PUT, DELETE)
// Protégé par middleware NextAuth

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { z } from "zod"

// Schéma de validation pour modifier un événement
const eventUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional(),
  imageUrl: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDesc: z.string().nullable().optional(),
  showOnBanner: z.boolean().optional(),
})

// GET /api/admin/events/[id]
// Récupère un événement spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          select: { id: true },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Événement non trouvé" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        type: event.type,
        status: event.status,
        imageUrl: event.imageUrl,
        location: event.location,
        startsAt: event.startsAt?.toISOString() || null,
        endsAt: event.endsAt?.toISOString() || null,
        metaTitle: event.metaTitle,
        metaDesc: event.metaDesc,
        showOnBanner: event.showOnBanner,
        registrations: event.registrations.length,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("[API] Erreur GET admin event:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de l'événement" },
      { status: 500 },
    )
  }
}

// PUT /api/admin/events/[id]
// Met à jour un événement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Valider les données
    const validatedData = eventUpdateSchema.parse(body)

    // Vérifier que l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: "Événement non trouvé" },
        { status: 404 },
      )
    }

    // Vérifier l'unicité du slug si modifié
    if (validatedData.slug && validatedData.slug !== existingEvent.slug) {
      const slugExists = await prisma.event.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "Ce slug est déjà utilisé" },
          { status: 400 },
        )
      }
    }

    // Mettre à jour l'événement
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.slug && { slug: validatedData.slug }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.type !== undefined && { type: validatedData.type }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.imageUrl !== undefined && { imageUrl: validatedData.imageUrl }),
        ...(validatedData.location !== undefined && { location: validatedData.location }),
        ...(validatedData.startsAt !== undefined && {
          startsAt: validatedData.startsAt ? new Date(validatedData.startsAt) : null,
        }),
        ...(validatedData.endsAt !== undefined && {
          endsAt: validatedData.endsAt ? new Date(validatedData.endsAt) : null,
        }),
        ...(validatedData.metaTitle !== undefined && { metaTitle: validatedData.metaTitle }),
        ...(validatedData.metaDesc !== undefined && { metaDesc: validatedData.metaDesc }),
        ...(validatedData.showOnBanner !== undefined && { showOnBanner: validatedData.showOnBanner }),
      },
      include: {
        registrations: {
          select: { id: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        slug: updatedEvent.slug,
        description: updatedEvent.description,
        type: updatedEvent.type,
        status: updatedEvent.status,
        imageUrl: updatedEvent.imageUrl,
        location: updatedEvent.location,
        startsAt: updatedEvent.startsAt?.toISOString() || null,
        endsAt: updatedEvent.endsAt?.toISOString() || null,
        metaTitle: updatedEvent.metaTitle,
        metaDesc: updatedEvent.metaDesc,
        showOnBanner: updatedEvent.showOnBanner,
        registrations: updatedEvent.registrations.length,
        createdAt: updatedEvent.createdAt.toISOString(),
        updatedAt: updatedEvent.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 },
      )
    }
    console.error("[API] Erreur PUT admin event:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de l'événement" },
      { status: 500 },
    )
  }
}

// DELETE /api/admin/events/[id]
// Supprime un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Événement non trouvé" },
        { status: 404 },
      )
    }

    // Supprimer l'événement (les inscriptions seront supprimées en cascade)
    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Événement supprimé avec succès",
    })
  } catch (error) {
    console.error("[API] Erreur DELETE admin event:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de l'événement" },
      { status: 500 },
    )
  }
}

