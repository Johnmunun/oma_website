/**
 * @file middleware.ts
 * @description Sous-domaines structures + protection routes admin
 */

import { NextRequest, NextResponse } from 'next/server'

function hasSessionCookie(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get('authjs.session-token')?.value ||
      req.cookies.get('__Secure-authjs.session-token')?.value ||
      req.cookies.get('next-auth.session-token')?.value ||
      req.cookies.get('__Secure-next-auth.session-token')?.value
  )
}

function getMainSiteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, '')
  if (url) return url
  const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim()
  if (domain) return `https://${domain}`
  return 'http://localhost:3000'
}

function resolveSubdomain(host: string): string | null {
  const siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim()

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

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const host = req.headers.get('host')?.split(':')[0] ?? ''

  const subdomain = resolveSubdomain(host)
  if (
    subdomain &&
    !url.pathname.startsWith('/admin') &&
    !url.pathname.startsWith('/api') &&
    !url.pathname.startsWith('/_next')
  ) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, req.url))
    }

    const mainOrigin = getMainSiteOrigin()
    try {
      const mainHost = new URL(mainOrigin).host
      if (host !== mainHost) {
        return NextResponse.redirect(new URL(url.pathname + url.search, mainOrigin))
      }
    } catch {
      // ignore invalid main origin
    }
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
