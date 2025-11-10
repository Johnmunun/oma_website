/**
 * API Route pour gérer les abonnements à la newsletter
 * POST /api/newsletter - S'abonner à la newsletter
 * GET /api/newsletter - Récupérer les abonnés (ADMIN uniquement)
 */

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { auth } from "@/app/api/auth/[...nextauth]/route"

// Schéma de validation pour l'inscription
const newsletterSubscriptionSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  whatsapp: z
    .string()
    .min(1, "Le numéro WhatsApp est requis")
    .transform((val) => val.replace(/\s/g, "")) // Enlever les espaces
    .refine(
      (val) => /^\+?[1-9]\d{1,14}$/.test(val),
      "Format WhatsApp invalide. Utilisez le format international (ex: +243900000000)"
    ),
  name: z.string().optional(),
})

// POST /api/newsletter - S'abonner à la newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = newsletterSubscriptionSchema.parse(body)

    // Vérifier si l'email existe déjà
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: validatedData.email.trim().toLowerCase() },
    })

    if (existing) {
      // Si déjà abonné, mettre à jour les informations
      const updated = await prisma.newsletterSubscriber.update({
        where: { email: validatedData.email.trim().toLowerCase() },
        data: {
          whatsapp: validatedData.whatsapp.trim(),
          name: validatedData.name?.trim() || null,
          subscribed: true, // Réactiver si désabonné
        },
      })

      return NextResponse.json(
        {
          success: true,
          message: "Vos informations ont été mises à jour",
          data: { email: updated.email },
        },
        { status: 200 },
      )
    }

    // Créer un nouvel abonné
    const newSubscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: validatedData.email.trim().toLowerCase(),
        whatsapp: validatedData.whatsapp.trim(),
        name: validatedData.name?.trim() || null,
        subscribed: true,
      },
    })

    console.log("[Newsletter] Nouvel abonné:", newSubscriber.email)

    return NextResponse.json(
      {
        success: true,
        message: "Inscription à la newsletter réussie !",
        data: { email: newSubscriber.email },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Newsletter API] Erreur validation:", error.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      )
    }

    console.error("[Newsletter API Error]:", error)
    console.error("[Newsletter API] Stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur lors du traitement de la demande",
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.stack : error 
        }),
      },
      { status: 500 },
    )
  }
}

// GET /api/newsletter - Récupérer les abonnés (ADMIN uniquement)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN ou EDITOR)
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 })
    }

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const subscribed = searchParams.get("subscribed")

    // Construire la requête
    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { whatsapp: { contains: search, mode: "insensitive" } },
      ]
    }
    if (subscribed !== null) {
      where.subscribed = subscribed === "true"
    }

    // Récupérer les abonnés
    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ])

    // Statistiques
    const stats = {
      total: await prisma.newsletterSubscriber.count(),
      subscribed: await prisma.newsletterSubscriber.count({ where: { subscribed: true } }),
      unsubscribed: await prisma.newsletterSubscriber.count({ where: { subscribed: false } }),
    }

    return NextResponse.json({
      success: true,
      data: subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error("[Newsletter API GET Error]:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des abonnés" },
      { status: 500 },
    )
  }
}

/**
 * @todo Implémenter GET pour récupérer les statistiques des abonnés (admin)
 * @todo Implémenter DELETE pour la désinscription
 */
