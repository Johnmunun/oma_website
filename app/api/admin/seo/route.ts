/**
 * API Route pour gérer le SEO
 * Permet de créer, lire, mettre à jour et supprimer les métadonnées SEO
 * 
 * @route /api/admin/seo
 * @method GET, POST, PUT, DELETE
 * @author OMA Team
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schéma de validation pour les métadonnées SEO
const seoMetaSchema = z.object({
  pageId: z.string().uuid().optional(),
  slug: z.string().min(1).max(255).optional(),
  title: z.string().max(60).optional().nullable(),
  description: z.string().max(160).optional().nullable(),
  keywords: z.string().max(500).optional().nullable(),
  ogTitle: z.string().max(60).optional().nullable(),
  ogDescription: z.string().max(160).optional().nullable(),
  ogImageUrl: z.string().url().optional().nullable(),
  ogType: z.string().max(50).optional().nullable(),
  twitterCard: z.string().max(50).optional().nullable(),
  twitterTitle: z.string().max(60).optional().nullable(),
  twitterDescription: z.string().max(160).optional().nullable(),
  twitterImageUrl: z.string().url().optional().nullable(),
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
  canonicalUrl: z.string().url().optional().nullable(),
  schemaJson: z.any().optional().nullable(),
}).refine(
  (data) => data.pageId || data.slug,
  {
    message: "pageId ou slug doit être fourni",
    path: ["pageId", "slug"],
  }
)

// GET - Récupérer toutes les métadonnées SEO ou une spécifique
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
    const pageId = searchParams.get("pageId")
    const slug = searchParams.get("slug")
    const id = searchParams.get("id")

    if (id) {
      // Récupérer une métadonnée spécifique par ID
      const seoMeta = await prisma.seoMeta.findUnique({
        where: { id },
        include: { page: true },
      })

      if (!seoMeta) {
        return NextResponse.json({ success: false, error: "Métadonnée SEO non trouvée" }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: seoMeta })
    }

    if (pageId) {
      // Récupérer par pageId
      const seoMeta = await prisma.seoMeta.findUnique({
        where: { pageId },
        include: { page: true },
      })

      return NextResponse.json({ success: true, data: seoMeta || null })
    }

    if (slug) {
      // Récupérer par slug
      const seoMeta = await prisma.seoMeta.findFirst({
        where: { slug },
        include: { page: true },
      })

      return NextResponse.json({ success: true, data: seoMeta || null })
    }

    // Récupérer toutes les métadonnées SEO
    const seoMetas = await prisma.seoMeta.findMany({
      include: { page: true },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ success: true, data: seoMetas })
  } catch (error: any) {
    console.error("[API] Erreur GET /api/admin/seo:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la récupération des métadonnées SEO" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle métadonnée SEO
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN ou EDITOR)
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ success: false, error: "Permissions insuffisantes" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = seoMetaSchema.parse(body)

    // Vérifier si une métadonnée existe déjà pour cette page ou ce slug
    if (validatedData.pageId) {
      const existing = await prisma.seoMeta.findUnique({
        where: { pageId: validatedData.pageId },
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Une métadonnée SEO existe déjà pour cette page" },
          { status: 400 }
        )
      }
    }

    if (validatedData.slug) {
      const existing = await prisma.seoMeta.findUnique({
        where: { slug: validatedData.slug },
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Une métadonnée SEO existe déjà pour ce slug" },
          { status: 400 }
        )
      }
    }

    // Créer la métadonnée SEO
    const seoMeta = await prisma.seoMeta.create({
      data: {
        pageId: validatedData.pageId || undefined,
        slug: validatedData.slug || undefined,
        title: validatedData.title || null,
        description: validatedData.description || null,
        keywords: validatedData.keywords || null,
        ogTitle: validatedData.ogTitle || null,
        ogDescription: validatedData.ogDescription || null,
        ogImageUrl: validatedData.ogImageUrl || null,
        ogType: validatedData.ogType || "website",
        twitterCard: validatedData.twitterCard || "summary_large_image",
        twitterTitle: validatedData.twitterTitle || null,
        twitterDescription: validatedData.twitterDescription || null,
        twitterImageUrl: validatedData.twitterImageUrl || null,
        noIndex: validatedData.noIndex ?? false,
        noFollow: validatedData.noFollow ?? false,
        canonicalUrl: validatedData.canonicalUrl || null,
        schemaJson: validatedData.schemaJson || null,
      },
      include: { page: true },
    })

    // Log de l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_SEO_META",
        target: `SeoMeta:${seoMeta.id}`,
        payload: { slug: seoMeta.slug, pageId: seoMeta.pageId },
      },
    })

    return NextResponse.json({ success: true, data: seoMeta }, { status: 201 })
  } catch (error: any) {
    console.error("[API] Erreur POST /api/admin/seo:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la création des métadonnées SEO" },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une métadonnée SEO
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN ou EDITOR)
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ success: false, error: "Permissions insuffisantes" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requis" }, { status: 400 })
    }

    const validatedData = seoMetaSchema.partial().parse(updateData)

    // Vérifier si la métadonnée existe
    const existing = await prisma.seoMeta.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: "Métadonnée SEO non trouvée" }, { status: 404 })
    }

    // Mettre à jour la métadonnée SEO
    const seoMeta = await prisma.seoMeta.update({
      where: { id },
      data: {
        ...validatedData,
        // S'assurer que les valeurs null sont bien gérées
        title: validatedData.title ?? existing.title,
        description: validatedData.description ?? existing.description,
        keywords: validatedData.keywords ?? existing.keywords,
        ogTitle: validatedData.ogTitle ?? existing.ogTitle,
        ogDescription: validatedData.ogDescription ?? existing.ogDescription,
        ogImageUrl: validatedData.ogImageUrl ?? existing.ogImageUrl,
        twitterTitle: validatedData.twitterTitle ?? existing.twitterTitle,
        twitterDescription: validatedData.twitterDescription ?? existing.twitterDescription,
        twitterImageUrl: validatedData.twitterImageUrl ?? existing.twitterImageUrl,
        canonicalUrl: validatedData.canonicalUrl ?? existing.canonicalUrl,
        schemaJson: validatedData.schemaJson ?? existing.schemaJson,
      },
      include: { page: true },
    })

    // Log de l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_SEO_META",
        target: `SeoMeta:${seoMeta.id}`,
        payload: { slug: seoMeta.slug, pageId: seoMeta.pageId },
      },
    })

    return NextResponse.json({ success: true, data: seoMeta })
  } catch (error: any) {
    console.error("[API] Erreur PUT /api/admin/seo:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la mise à jour des métadonnées SEO" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une métadonnée SEO
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

    // Vérifier si la métadonnée existe
    const existing = await prisma.seoMeta.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: "Métadonnée SEO non trouvée" }, { status: 404 })
    }

    // Supprimer la métadonnée SEO
    await prisma.seoMeta.delete({
      where: { id },
    })

    // Log de l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_SEO_META",
        target: `SeoMeta:${id}`,
        payload: { slug: existing.slug, pageId: existing.pageId },
      },
    })

    return NextResponse.json({ success: true, message: "Métadonnée SEO supprimée avec succès" })
  } catch (error: any) {
    console.error("[API] Erreur DELETE /api/admin/seo:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la suppression des métadonnées SEO" },
      { status: 500 }
    )
  }
}

