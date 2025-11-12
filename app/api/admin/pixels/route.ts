/**
 * API Route pour gérer les pixels de tracking
 * Permet de créer, lire, mettre à jour et supprimer les pixels de tracking
 * 
 * @route /api/admin/pixels
 * @method GET, POST, PUT, DELETE
 * @author OMA Team
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schéma de validation pour les pixels de tracking
const pixelSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum([
    "FACEBOOK_PIXEL",
    "GOOGLE_ANALYTICS",
    "GOOGLE_TAG_MANAGER",
    "TIKTOK_PIXEL",
    "LINKEDIN_INSIGHT",
    "TWITTER_PIXEL",
    "PINTEREST_PIXEL",
    "SNAPCHAT_PIXEL",
    "CUSTOM",
  ]),
  pixelId: z.string().min(1).max(255),
  isActive: z.boolean().optional().default(true),
  position: z.enum(["head", "body"]).optional().default("head"),
  config: z.any().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  website: z.string().url().optional().nullable(),
})

// GET - Récupérer tous les pixels ou un spécifique
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN ou EDITOR)
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ success: false, error: "Permissions insuffisantes" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const activeOnly = searchParams.get("activeOnly") === "true"

    if (id) {
      // Récupérer un pixel spécifique
      const pixel = await prisma.trackingPixel.findUnique({
        where: { id },
      })

      if (!pixel) {
        return NextResponse.json({ success: false, error: "Pixel non trouvé" }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: pixel })
    }

    // Récupérer tous les pixels
    const where = activeOnly ? { isActive: true } : {}
    const pixels = await prisma.trackingPixel.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: pixels })
  } catch (error: any) {
    console.error("[API] Erreur GET /api/admin/pixels:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la récupération des pixels" },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau pixel
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN uniquement)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Permissions insuffisantes" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = pixelSchema.parse(body)

    // Créer le pixel
    const pixel = await prisma.trackingPixel.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        pixelId: validatedData.pixelId,
        isActive: validatedData.isActive ?? true,
        position: validatedData.position ?? "head",
        config: validatedData.config || null,
        description: validatedData.description || null,
        website: validatedData.website || null,
      },
    })

    // Log de l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_TRACKING_PIXEL",
        target: `TrackingPixel:${pixel.id}`,
        payload: { name: pixel.name, type: pixel.type },
      },
    })

    return NextResponse.json({ success: true, data: pixel }, { status: 201 })
  } catch (error: any) {
    console.error("[API] Erreur POST /api/admin/pixels:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la création du pixel" },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un pixel
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN uniquement)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Permissions insuffisantes" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requis" }, { status: 400 })
    }

    const validatedData = pixelSchema.partial().parse(updateData)

    // Vérifier si le pixel existe
    const existing = await prisma.trackingPixel.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: "Pixel non trouvé" }, { status: 404 })
    }

    // Mettre à jour le pixel
    const pixel = await prisma.trackingPixel.update({
      where: { id },
      data: validatedData,
    })

    // Log de l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_TRACKING_PIXEL",
        target: `TrackingPixel:${pixel.id}`,
        payload: { name: pixel.name, type: pixel.type },
      },
    })

    return NextResponse.json({ success: true, data: pixel })
  } catch (error: any) {
    console.error("[API] Erreur PUT /api/admin/pixels:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la mise à jour du pixel" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un pixel
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN uniquement)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Permissions insuffisantes" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requis" }, { status: 400 })
    }

    // Vérifier si le pixel existe
    const existing = await prisma.trackingPixel.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: "Pixel non trouvé" }, { status: 404 })
    }

    // Supprimer le pixel
    await prisma.trackingPixel.delete({
      where: { id },
    })

    // Log de l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_TRACKING_PIXEL",
        target: `TrackingPixel:${id}`,
        payload: { name: existing.name, type: existing.type },
      },
    })

    return NextResponse.json({ success: true, message: "Pixel supprimé avec succès" })
  } catch (error: any) {
    console.error("[API] Erreur DELETE /api/admin/pixels:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la suppression du pixel" },
      { status: 500 }
    )
  }
}


