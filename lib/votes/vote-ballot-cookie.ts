/**
 * Cookie ballot httpOnly — 1 vote par navigateur et par tour
 */

import { createHash, createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90 // 90 jours

function getBallotSecret(): string {
  const secret =
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.EVENT_REGISTRATION_SECRET?.trim() ||
    ''
  if (!secret || secret.length < 16) {
    return 'oma-vote-ballot-dev-fallback-key'
  }
  return secret
}

export function ballotCookieName(challengeId: string, phaseKey: string): string {
  const h = createHash('sha256')
    .update(`oma-ballot:${challengeId}:${phaseKey || '_'}`)
    .digest('hex')
    .slice(0, 20)
  return `oma_vb_${h}`
}

export function createBallotCookieValue(challengeId: string, phaseKey: string): string {
  const phase = phaseKey || '_'
  const ts = Date.now().toString(36)
  const payload = `${challengeId}.${phase}.${ts}`
  const sig = createHmac('sha256', getBallotSecret()).update(payload).digest('hex').slice(0, 32)
  return `${payload}.${sig}`
}

export function verifyBallotCookieValue(
  value: string | undefined | null,
  challengeId: string,
  phaseKey: string
): boolean {
  if (!value || typeof value !== 'string') return false
  const parts = value.split('.')
  if (parts.length !== 4) return false
  const [id, phase, ts, sig] = parts
  if (id !== challengeId) return false
  if (phase !== (phaseKey || '_')) return false
  if (!ts || !sig || sig.length !== 32) return false

  const payload = `${id}.${phase}.${ts}`
  const expected = createHmac('sha256', getBallotSecret()).update(payload).digest('hex').slice(0, 32)
  try {
    return timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}

export function hasBallotCookie(
  request: NextRequest,
  challengeId: string,
  phaseKey: string
): boolean {
  const name = ballotCookieName(challengeId, phaseKey)
  const raw = request.cookies.get(name)?.value
  return verifyBallotCookieValue(raw, challengeId, phaseKey)
}

export function applyBallotCookie(
  response: NextResponse,
  challengeId: string,
  phaseKey: string
): void {
  const name = ballotCookieName(challengeId, phaseKey)
  const value = createBallotCookieValue(challengeId, phaseKey)
  response.cookies.set({
    name,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SEC,
  })
}
