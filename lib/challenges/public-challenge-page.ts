/** Données communes aux pages publiques d'un challenge (inscription, classement, votes…) */
export type PublicChallengePageData = {
  structure: {
    id?: string
    name: string
    slug: string
    logoUrl: string | null
    landingPagePath?: string | null
    subdomain?: string | null
    landingThemeColor: string | null
  }
  challenge: {
    id?: string
    name: string
    slug: string
    description?: string | null
  }
  contactSlug: string
  coverImageUrl?: string | null
}
