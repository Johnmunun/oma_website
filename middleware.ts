/**
 * @file middleware.ts
 * @description Sous-domaines structures + protection routes admin
 *
 * joystudio.oratoiremonart.org/challenges/...
 *   → rewrite interne /s/joystudio/challenges/...
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMainSiteDomain } from '@/lib/site-origin'

function hasSessionCookie(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get('authjs.session-token')?.value ||
      req.cookies.get('__Secure-authjs.session-token')?.value ||
      req.cookies.get('next-auth.session-token')?.value ||
      req.cookies.get('__Secure-next-auth.session-token')?.value
  )
}

function resolveSubdomain(host: string): string | null {
  const siteDomain = getMainSiteDomain()

  if (siteDomain) {
    if (host === siteDomain || host === `www.${siteDomain}`) return null
    const suffix = `.${siteDomain}`
    if (host.endsWith(suffix)) {
      const sub = host.slice(0, -suffix.length)
      if (sub && sub !== 'www' && !sub.includes('.')) return sub
    }
  }

  if (process.env.NODE_ENV === 'development' && host.endsWith('.localhost')) {
    const sub = host.slice(0, -'.localhost'.length)
    if (sub && sub !== 'www' && !sub.includes('.')) return sub
  }

  return null
}

function rewriteStructurePath(req: NextRequest, subdomain: string): NextResponse {
  const { pathname, search } = req.nextUrl

  // Déjà préfixé /s/{sub} → laisser passer (évite double rewrite)
  if (pathname === `/s/${subdomain}` || pathname.startsWith(`/s/${subdomain}/`)) {
    return NextResponse.next()
  }

  // Ne pas réécrire les assets / routes techniques
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const targetPath =
    pathname === '/' ? `/s/${subdomain}` : `/s/${subdomain}${pathname}`

  const rewriteUrl = req.nextUrl.clone()
  rewriteUrl.pathname = targetPath
  // search déjà sur nextUrl
  return NextResponse.rewrite(rewriteUrl)
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const host = req.headers.get('host')?.split(':')[0] ?? ''

  const subdomain = resolveSubdomain(host)
  if (subdomain) {
    return rewriteStructurePath(req, subdomain)
  }

  if (!url.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (url.pathname === '/admin/unlock') {
    return NextResponse.next()
  }

  try {
    if (!hasSessionCookie(req)) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', url.pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  } catch (error) {
    console.error('[Middleware] Erreur authentification:', error)
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', url.pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
