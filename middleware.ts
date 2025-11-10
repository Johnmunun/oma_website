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

  // Protéger uniquement les routes /admin
  if (!url.pathname.startsWith('/admin')) {
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

    // Route /admin/users réservée aux ADMIN uniquement
    if (url.pathname.startsWith('/admin/users') && userRole !== UserRole.ADMIN) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', url.pathname)
      loginUrl.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(loginUrl)
    }

    // Autres routes admin : ADMIN et EDITOR autorisés
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.EDITOR) {
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
