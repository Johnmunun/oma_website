/** Chemin public d'une structure (landing codée sous /s/{path}) */
export function getStructureLandingPath(structure: {
  slug: string
  landingPagePath?: string | null
}): string {
  const segment = structure.landingPagePath?.trim() || structure.slug
  return `/s/${segment}`
}
