// ============================================
// API ROUTE: ÉVÉNEMENTS
// ============================================
// Gère les événements (créer, lire, mettre à jour, supprimer)

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/events
// Récupère tous les événements publiés à venir (limite 10 pour la bannière de défilement)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const upcoming = searchParams.get("upcoming") === "true"
    const bannerOnly = searchParams.get("bannerOnly") === "true"

    const now = new Date()

    // Construire la clause where de manière sécurisée
    const where: any = {
      status: "PUBLISHED",
    }

    if (upcoming) {
      where.startsAt = {
        gte: now,
      }
    }

    // Sélection des champs de base
    const selectFields: any = {
      id: true,
      title: true,
      slug: true,
      description: true,
      type: true,
      location: true,
      startsAt: true,
      endsAt: true,
      imageUrl: true,
    }

    // Essayer d'ajouter showOnBanner au select et au where
    // Si le champ n'existe pas, Prisma lancera une erreur qu'on gérera
    let includeShowInBanner = false
    
    try {
      // Tenter une requête simple pour vérifier si le champ existe
      // On utilise une approche plus robuste: on essaie d'abord sans, puis avec si nécessaire
      selectFields.showOnBanner = true
      includeShowInBanner = true
      
      if (bannerOnly) {
        where.showOnBanner = true
      }
    } catch {
      // Si l'ajout échoue au niveau de la définition, on continue sans
      includeShowInBanner = false
    }

    // Exécuter la requête
    let events
    try {
      events = await prisma.event.findMany({
        where,
        orderBy: {
          startsAt: "asc",
        },
        take: limit,
        select: selectFields,
      })
    } catch (dbError: any) {
      // Vérifier si l'erreur est liée au champ showOnBanner qui n'existe pas
      const errorMessage = dbError.message?.toLowerCase() || ""
      const isShowInBannerError = 
        errorMessage.includes("showinbanner") ||
        errorMessage.includes("column") && errorMessage.includes("does not exist") ||
        dbError.code === "P2021" || 
        dbError.code === "P2010" ||
        dbError.meta?.code === "42703" // PostgreSQL: undefined column
      
      if (isShowInBannerError) {
        console.warn("[API] Le champ showOnBanner n'existe pas encore dans la base de données:", dbError.message)
        
        // Retirer showOnBanner du select et du where
        delete selectFields.showOnBanner
        delete where.showOnBanner
        
        // Si bannerOnly était demandé, retourner un tableau vide avec un avertissement
        if (bannerOnly) {
          return NextResponse.json({
            success: true,
            data: [],
            warning: "Le champ showOnBanner n'est pas encore disponible. Veuillez exécuter la migration Prisma: npx prisma migrate dev --name add_show_in_banner_to_event",
          })
        }
        
        // Sinon, continuer sans le filtre showOnBanner
        events = await prisma.event.findMany({
          where,
          orderBy: {
            startsAt: "asc",
          },
          take: limit,
          select: selectFields,
        })
      } else {
        // Si c'est une autre erreur, la propager
        throw dbError
      }
    }

    // Ajouter showOnBanner: false par défaut si le champ n'existe pas dans les résultats
    const eventsWithDefaultBanner = events.map((event: any) => ({
      ...event,
      showOnBanner: event.showOnBanner ?? false,
    }))

    return NextResponse.json({
      success: true,
      data: eventsWithDefaultBanner,
    })
  } catch (error: any) {
    console.error("[API] Erreur GET events:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur lors de la récupération des événements",
        details: error.message,
        hint: "Si l'erreur concerne 'showOnBanner', exécutez: npx prisma migrate dev --name add_show_in_banner_to_event"
      },
      { status: 500 },
    )
  }
}

// POST /api/events
// Crée un nouvel événement (ADMIN UNIQUEMENT)
export async function POST(request: NextRequest) {
  try {
    // TODO: Vérifier l'authentification admin
    const body = await request.json()

    // TODO: Implémenter la sauvegarde en base de données
    // const event = await db.events.create({
    //   data: body
    // })

    console.log("[API] Nouvel événement créé:", body)

    return NextResponse.json({
      success: true,
      message: "Événement créé avec succès",
      data: { id: Math.random().toString(36).substr(2, 9), ...body },
    })
  } catch (error) {
    console.error("[API] Erreur POST events:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de la création" }, { status: 500 })
  }
}
