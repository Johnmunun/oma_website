import { ChallengeStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isPrismaClientOutdatedError } from '@/lib/authz/schema'
import {
  parseChallengeCoverImageUrl,
  parseChallengeSettings,
  type ChallengeRegistrationSettings,
} from '@/lib/challenges/challenge-registration-settings'

export type PublicChallengeRegistrationPage = {
  structure: {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    landingPagePath: string | null
    subdomain: string | null
    landingThemeColor: string | null
    landingHeroTitle: string | null
    landingHeroHighlight: string | null
  }
  challenge: {
    id: string
    name: string
    slug: string
    description: string | null
    status: ChallengeStatus
  }
  registrationSettings: ChallengeRegistrationSettings
  coverImageUrl: string | null
  contactSlug: string
}

const STRUCTURE_WHERE = (segment: string) => ({
  OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
  isActive: true,
  status: StructureStatus.ACTIVE,
})

export async function loadPublicChallengeRegistrationPage(
  structureSegment: string,
  challengeSlug: string
): Promise<PublicChallengeRegistrationPage | null> {
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
        landingHeroTitle: true,
        landingHeroHighlight: true,
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
        status: true,
        settings: true,
      },
    })

    if (!challenge) return null

    const contactSlug =
      structure.landingPagePath?.trim() ||
      structure.subdomain?.trim() ||
      structure.slug

    const registrationSettings = parseChallengeSettings(challenge.settings)
    let coverImageUrl = parseChallengeCoverImageUrl(challenge.settings)

    if (!coverImageUrl) {
      try {
        const siteSetting = await prisma.setting.findFirst({
          orderBy: { updatedAt: 'desc' },
          select: { heroImageUrl: true, coverImageUrl: true },
        })
        coverImageUrl =
          siteSetting?.heroImageUrl?.trim() ||
          siteSetting?.coverImageUrl?.trim() ||
          null
      } catch {
        // fallback silencieux — gradient sans image
      }
    }

    return { structure, challenge, registrationSettings, coverImageUrl, contactSlug }
  } catch (error) {
    if (!isPrismaClientOutdatedError(error)) {
      console.error('[loadPublicChallengeRegistrationPage]', error)
    }
    return null
  }
}
