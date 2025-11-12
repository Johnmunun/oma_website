/**
 * @file app/api/testimonials/upload/route.ts
 * @description API route publique pour upload de photos de témoignages
 * POST: Upload une photo pour un témoignage via token
 * PUBLIC : Accessible avec un token de témoignage valide
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadToImageKit } from '@/lib/imagekit'

// POST /api/testimonials/upload
// Upload une photo pour un témoignage via token
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const token = formData.get('token') as string

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Vérifier que le token existe et est valide
    const testimonial = await prisma.testimonial.findUnique({
      where: { token },
    })

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 404 }
      )
    }

    // Vérifier que le token n'est pas expiré
    if (testimonial.tokenExpiresAt && new Date() > testimonial.tokenExpiresAt) {
      return NextResponse.json(
        { success: false, error: 'Le lien de formulaire a expiré' },
        { status: 410 }
      )
    }

    // Vérifier que le témoignage n'a pas déjà été soumis
    if (testimonial.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Ce témoignage a déjà été soumis' },
        { status: 409 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier (images uniquement)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Type de fichier non autorisé. Images uniquement.' },
        { status: 400 }
      )
    }

    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Fichier trop volumineux. Maximum 10MB.' },
        { status: 400 }
      )
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `testimonial_${testimonial.id}_${timestamp}_${sanitizedName}`

    // Upload vers ImageKit dans le dossier /testimonials
    const result = await uploadToImageKit(buffer, fileName, '/testimonials')

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        size: result.size,
      },
    })
  } catch (error) {
    console.error('[API] Erreur upload photo témoignage:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'upload de la photo' },
      { status: 500 }
    )
  }
}







