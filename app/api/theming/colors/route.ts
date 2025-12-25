/**
 * @file app/api/theming/colors/route.ts
 * @description API publique pour récupérer les couleurs dynamiques du thème
 * Utilisé pour injecter les couleurs CSS dynamiquement depuis la DB
 * PAS PROTÉGÉ : Accessible publiquement
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/theming/colors
// Récupère les couleurs du thème depuis la DB
// Cache: 60 secondes (revalidation)
export const revalidate = 60

export async function GET() {
  try {
    // Récupérer les settings
    const setting = await prisma.setting.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    // Valeurs par défaut (couleurs orange/or actuelles)
    const defaultColors = {
      colorBackground: '#fefcfb',
      colorForeground: '#1a1a1a',
      colorCard: '#ffffff',
      colorCardForeground: '#1a1a1a',
      colorPrimary: '#0a0a0a',
      colorPrimaryForeground: '#fefcfb',
      colorSecondary: '#f97316',
      colorSecondaryForeground: '#1a1a1a',
      colorMuted: '#f7f5f3',
      colorMutedForeground: '#71717a',
      colorAccent: '#f97316',
      colorAccentForeground: '#1a1a1a',
      colorBorder: '#e4e4e7',
      colorInput: '#ffffff',
      colorRing: '#f97316',
      colorGold: '#f97316',
      colorGoldDark: '#ea580c',
      colorGoldLight: '#fb923c',
    }

    // Fusionner avec les données de la DB
    const colors = {
      ...defaultColors,
      ...(setting ? {
        colorBackground: setting.colorBackground || defaultColors.colorBackground,
        colorForeground: setting.colorForeground || defaultColors.colorForeground,
        colorCard: setting.colorCard || defaultColors.colorCard,
        colorCardForeground: setting.colorCardForeground || defaultColors.colorCardForeground,
        colorPrimary: setting.colorPrimary || defaultColors.colorPrimary,
        colorPrimaryForeground: setting.colorPrimaryForeground || defaultColors.colorPrimaryForeground,
        colorSecondary: setting.colorSecondary || defaultColors.colorSecondary,
        colorSecondaryForeground: setting.colorSecondaryForeground || defaultColors.colorSecondaryForeground,
        colorMuted: setting.colorMuted || defaultColors.colorMuted,
        colorMutedForeground: setting.colorMutedForeground || defaultColors.colorMutedForeground,
        colorAccent: setting.colorAccent || defaultColors.colorAccent,
        colorAccentForeground: setting.colorAccentForeground || defaultColors.colorAccentForeground,
        colorBorder: setting.colorBorder || defaultColors.colorBorder,
        colorInput: setting.colorInput || defaultColors.colorInput,
        colorRing: setting.colorRing || defaultColors.colorRing,
        colorGold: setting.colorGold || defaultColors.colorGold,
        colorGoldDark: setting.colorGoldDark || defaultColors.colorGoldDark,
        colorGoldLight: setting.colorGoldLight || defaultColors.colorGoldLight,
      } : {}),
    }

    return NextResponse.json({
      success: true,
      colors,
    })
  } catch (error) {
    console.error('[API] Erreur GET theming/colors:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des couleurs' },
      { status: 500 }
    )
  }
}




