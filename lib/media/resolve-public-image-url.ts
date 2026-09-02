/**
 * Normalise et optimise les URLs d'images publiques (ImageKit, chemins locaux).
 */

const SIZE_MAP = { sm: 64, md: 80, lg: 96 } as const

export type StructureLogoSize = keyof typeof SIZE_MAP

export function resolvePublicImageUrl(
  url: string | null | undefined,
  size: StructureLogoSize = 'md'
): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  if (!trimmed.startsWith('http')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    const px = SIZE_MAP[size]

    if (parsed.hostname.includes('imagekit.io')) {
      if (!parsed.searchParams.has('tr')) {
        parsed.searchParams.set(
          'tr',
          `w-${px},h-${px},cm-pad_resize,bg-FFFFFF,f-auto,q-90`
        )
      }
      return parsed.toString()
    }

    return trimmed
  } catch {
    return trimmed
  }
}
