/**
 * API Route publique pour récupérer les métadonnées SEO par slug
 * Utilisée pour générer les meta tags dynamiques
 * 
 * @route /api/seo/[slug]
 * @method GET
 * @author OMA Team
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug requis" }, { status: 400 })
    }

    // Récupérer les métadonnées SEO par slug
    const seoMeta = await prisma.seoMeta.findFirst({
      where: { slug },
      include: { page: true },
    })

    if (!seoMeta) {
      return NextResponse.json({ success: false, error: "Métadonnées SEO non trouvées" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: seoMeta })
  } catch (error: any) {
    console.error("[API] Erreur GET /api/seo/[slug]:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la récupération des métadonnées SEO" },
      { status: 500 }
    )
  }
}

