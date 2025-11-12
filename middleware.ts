/**
 * @file middleware.ts
 * @description Middleware Next.js pour protéger les routes admin
 * Utilise NextAuth au lieu de Supabase
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { UserRole } from '@prisma/client'

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
    // Vérifier l'authentification avec NextAuth
    const session = await auth()

    if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', url.pathname)
    return NextResponse.redirect(loginUrl)
  }

    // Vérifier les permissions selon le rôle
    const userRole = session.user.role

    // Routes réservées aux ADMIN uniquement
    const adminOnlyRoutes = ['/admin/users', '/admin/settings', '/admin/content', '/admin/analytics']
    const isAdminOnlyRoute = adminOnlyRoutes.some(route => url.pathname.startsWith(route))
    
    if (isAdminOnlyRoute && userRole !== UserRole.ADMIN) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', url.pathname)
      loginUrl.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(loginUrl)
    }

    // Routes accessibles aux ADMIN, EDITOR et VIEWER (lecture seule)
    const viewableRoutes = ['/admin', '/admin/events', '/admin/messages']
    const isViewableRoute = viewableRoutes.some(route => url.pathname === route || url.pathname.startsWith(route + '/'))
    
    // Si c'est une route viewable, autoriser tous les rôles (les restrictions d'actions seront gérées côté client)
    if (isViewableRoute) {
      return NextResponse.next()
    }

    // Routes accessibles aux ADMIN et EDITOR (mais pas VIEWER)
    const editorRoutes = ['/admin/team', '/admin/testimonials', '/admin/newsletter', '/admin/media', '/admin/partners']
    const isEditorRoute = editorRoutes.some(route => url.pathname.startsWith(route))
    
    if (isEditorRoute && userRole === UserRole.VIEWER) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', url.pathname)
      loginUrl.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(loginUrl)
    }

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
