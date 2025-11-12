/**
 * @file app/api/admin/wakeup-ping/route.ts
 * @description API pour le wake-up ping - maintient la base de données active
 * Simple requête pour éviter que la DB ne s'endorme
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/admin/wakeup-ping
// Simple ping pour maintenir la connexion DB active
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel, mais recommandé pour éviter les abus)
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Faire une requête simple à la base de données pour maintenir la connexion active
    // On fait un simple count sur une table légère (Setting)
    await prisma.setting.count()

    return NextResponse.json({
      success: true,
      message: "Ping réussi",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[API] Erreur wake-up ping:", error)
    // Même en cas d'erreur, on retourne un succès pour ne pas perturber le système
    // L'erreur sera loggée mais ne bloquera pas le processus
    return NextResponse.json(
      {
        success: true,
        message: "Ping effectué (avec erreur)",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  }
}






