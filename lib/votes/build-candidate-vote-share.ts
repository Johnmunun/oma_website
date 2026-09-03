/**
 * Textes de partage multi-canal pour soutenir un candidat
 */

export function buildCandidateVoteShareText(input: {
  fullName: string
  number?: number | null
  candidateCode?: string | null
  challengeName: string
  voteUrl: string
  profileUrl?: string | null
}): string {
  const num =
    input.number != null && Number.isFinite(input.number)
      ? `#${input.number}`
      : null
  const code = input.candidateCode?.trim() || null
  const identity = [num, code].filter(Boolean).join(' · ')
  const who = identity
    ? `${input.fullName} (${identity})`
    : input.fullName

  const lines = [
    `Soutenez ${who} dans ${input.challengeName} !`,
    `Votez ici : ${input.voteUrl}`,
  ]
  if (input.profileUrl?.trim()) {
    lines.push(`Fiche : ${input.profileUrl.trim()}`)
  }
  return lines.join('\n')
}

export function buildCandidateVoteShareUrl(input: {
  voteBaseUrl: string
  candidateId: string
}): string {
  const base = input.voteBaseUrl.trim()
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}c=${encodeURIComponent(input.candidateId)}`
}

export function buildWhatsAppShareHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
