/**
 * @file prisma/seed-joystudio.ts
 * @description Configure JoyStudio : parent OMA, landing, services et Challenge Talents Enfants
 */

import { ChallengeStatus, PrismaClient, StructureStatus, StructureType } from '@prisma/client'
import { OMA_STRUCTURE_ID } from '../lib/authz/constants'
import { syncStructureLandingServices } from '../lib/structures/sync-landing-services'
import type { LandingServiceInput } from '../lib/structures/landing-service-schema'
import { seedJoyStudioManagerRole } from '../lib/authz/seed-joystudio-manager-role'
import {
  CHILDREN_CHALLENGE_REGISTRATION_SETTINGS,
  buildChallengeSettingsPayload,
} from '../lib/challenges/challenge-registration-settings'
import { mergeChallengeFeatureSettings } from '../lib/challenges/challenge-feature-settings'

/** Image hero par défaut pour la page d'inscription JoyStudio */
const JOYSTUDIO_CHALLENGE_COVER =
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1920&q=80'

const JOYSTUDIO_CHALLENGE_SETTINGS = mergeChallengeFeatureSettings(
  buildChallengeSettingsPayload(
    CHILDREN_CHALLENGE_REGISTRATION_SETTINGS,
    JOYSTUDIO_CHALLENGE_COVER
  ),
  {
    ranking: { published: false, showJuryDetails: true, juryWeight: 0.7, voteWeight: 0.3 },
    votes: { enabled: true, published: false },
  }
)

const JOYSTUDIO_SLUG = 'joystudio'

const JOYSTUDIO_SERVICES: LandingServiceInput[] = [
  {
    title: 'Art oratoire jeunesse',
    description:
      'Aider les enfants à prendre la parole avec assurance, structurer leurs idées et captiver un public.',
    iconKey: 'mic',
  },
  {
    title: 'Expression & confiance',
    description:
      'Développer la confiance en soi, la posture scénique et la présence devant un jury ou une caméra.',
    iconKey: 'sparkles',
  },
  {
    title: 'Coaching créatif',
    description:
      'Accompagner chaque talent dans sa singularité — voix, style et personnalité artistique.',
    iconKey: 'graduation',
  },
  {
    title: 'Communication & médias',
    description:
      'Initier les jeunes aux codes de la communication moderne et à la valorisation de leur image.',
    iconKey: 'megaphone',
  },
]

export async function seedJoyStudio(prisma: PrismaClient) {
  console.log('🎬 Seed JoyStudio...')

  const existing = await prisma.structure.findUnique({ where: { slug: JOYSTUDIO_SLUG } })
  if (!existing) {
    console.log('   ⚠️  JoyStudio introuvable — créez-la depuis /admin/structures puis relancez le seed.')
    return
  }

  const structure = await prisma.structure.update({
    where: { id: existing.id },
    data: {
      parentId: OMA_STRUCTURE_ID,
      type: StructureType.PARTNER,
      status: StructureStatus.ACTIVE,
      isActive: true,
      landingPagePath: JOYSTUDIO_SLUG,
      subdomain: JOYSTUDIO_SLUG,
      showOnLanding: true,
      landingOrder: 1,
      landingHeroTitle: 'Révélez les talents',
      landingHeroHighlight: 'de la prochaine génération.',
      landingHeroSubtitle:
        'JoyStudio accompagne les jeunes dans l’expression oratoire, la créativité et la confiance en soi — au cœur du Réseau OMA.',
      landingThemeColor: '#9333ea',
      landingServicesIntro:
        'JoyStudio propose des programmes concrets pour aider les jeunes à s’exprimer, se faire remarquer et progresser — avec l’expertise du Réseau OMA.',
    },
  })

  await syncStructureLandingServices(prisma, structure.id, JOYSTUDIO_SERVICES)

  const challenge = await prisma.challenge.upsert({
    where: {
      structureId_slug: {
        structureId: structure.id,
        slug: 'talents-enfants',
      },
    },
    update: {
      name: 'Challenge Talents Enfants',
      description:
        'Un concours éducatif pour les enfants qui souhaitent s’exprimer, prendre la parole et développer leur confiance en soi devant un public.',
      status: ChallengeStatus.ACTIVE,
      settings: JOYSTUDIO_CHALLENGE_SETTINGS,
    },
    create: {
      structureId: structure.id,
      name: 'Challenge Talents Enfants',
      slug: 'talents-enfants',
      description:
        'Un concours éducatif pour les enfants qui souhaitent s’exprimer, prendre la parole et développer leur confiance en soi devant un public.',
      status: ChallengeStatus.ACTIVE,
      settings: JOYSTUDIO_CHALLENGE_SETTINGS,
    },
  })

  console.log(`   ✅ Structure ${structure.name} (parent OMA, landing, ${JOYSTUDIO_SERVICES.length} services)`)
  console.log(`   ✅ Challenge « ${challenge.name} » (${challenge.status})`)

  await seedJoyStudioManagerRole(prisma)
}
