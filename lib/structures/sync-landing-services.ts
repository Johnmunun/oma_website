import type { PrismaClient } from '@prisma/client'
import type { LandingServiceInput } from '@/lib/structures/landing-service-schema'

export async function syncStructureLandingServices(
  prisma: PrismaClient,
  structureId: string,
  services: LandingServiceInput[] | undefined
) {
  if (services === undefined) return

  await prisma.$transaction(async (tx) => {
    await tx.structureLandingService.deleteMany({ where: { structureId } })

    if (services.length === 0) return

    await tx.structureLandingService.createMany({
      data: services.map((service, index) => ({
        structureId,
        title: service.title.trim(),
        description: service.description?.trim() ?? '',
        iconKey: service.iconKey || 'mic',
        sortOrder: index,
        isActive: true,
      })),
    })
  })
}
