/**
 * @file app/api/auth/[...nextauth]/route.ts
 * @description Handlers NextAuth avec correction d'URL (route API uniquement)
 */

import { NextRequest } from 'next/server'
import { handlers } from '@/auth'

function getRequestBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host')
  const protocol =
    request.headers.get('x-forwarded-proto') ||
    (request.headers.get('x-forwarded-ssl') === 'on' ? 'https' : 'http')

  if (host) return `${protocol}://${host}`
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.AUTH_URL) return process.env.AUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  const port = process.env.PORT || '3000'
  return `http://localhost:${port}`
}

async function handleAuthRequest(
  request: NextRequest,
  method: 'GET' | 'POST'
): Promise<Response> {
  try {
    const baseUrl = getRequestBaseUrl(request)

    if (!request.url || request.url === 'null' || request.url.includes('null')) {
      const fullPath = request.nextUrl.pathname + request.nextUrl.search
      try {
        const fullUrl = new URL(fullPath, baseUrl)
        const correctedRequest = new NextRequest(fullUrl, {
          method: request.method,
          headers: request.headers,
          body: method === 'POST' ? request.body : undefined,
        })
        return method === 'GET'
          ? await handlers.GET(correctedRequest)
          : await handlers.POST(correctedRequest)
      } catch (urlError) {
        console.error('[NextAuth] Erreur construction URL:', urlError)
      }
    }

    return method === 'GET' ? await handlers.GET(request) : await handlers.POST(request)
  } catch (error: unknown) {
    console.error(`[NextAuth] Erreur ${method}:`, error)

    const message = error instanceof Error ? error.message : 'Une erreur est survenue'
    const isUrlError =
      message.includes('URL is malformed') ||
      (error as { code?: string })?.code === 'ERR_INVALID_URL'

    if (isUrlError) {
      const detectedUrl = getRequestBaseUrl(request)
      try {
        const fullPath = request.nextUrl.pathname + request.nextUrl.search
        const fullUrl = new URL(fullPath, detectedUrl)
        const correctedRequest = new NextRequest(fullUrl, {
          method: request.method,
          headers: request.headers,
          body: method === 'POST' ? request.body : undefined,
        })
        return method === 'GET'
          ? await handlers.GET(correctedRequest)
          : await handlers.POST(correctedRequest)
      } catch {
        return new Response(
          JSON.stringify({
            error: 'Erreur de configuration',
            message: 'NEXTAUTH_URL n\'est pas correctement configuré.',
            hint: `Ajoutez NEXTAUTH_URL="${detectedUrl}" dans votre fichier .env`,
            detectedUrl,
            currentEnv: process.env.NODE_ENV,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Erreur d\'authentification', message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleAuthRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return handleAuthRequest(request, 'POST')
}
