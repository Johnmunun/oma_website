/**
 * Charge la page Live publique d'un challenge (Cloudflare Stream)
 */

import { ChallengeStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseChallengeCoverImageUrl } from '@/lib/challenges/challenge-registration-settings'
import {
  parseLiveSettingsFromChallenge,
  resolveLiveEmbedUrl,
  type ChallengeLiveSettings,
} from '@/lib/challenges/challenge-live-settings'

const STRUCTURE_WHERE = (segment: string) => ({
  OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
  isActive: true,
  status: StructureStatus.ACTIVE,
})

export async function loadPublicChallengeLive(
  structureSegment: string,
  challengeSlug: string
) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()
  if (!segment || !slug) return null

  try {
    const structure = await prisma.structure.findFirst({
      where: STRUCTURE_WHERE(segment),
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        landingPagePath: true,
        subdomain: true,
        landingThemeColor: true,
      },
    })

    if (!structure) return null

    const challenge = await prisma.challenge.findFirst({
      where: {
        structureId: structure.id,
        slug,
        status: ChallengeStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        settings: true,
      },
    })

    if (!challenge) return null

    const live = parseLiveSettingsFromChallenge(challenge.settings)
    if (!live.enabled) return null

    const coverImageUrl = parseChallengeCoverImageUrl(challenge.settings)
    const embedUrl = resolveLiveEmbedUrl(live)
    const contactSlug =
      structure.landingPagePath?.trim() ||
      structure.subdomain?.trim() ||
      structure.slug

    return {
      structure,
      challenge: {
        id: challenge.id,
        name: challenge.name,
        slug: challenge.slug,
        description: challenge.description,
      },
      contactSlug,
      coverImageUrl,
      live,
      embedUrl,
    }
  } catch (error) {
    console.error('[loadPublicChallengeLive]', error)
    return null
  }
}

export type PublicChallengeLiveData = NonNullable<
  Awaited<ReturnType<typeof loadPublicChallengeLive>>
> & {
  live: ChallengeLiveSettings
  embedUrl: string | null
}
