/**
 * API Route publique pour récupérer les pixels actifs
 * Utilisée pour injecter les scripts de tracking dans le site
 * 
 * @route /api/pixels
 * @method GET
 * @author OMA Team
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Récupérer uniquement les pixels actifs
    const pixels = await prisma.trackingPixel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ success: true, data: pixels })
  } catch (error: any) {
    console.error("[API] Erreur GET /api/pixels:", error)
    // En cas d'erreur, retourner un tableau vide pour ne pas bloquer le site
    return NextResponse.json({ success: true, data: [] })
  }
}


