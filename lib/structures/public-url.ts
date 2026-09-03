/**
 * URLs publiques des structures (landing + sous-domaine)
 */

export function getMainSiteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, '')
  if (url) return url

  const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim()
  if (domain) return `https://${domain}`

  return 'http://localhost:3000'
}

export function getStructurePathSegment(structure: {
  slug: string
  landingPagePath?: string | null
  subdomain?: string | null
}): string {
  return (
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug
  )
}

export function getStructurePublicUrls(structure: {
  slug: string
  landingPagePath?: string | null
  subdomain?: string | null
}): {
  pathUrl: string
  subdomainUrl: string | null
  primaryUrl: string
} {
  const origin = getMainSiteOrigin()
  const segment = getStructurePathSegment(structure)
  const pathUrl = `${origin}/s/${segment}`

  const siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim()
  const sub = structure.subdomain?.trim()
  const subdomainUrl =
    siteDomain && sub ? `https://${sub}.${siteDomain}` : null

  const useSubdomainAsPrimary =
    subdomainUrl && process.env.NODE_ENV !== 'development'

  return {
    pathUrl,
    subdomainUrl,
    primaryUrl: useSubdomainAsPrimary ? subdomainUrl : pathUrl,
  }
}

/** Page publique d'inscription à un challenge */
export function getChallengeRegistrationUrl(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  const origin = getMainSiteOrigin()
  const segment = getStructurePathSegment(structure)
  const slug = challengeSlug.trim().toLowerCase()
  return `${origin}/s/${segment}/challenges/${slug}/inscription`
}

export function getChallengeRegistrationPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  const segment = getStructurePathSegment(structure)
  const slug = challengeSlug.trim().toLowerCase()
  return `/s/${segment}/challenges/${slug}/inscription`
}

export function getChallengeRegistrationSuccessPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  return `${getChallengeRegistrationPath(structure, challengeSlug)}/success`
}

export function getChallengeRegistrationErrorPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  return `${getChallengeRegistrationPath(structure, challengeSlug)}/erreur`
}

export function getChallengeVideoSubmitPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string,
  token: string
): string {
  const segment = getStructurePathSegment(structure)
  const slug = challengeSlug.trim().toLowerCase()
  return `/s/${segment}/challenges/${slug}/video/${token}`
}

export function getChallengeVideoSubmitUrl(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string,
  token: string
): string {
  return `${getMainSiteOrigin()}${getChallengeVideoSubmitPath(structure, challengeSlug, token)}`
}

export function getChallengeJuryPortalPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string,
  token: string
): string {
  const segment = getStructurePathSegment(structure)
  const slug = challengeSlug.trim().toLowerCase()
  return `/s/${segment}/challenges/${slug}/jury/${token}`
}

export function getChallengeJuryPortalUrl(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string,
  token: string
): string {
  return `${getMainSiteOrigin()}${getChallengeJuryPortalPath(structure, challengeSlug, token)}`
}

export function getChallengeRankingsPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  const segment = getStructurePathSegment(structure)
  const slug = challengeSlug.trim().toLowerCase()
  return `/s/${segment}/challenges/${slug}/classement`
}

export function getChallengeRankingsUrl(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  return `${getMainSiteOrigin()}${getChallengeRankingsPath(structure, challengeSlug)}`
}

export function getChallengeVotesPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  const segment = getStructurePathSegment(structure)
  const slug = challengeSlug.trim().toLowerCase()
  return `/s/${segment}/challenges/${slug}/votes`
}

/** Lien court de vote public : /s/{structure}/v/{token} */
export function getChallengeVotePortalPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  voteToken: string
): string {
  const segment = getStructurePathSegment(structure)
  return `/s/${segment}/v/${voteToken.trim()}`
}

export function getChallengeVotePortalUrl(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  voteToken: string
): string {
  return `${getMainSiteOrigin()}${getChallengeVotePortalPath(structure, voteToken)}`
}

export function getChallengeVotesUrl(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  return `${getMainSiteOrigin()}${getChallengeVotesPath(structure, challengeSlug)}`
}

/** Hub public du challenge */
export function getChallengeHubPath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  const segment = getStructurePathSegment(structure)
  const slug = challengeSlug.trim().toLowerCase()
  return `/s/${segment}/challenges/${slug}`
}

export function getChallengeHubUrl(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string
): string {
  return `${getMainSiteOrigin()}${getChallengeHubPath(structure, challengeSlug)}`
}

/** Fiche publique d'un candidat (par code KID-0001) */
export function getChallengeCandidatePath(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string,
  candidateCode: string
): string {
  const segment = getStructurePathSegment(structure)
  const slug = challengeSlug.trim().toLowerCase()
  const code = encodeURIComponent(candidateCode.trim())
  return `/s/${segment}/challenges/${slug}/candidats/${code}`
}

export function getChallengeCandidateUrl(
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  },
  challengeSlug: string,
  candidateCode: string
): string {
  return `${getMainSiteOrigin()}${getChallengeCandidatePath(structure, challengeSlug, candidateCode)}`
}
