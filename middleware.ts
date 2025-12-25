/**
 * @file middleware.ts
 * @description Middleware Next.js pour protéger les routes admin
 * Utilise NextAuth au lieu de Supabase
 * 
 * Note: Version optimisée pour Edge Runtime (évite les imports lourds)
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Fonction légère pour vérifier l'authentification via les cookies
 * Utilise directement les cookies sans importer NextAuth/Prisma
 * 
 * Note: Cette approche vérifie simplement la présence d'un cookie de session.
 * La validation complète du rôle et de l'authentification se fera côté serveur dans les pages.
 * Cela réduit considérablement la taille du bundle Edge Runtime.
 */
function hasSessionCookie(req: NextRequest): boolean {
  const sessionToken = req.cookies.get('authjs.session-token')?.value || 
                       req.cookies.get('__Secure-authjs.session-token')?.value ||
                       req.cookies.get('next-auth.session-token')?.value ||
                       req.cookies.get('__Secure-next-auth.session-token')?.value
  
  return !!sessionToken
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl

  // Protéger uniquement les routes /admin (sauf /admin/unlock qui est gérée par la page elle-même)
  if (!url.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Autoriser l'accès à la page de déverrouillage (elle vérifie elle-même l'authentification)
  if (url.pathname === '/admin/unlock') {
    return NextResponse.next()
  }

  try {
    // Vérifier la présence d'un cookie de session (approche légère pour Edge Runtime)
    // La validation complète du rôle se fera côté serveur dans les pages
    if (!hasSessionCookie(req)) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', url.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Pour les vérifications de rôle, on laisse les pages les gérer
    // car elles ont accès à la session complète via auth()
    // Le middleware vérifie juste la présence d'une session

    // La vérification des rôles se fait maintenant dans les pages elles-mêmes
    // Le middleware vérifie uniquement la présence d'une session
    // Cela réduit la taille du bundle Edge Runtime

    return NextResponse.next()
  } catch (error: any) {
    console.error('[Middleware] Erreur authentification:', error)
    // En cas d'erreur, rediriger vers login plutôt que de faire planter
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', url.pathname)
    loginUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
