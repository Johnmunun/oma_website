/**
 * @file app/api/admin/testimonials/route.ts
 * @description API routes pour gérer les témoignages (admin)
 * GET: Récupère tous les témoignages
 * POST: Crée un nouveau témoignage (avec génération de token)
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

// Schéma de validation pour créer un témoignage (admin)
const createTestimonialSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  role: z.string().max(200).optional().nullable(),
})

// Schéma de validation pour mettre à jour un témoignage
const updateTestimonialSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  role: z.string().max(200).optional().nullable(),
  content: z.string().min(10).max(1000).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED']).optional(),
})

// Fonction pour générer un token sécurisé
function generateTestimonialToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// GET /api/admin/testimonials
// Récupère tous les témoignages
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Construire les filtres
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Récupérer tous les témoignages
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: testimonials,
    })
  } catch (error) {
    console.error('[API] Erreur GET testimonials:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des témoignages' },
      { status: 500 }
    )
  }
}

// POST /api/admin/testimonials
// Crée un nouveau témoignage (avec génération de token pour le formulaire)
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Valider les données
    const validatedData = createTestimonialSchema.parse(body)

    // Générer un token sécurisé
    const token = generateTestimonialToken()
    const tokenExpiresAt = new Date()
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30) // Expire dans 30 jours

    // Créer le témoignage
    const testimonial = await prisma.testimonial.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        role: validatedData.role || null,
        content: '', // Sera rempli par l'utilisateur via le formulaire
        status: 'PENDING',
        token,
        tokenExpiresAt,
      },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'testimonial.create',
        target: 'Testimonial',
        payload: { id: testimonial.id, email: testimonial.email },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Témoignage créé avec succès. Un lien de formulaire a été généré.',
      data: {
        ...testimonial,
        token, // Retourner le token pour générer le lien
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur POST testimonials:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du témoignage' },
      { status: 500 }
    )
  }
}

