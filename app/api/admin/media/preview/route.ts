/**
 * @file app/api/admin/media/preview/route.ts
 * @description Prévisualise plateforme + miniature à partir d'une URL
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { resolveMediaMeta } from "@/lib/media-thumbnails"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 })
    }

    const url = request.nextUrl.searchParams.get("url")
    if (!url) {
      return NextResponse.json({ success: false, error: "URL requise" }, { status: 400 })
    }

    const meta = await resolveMediaMeta(url)
    return NextResponse.json({
      success: true,
      data: meta,
      warning: meta.thumbnailUrl
        ? null
        : "Miniature TikTok introuvable pour ce lien (vidéo privée, région, ou lien invalide)",
    })
  } catch (error) {
    console.error("[API] Erreur preview media:", error)
    return NextResponse.json(
      { success: false, error: "Impossible de générer l'aperçu" },
      { status: 500 }
    )
  }
}
