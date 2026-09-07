/**
 * URLs publiques des structures (landing + sous-domaine)
 *
 * Canonique structures : https://{subdomain}.oratoiremonart.org/...
 * Fallback chemin :     https://oratoiremonart.org/s/{segment}/...
 */

import { getMainSiteDomain, getMainSiteOrigin } from '@/lib/site-origin'

export { getMainSiteOrigin } from '@/lib/site-origin'

export type StructureUrlRef = {
  slug: string
  landingPagePath?: string | null
  subdomain?: string | null
}

export function getStructurePathSegment(structure: StructureUrlRef): string {
  return (
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug
  )
}

/** Sous-domaine DNS de la structure (ex. joystudio) */
export function getStructureSubdomainLabel(structure: StructureUrlRef): string | null {
  const sub = (structure.subdomain?.trim() || structure.slug?.trim() || '').toLowerCase()
  return sub || null
}

/** Hôte public structure : joystudio.oratoiremonart.org */
export function getStructureSubdomainHost(structure: StructureUrlRef): string | null {
  const siteDomain = getMainSiteDomain()
  const sub = getStructureSubdomainLabel(structure)
  if (!siteDomain || !sub) return null
  return `${sub}.${siteDomain}`
}

/**
 * Origine publique d'une structure.
 * Ex. https://joystudio.oratoiremonart.org
 * Fallback : origine du site principal (chemins /s/...).
 */
export function getStructurePublicOrigin(structure: StructureUrlRef): string {
  const host = getStructureSubdomainHost(structure)
  if (host) return `https://${host}`
  return getMainSiteOrigin()
}

function usesStructureSubdomain(structure: StructureUrlRef): boolean {
  return Boolean(getStructureSubdomainHost(structure))
}

/**
 * Chemin interne Next (App Router) — toujours préfixé /s/{segment}
 * pour fonctionner sur le domaine principal et via rewrite sous-domaine.
 */
export function getStructureAppPath(
  structure: StructureUrlRef,
  suffix = ''
): string {
  const segment = getStructurePathSegment(structure)
  const clean = suffix.startsWith('/') ? suffix : suffix ? `/${suffix}` : ''
  return `/s/${segment}${clean}`
}

/**
 * URL absolue publique.
 * Sous-domaine : https://joystudio.domain/challenges/...
 * Sinon :        https://domain/s/joystudio/challenges/...
 */
export function getStructurePublicAbsoluteUrl(
  structure: StructureUrlRef,
  suffix = ''
): string {
  const clean = suffix.startsWith('/') ? suffix : suffix ? `/${suffix}` : ''
  if (usesStructureSubdomain(structure)) {
    return `${getStructurePublicOrigin(structure)}${clean || '/'}`
  }
  return `${getMainSiteOrigin()}${getStructureAppPath(structure, clean)}`
}

export function getStructurePublicUrls(structure: StructureUrlRef): {
  pathUrl: string
  subdomainUrl: string | null
  primaryUrl: string
} {
  const pathUrl = `${getMainSiteOrigin()}${getStructureAppPath(structure)}`
  const host = getStructureSubdomainHost(structure)
  const subdomainUrl = host ? `https://${host}` : null

  return {
    pathUrl,
    subdomainUrl,
    primaryUrl: subdomainUrl || pathUrl,
  }
}

/** Page publique d'inscription à un challenge */
export function getChallengeRegistrationUrl(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructurePublicAbsoluteUrl(structure, `/challenges/${slug}/inscription`)
}

export function getChallengeRegistrationPath(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructureAppPath(structure, `/challenges/${slug}/inscription`)
}

export function getChallengeRegistrationSuccessPath(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  return `${getChallengeRegistrationPath(structure, challengeSlug)}/success`
}

export function getChallengeRegistrationErrorPath(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  return `${getChallengeRegistrationPath(structure, challengeSlug)}/erreur`
}

export function getChallengeVideoSubmitPath(
  structure: StructureUrlRef,
  challengeSlug: string,
  token: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructureAppPath(structure, `/challenges/${slug}/video/${token}`)
}

export function getChallengeVideoSubmitUrl(
  structure: StructureUrlRef,
  challengeSlug: string,
  token: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructurePublicAbsoluteUrl(
    structure,
    `/challenges/${slug}/video/${token}`
  )
}

export function getChallengeJuryPortalPath(
  structure: StructureUrlRef,
  challengeSlug: string,
  token: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructureAppPath(structure, `/challenges/${slug}/jury/${token}`)
}

export function getChallengeJuryPortalUrl(
  structure: StructureUrlRef,
  challengeSlug: string,
  token: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructurePublicAbsoluteUrl(
    structure,
    `/challenges/${slug}/jury/${token}`
  )
}

export function getChallengeRankingsPath(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructureAppPath(structure, `/challenges/${slug}/classement`)
}

export function getChallengeRankingsUrl(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructurePublicAbsoluteUrl(
    structure,
    `/challenges/${slug}/classement`
  )
}

export function getChallengeVotesPath(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructureAppPath(structure, `/challenges/${slug}/votes`)
}

/** Lien court de vote public (chemin app) */
export function getChallengeVotePortalPath(
  structure: StructureUrlRef,
  voteToken: string
): string {
  return getStructureAppPath(structure, `/v/${voteToken.trim()}`)
}

export function getChallengeVotePortalUrl(
  structure: StructureUrlRef,
  voteToken: string
): string {
  return getStructurePublicAbsoluteUrl(structure, `/v/${voteToken.trim()}`)
}

export function getChallengeVotesUrl(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructurePublicAbsoluteUrl(structure, `/challenges/${slug}/votes`)
}

/** Hub public du challenge */
export function getChallengeHubPath(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructureAppPath(structure, `/challenges/${slug}`)
}

export function getChallengeHubUrl(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructurePublicAbsoluteUrl(structure, `/challenges/${slug}`)
}

/** Fiche publique d'un candidat (par code KID-0001) */
export function getChallengeCandidatePath(
  structure: StructureUrlRef,
  challengeSlug: string,
  candidateCode: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  const code = encodeURIComponent(candidateCode.trim())
  return getStructureAppPath(structure, `/challenges/${slug}/candidats/${code}`)
}

export function getChallengeCandidateUrl(
  structure: StructureUrlRef,
  challengeSlug: string,
  candidateCode: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  const code = encodeURIComponent(candidateCode.trim())
  return getStructurePublicAbsoluteUrl(
    structure,
    `/challenges/${slug}/candidats/${code}`
  )
}

/** Page Live Cloudflare Stream du challenge */
export function getChallengeLivePath(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructureAppPath(structure, `/challenges/${slug}/live`)
}

export function getChallengeLiveUrl(
  structure: StructureUrlRef,
  challengeSlug: string
): string {
  const slug = challengeSlug.trim().toLowerCase()
  return getStructurePublicAbsoluteUrl(structure, `/challenges/${slug}/live`)
}
