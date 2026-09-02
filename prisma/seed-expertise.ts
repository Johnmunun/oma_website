/**
 * Seed des domaines d'expertise par défaut
 */

import type { PrismaClient } from '@prisma/client'

const DEFAULT_DOMAINS = [
  {
    slug: 'art-oratoire',
    name: 'Art oratoire & Maîtrise de cérémonie',
    description:
      'Développez votre éloquence et votre présence scénique pour captiver votre audience.',
    iconKey: 'mic',
    sortOrder: 0,
  },
  {
    slug: 'evenementiel',
    name: 'Événementiel',
    description:
      'Organisez et animez des événements mémorables avec professionnalisme et charisme.',
    iconKey: 'calendar',
    sortOrder: 1,
  },
  {
    slug: 'communication-medias',
    name: 'Communication & Médias',
    description:
      'Maîtrisez les techniques de communication moderne et la gestion médiatique.',
    iconKey: 'megaphone',
    sortOrder: 2,
  },
  {
    slug: 'marketing-digital',
    name: 'Marketing digital & Publicité',
    description:
      'Exploitez le pouvoir du digital pour développer votre marque et votre influence.',
    iconKey: 'smartphone',
    sortOrder: 3,
  },
  {
    slug: 'formation-consultation',
    name: 'Formation & Consultation',
    description:
      "Bénéficiez d'un accompagnement personnalisé pour atteindre vos objectifs.",
    iconKey: 'graduation',
    sortOrder: 4,
  },
] as const

export async function seedExpertiseDomains(prisma: PrismaClient) {
  console.log("📚 Seed domaines d'expertise...")

  for (const domain of DEFAULT_DOMAINS) {
    await prisma.expertiseDomain.upsert({
      where: { slug: domain.slug },
      update: {
        name: domain.name,
        description: domain.description,
        iconKey: domain.iconKey,
        sortOrder: domain.sortOrder,
        isActive: true,
      },
      create: {
        name: domain.name,
        slug: domain.slug,
        description: domain.description,
        iconKey: domain.iconKey,
        sortOrder: domain.sortOrder,
        isActive: true,
      },
    })
  }

  console.log(`   ✅ ${DEFAULT_DOMAINS.length} domaines d'expertise`)
}
