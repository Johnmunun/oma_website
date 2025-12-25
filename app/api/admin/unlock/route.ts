/**
 * @file app/api/admin/unlock/route.ts
 * @description API pour déverrouiller la session après inactivité
 * Vérifie le mot de passe de l'utilisateur connecté
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// POST /api/admin/unlock
// Vérifie le mot de passe et déverrouille la session
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Mot de passe requis" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true, isActive: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur introuvable" },
        { status: 404 }
      )
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Compte désactivé" },
        { status: 403 }
      )
    }

    // Vérifier si l'utilisateur a un mot de passe
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Ce compte n'a pas de mot de passe. Veuillez vous reconnecter.",
        },
        { status: 400 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Mettre à jour la date de dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "session.unlock",
        target: "Session",
        payload: { timestamp: new Date().toISOString() },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Session déverrouillée avec succès",
    })
  } catch (error: any) {
    console.error("[API] Erreur unlock:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erreur lors du déverrouillage",
      },
      { status: 500 }
    )
  }
}







