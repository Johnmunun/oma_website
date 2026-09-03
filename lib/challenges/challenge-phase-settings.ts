/**
 * Phases / tours d'un challenge (stockés dans Challenge.settings.phases)
 */

import { z } from 'zod'
import { randomUUID } from 'crypto'

export const challengePhaseStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'CLOSED'])

export const challengePhaseItemSchema = z.object({
  id: z.string().min(8).max(64),
  name: z.string().min(1).max(80),
  order: z.number().int().min(0).default(0),
  status: challengePhaseStatusSchema.default('DRAFT'),
})

export const challengePhasesSettingsSchema = z.object({
  /** Active le mode multi-tours */
  enabled: z.boolean().default(false),
  /** Phase ouverte au vote / affichage public */
  activePhaseId: z.string().min(8).max(64).nullable().default(null),
  items: z.array(challengePhaseItemSchema).default([]),
})

export type ChallengePhaseStatus = z.infer<typeof challengePhaseStatusSchema>
export type ChallengePhaseItem = z.infer<typeof challengePhaseItemSchema>
export type ChallengePhasesSettings = z.infer<typeof challengePhasesSettingsSchema>

export const DEFAULT_PHASES_SETTINGS: ChallengePhasesSettings = {
  enabled: false,
  activePhaseId: null,
  items: [],
}

export const updatePhasesSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  activePhaseId: z.string().min(8).max(64).nullable().optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(8).max(64).optional(),
        name: z.string().min(1).max(80),
        order: z.number().int().min(0).optional(),
        status: challengePhaseStatusSchema.optional(),
      })
    )
    .optional(),
})

export function parsePhasesSettings(raw: unknown): ChallengePhasesSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PHASES_SETTINGS }
  try {
    return challengePhasesSettingsSchema.parse(raw)
  } catch {
    return { ...DEFAULT_PHASES_SETTINGS }
  }
}

export function parsePhasesSettingsFromChallenge(raw: unknown): ChallengePhasesSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PHASES_SETTINGS }
  const obj = raw as Record<string, unknown>
  return parsePhasesSettings(obj.phases)
}

export function createPhaseId(): string {
  return randomUUID()
}

export function mergeChallengePhasesSettings(
  existingSettings: unknown,
  patch: z.infer<typeof updatePhasesSettingsSchema>
): Record<string, unknown> {
  const base =
    existingSettings && typeof existingSettings === 'object'
      ? { ...(existingSettings as Record<string, unknown>) }
      : {}

  const current = parsePhasesSettings(base.phases)

  let items = current.items
  if (patch.items) {
    items = patch.items.map((item, index) =>
      challengePhaseItemSchema.parse({
        id: item.id?.trim() || createPhaseId(),
        name: item.name.trim(),
        order: item.order ?? index,
        status: item.status ?? 'DRAFT',
      })
    )
    items.sort((a, b) => a.order - b.order)
  }

  let activePhaseId =
    patch.activePhaseId !== undefined ? patch.activePhaseId : current.activePhaseId

  if (activePhaseId && !items.some((p) => p.id === activePhaseId)) {
    activePhaseId = null
  }

  const enabled = patch.enabled ?? current.enabled

  const merged = challengePhasesSettingsSchema.parse({
    enabled,
    activePhaseId: enabled ? activePhaseId : null,
    items,
  })

  return {
    ...base,
    phases: merged,
  }
}

/** Clé stockée sur ChallengeVote.phaseId ('' = hors phases) */
export function getVotePhaseKey(phases: ChallengePhasesSettings): string {
  if (!phases.enabled || !phases.activePhaseId) return ''
  return phases.activePhaseId
}

export function getActivePhase(
  phases: ChallengePhasesSettings
): ChallengePhaseItem | null {
  if (!phases.enabled || !phases.activePhaseId) return null
  return phases.items.find((p) => p.id === phases.activePhaseId) ?? null
}
