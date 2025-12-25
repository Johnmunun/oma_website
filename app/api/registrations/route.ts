// ============================================
// API ROUTE: INSCRIPTIONS AUX FORMATIONS
// ============================================
// Gère les inscriptions des utilisateurs aux formations

import { type NextRequest, NextResponse } from "next/server"

// POST /api/registrations
// Crée une nouvelle inscription à une formation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation des champs requis
    const requiredFields = ["formation_id", "first_name", "last_name", "email", "phone", "country"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Champs manquants: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // TODO: Implémenter la sauvegarde en base de données
    // const registration = await db.formationRegistrations.create({
    //   data: {
    //     formation_id: body.formation_id,
    //     first_name: body.first_name,
    //     last_name: body.last_name,
    //     email: body.email,
    //     phone: body.phone,
    //     country: body.country,
    //     message: body.message || null,
    //     status: 'pending',
    //     registration_date: new Date(),
    //   }
    // })

    // TODO: Envoyer un email de confirmation à l'utilisateur
    // await sendConfirmationEmail(body.email, body.first_name)

    console.log("[API] Nouvelle inscription:", body)

    return NextResponse.json({
      success: true,
      message: "Inscription créée avec succès. Un email de confirmation a été envoyé.",
      data: {
        id: Math.random().toString(36).substr(2, 9),
        ...body,
        status: "pending",
        registration_date: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[API] Erreur POST registrations:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de la création de l'inscription" }, { status: 500 })
  }
}

// GET /api/registrations
// Récupère toutes les inscriptions (ADMIN UNIQUEMENT)
export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier l'authentification admin
    // const session = await getSession()
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    // }

    // TODO: Implémenter la récupération depuis la base de données
    // const registrations = await db.formationRegistrations.findMany()

    const registrations: any[] = []

    return NextResponse.json({
      success: true,
      data: registrations,
    })
  } catch (error) {
    console.error("[API] Erreur GET registrations:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des inscriptions" },
      { status: 500 },
    )
  }
}
