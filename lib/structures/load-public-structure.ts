import { ChallengeStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isPrismaClientOutdatedError } from '@/lib/authz/schema'
import { resolvePublicLandingServices } from '@/lib/structures/default-landing-services'

export type PublicLandingService = {
  title: string
  description: string
  iconKey: string
}

export type PublicStructureLanding = {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  subdomain: string | null
  landingPagePath: string | null
  publicUrl: string | null
  landingHeroTitle: string | null
  landingHeroHighlight: string | null
  landingHeroSubtitle: string | null
  landingThemeColor: string | null
  landingServicesIntro: string | null
  landingServices: PublicLandingService[]
  expertiseDomain: { name: string } | null
  parent: { name: string } | null
  challenges: {
    id: string
    name: string
    slug: string
    description: string | null
  }[]
}

const LANDING_WHERE = (normalized: string) => ({
  OR: [
    { slug: normalized },
    { landingPagePath: normalized },
    { subdomain: normalized },
  ],
  isActive: true,
  status: StructureStatus.ACTIVE,
})

const CHALLENGES_SELECT = {
  where: { status: ChallengeStatus.ACTIVE },
  orderBy: { createdAt: 'desc' as const },
  select: {
    id: true,
    name: true,
    slug: true,
    description: true,
  },
}

const LANDING_SERVICES_SELECT = {
  where: { isActive: true },
  orderBy: { sortOrder: 'asc' as const },
  select: {
    title: true,
    description: true,
    iconKey: true,
  },
}

const BASE_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  subdomain: true,
  landingPagePath: true,
  publicUrl: true,
  expertiseDomain: { select: { name: true } },
  parent: { select: { name: true } },
  challenges: CHALLENGES_SELECT,
}

const HERO_SELECT = {
  ...BASE_SELECT,
  landingHeroTitle: true,
  landingHeroHighlight: true,
  landingHeroSubtitle: true,
  landingThemeColor: true,
}

const FULL_SELECT = {
  ...HERO_SELECT,
  landingServicesIntro: true,
  landingServices: LANDING_SERVICES_SELECT,
}

async function loadStructureRow(
  normalized: string,
  select: typeof BASE_SELECT | typeof HERO_SELECT | typeof FULL_SELECT
) {
  return prisma.structure.findFirst({
    where: LANDING_WHERE(normalized),
    select,
  })
}

export async function loadPublicStructureBySegment(
  segment: string
): Promise<PublicStructureLanding | null> {
  const normalized = segment.trim().toLowerCase()
  if (!normalized) return null

  const selectAttempts = [FULL_SELECT, HERO_SELECT, BASE_SELECT] as const

  for (let index = 0; index < selectAttempts.length; index += 1) {
    const select = selectAttempts[index]
    try {
      const structure = await loadStructureRow(normalized, select)
      return structure ? withLandingDefaults(structure) : null
    } catch (error) {
      const hasFallback = index < selectAttempts.length - 1
      if (!hasFallback || !isPrismaClientOutdatedError(error)) {
        console.error('[loadPublicStructureBySegment]', error)
        return null
      }
      console.warn(
        '[loadPublicStructureBySegment] Client Prisma obsolète — repli sur un select réduit. Exécutez `npx prisma generate` puis redémarrez le serveur.'
      )
    }
  }

  return null
}

function withLandingDefaults(
  row: Omit<
    PublicStructureLanding,
    | 'landingHeroTitle'
    | 'landingHeroHighlight'
    | 'landingHeroSubtitle'
    | 'landingThemeColor'
    | 'landingServicesIntro'
    | 'landingServices'
  > &
    Partial<
      Pick<
        PublicStructureLanding,
        | 'landingHeroTitle'
        | 'landingHeroHighlight'
        | 'landingHeroSubtitle'
        | 'landingThemeColor'
        | 'landingServicesIntro'
        | 'landingServices'
      >
    >
): PublicStructureLanding {
  const rawServices = row.landingServices ?? []
  return {
    ...row,
    landingHeroTitle: row.landingHeroTitle ?? null,
    landingHeroHighlight: row.landingHeroHighlight ?? null,
    landingHeroSubtitle: row.landingHeroSubtitle ?? null,
    landingThemeColor: row.landingThemeColor ?? null,
    landingServicesIntro: row.landingServicesIntro ?? null,
    landingServices: resolvePublicLandingServices(rawServices),
  }
}
