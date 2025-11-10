// ============================================
// API ROUTE: ADMIN ÉVÉNEMENTS
// ============================================
// Gère les événements côté admin (GET, POST)
// Protégé par middleware NextAuth

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { z } from "zod"

// Schéma de validation pour créer/modifier un événement
const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
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

// GET /api/admin/events
// Récupère tous les événements (avec pagination)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Construire le filtre
    const where: any = {}
    if (status && status !== "all") {
      where.status = status
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ]
    }

    // Récupérer les événements avec le nombre d'inscriptions
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startsAt: "desc" },
        skip,
        take: limit,
        include: {
          registrations: {
            select: { id: true },
          },
        },
      }),
      prisma.event.count({ where }),
    ])

    // Formater les données
    const formattedEvents = events.map((event) => ({
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
    }))

    return NextResponse.json({
      success: true,
      data: formattedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[API] Erreur GET admin events:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des événements" },
      { status: 500 },
    )
  }
}

// POST /api/admin/events
// Crée un nouvel événement
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()

    // Valider les données
    const validatedData = eventSchema.parse(body)

    // Générer un slug unique si non fourni
    let slug = validatedData.slug
    if (!slug) {
      slug = validatedData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    // Vérifier l'unicité du slug
    const existingEvent = await prisma.event.findUnique({
      where: { slug },
    })

    if (existingEvent) {
      slug = `${slug}-${Date.now()}`
    }

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description || null,
        type: validatedData.type || null,
        status: validatedData.status || "DRAFT",
        imageUrl: validatedData.imageUrl || null,
        location: validatedData.location || null,
        startsAt: validatedData.startsAt ? new Date(validatedData.startsAt) : null,
        endsAt: validatedData.endsAt ? new Date(validatedData.endsAt) : null,
        metaTitle: validatedData.metaTitle || null,
        metaDesc: validatedData.metaDesc || null,
        showOnBanner: validatedData.showOnBanner || false,
      },
    })

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
        registrations: 0,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 },
      )
    }
    console.error("[API] Erreur POST admin events:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'événement" },
      { status: 500 },
    )
  }
}

