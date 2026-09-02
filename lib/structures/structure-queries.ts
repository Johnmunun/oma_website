import type { PrismaClient } from '@prisma/client'
import { OMA_STRUCTURE_ID } from '@/lib/authz/constants'

const structureListInclude = {
  parent: { select: { id: true, name: true, slug: true } },
  expertiseDomain: { select: { id: true, name: true, slug: true } },
  _count: { select: { memberships: true, roles: true, children: true } },
} as const

function normalizeOptionalString(value?: string | null): string | null {
  if (!value || value.trim() === '') return null
  return value.trim()
}

export async function listStructuresForAdmin(prisma: PrismaClient) {
  return prisma.structure.findMany({
    orderBy: [{ landingOrder: 'asc' }, { name: 'asc' }],
    include: structureListInclude,
  })
}

/** Empêche qu'une structure devienne son propre ancêtre. */
export async function isStructureParentCycle(
  prisma: PrismaClient,
  structureId: string,
  candidateParentId: string
): Promise<boolean> {
  if (structureId === candidateParentId) return true

  let currentId: string | null = candidateParentId
  const visited = new Set<string>()

  while (currentId) {
    if (currentId === structureId) return true
    if (visited.has(currentId)) break
    visited.add(currentId)

    const node: { parentId: string | null } | null = await prisma.structure.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })
    currentId = node?.parentId ?? null
  }

  return false
}

export function isProtectedStructure(structureId: string): boolean {
  return structureId === OMA_STRUCTURE_ID
}

export { normalizeOptionalString }
