/**
 * @file app/api/uploads/route.ts
 * @description Endpoint serveur pour upload d'images vers ImageKit
 * PROTÉGÉ : Requiert une session NextAuth valide
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { uploadToImageKit, getImageKitUploadToken } from '@/lib/imagekit'

// POST /api/uploads
// Upload un fichier vers ImageKit (serveur-side)
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

    // Vérifier les permissions (seuls ADMIN et EDITOR peuvent uploader)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || '/uploads'

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
    const fileName = `${timestamp}_${sanitizedName}`

    // Upload vers ImageKit
    const result = await uploadToImageKit(buffer, fileName, folder)

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
    console.error('[API] Erreur upload ImageKit:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}

// GET /api/uploads/token
// Génère un token pour upload client-side (optionnel)
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

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName') || 'upload.jpg'
    const folder = searchParams.get('folder') || '/uploads'

    const token = await getImageKitUploadToken(fileName, folder)

    return NextResponse.json({
      success: true,
      data: token,
    })
  } catch (error) {
    console.error('[API] Erreur génération token ImageKit:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du token' },
      { status: 500 }
    )
  }
}


