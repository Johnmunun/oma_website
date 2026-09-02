import type { LandingServiceInput } from '@/lib/structures/landing-service-schema'

export const DEFAULT_LANDING_SERVICES: LandingServiceInput[] = [
  {
    title: 'Art oratoire',
    description: 'Prendre la parole avec impact, structurer un discours et captiver un public.',
    iconKey: 'mic',
  },
  {
    title: 'Leadership',
    description: 'Développer votre posture de leader et mobiliser une équipe autour d\'une vision.',
    iconKey: 'users',
  },
  {
    title: 'Communication',
    description: 'Affûter votre message, votre présence et votre relation avec l\'audience.',
    iconKey: 'megaphone',
  },
  {
    title: 'Marketing digital',
    description: 'Renforcer votre visibilité en ligne et valoriser votre talent sur les bons canaux.',
    iconKey: 'trending',
  },
]

export type PublicLandingService = {
  title: string
  description: string
  iconKey: string
}

export function resolvePublicLandingServices(
  services: Array<Partial<PublicLandingService> & { title: string; iconKey: string }> | undefined | null
): PublicLandingService[] {
  if (services && services.length > 0) {
    return services.map((service) => ({
      title: service.title,
      description: service.description?.trim() ?? '',
      iconKey: service.iconKey || 'mic',
    }))
  }
  return DEFAULT_LANDING_SERVICES.map((service) => ({
    title: service.title,
    description: service.description?.trim() ?? '',
    iconKey: service.iconKey || 'mic',
  }))
}
