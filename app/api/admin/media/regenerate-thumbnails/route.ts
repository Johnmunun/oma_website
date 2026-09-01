/**
 * @file app/api/admin/media/regenerate-thumbnails/route.ts
 * @description API route pour régénérer les miniatures manquantes pour les vidéos YouTube
 * POST: Régénère les miniatures pour toutes les vidéos YouTube sans miniature
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'

// Fonction pour extraire l'ID d'une vidéo YouTube (améliorée)
function extractYouTubeId(url: string): string | null {
  if (!url) return null
  
  const cleanUrl = url.trim()
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?|&|$)/,
  ]
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern)
    if (match && match[1] && match[1].length === 11) {
      return match[1]
    }
  }
  
  return null
}

// Fonction pour générer une miniature YouTube
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

// POST /api/admin/media/regenerate-thumbnails
// Régénère les miniatures pour toutes les vidéos YouTube sans miniature
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await requirePermission('media.upload')
    if (isPermissionDenied(session)) return session

    // Récupérer toutes les vidéos YouTube sans miniature
    const videosWithoutThumbnail = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        platform: 'youtube',
        OR: [
          { thumbnailUrl: null },
          { thumbnailUrl: '' },
        ],
      },
    })

    let updated = 0
    let failed = 0

    // Régénérer les miniatures
    for (const video of videosWithoutThumbnail) {
      try {
        const videoId = extractYouTubeId(video.url)
        if (videoId) {
          const thumbnailUrl = getYouTubeThumbnail(videoId)
          await prisma.media.update({
            where: { id: video.id },
            data: { thumbnailUrl },
          })
          updated++
          console.log(`[Media] Miniature régénérée pour: ${video.url} -> ${thumbnailUrl}`)
        } else {
          console.warn(`[Media] Impossible d'extraire l'ID YouTube de: ${video.url}`)
          failed++
        }
      } catch (error) {
        console.error(`[Media] Erreur lors de la régénération pour ${video.id}:`, error)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updated} miniature(s) régénérée(s)`,
      data: {
        updated,
        failed,
        total: videosWithoutThumbnail.length,
      },
    })
  } catch (error) {
    console.error('[API] Erreur POST regenerate-thumbnails:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la régénération des miniatures' },
      { status: 500 }
    )
  }
}


