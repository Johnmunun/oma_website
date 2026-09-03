/**
 * Réglages Live Cloudflare Stream (stockés dans Challenge.settings.live)
 */

import { z } from 'zod'

function emptyToNullString(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null
  return String(v)
}

const nullableString = z.preprocess(emptyToNullString, z.string().max(500).nullable())

export const challengeLiveSettingsSchema = z.object({
  /** Page publique /s/.../live accessible */
  enabled: z.boolean().default(false),
  /** Diffusion en cours (badge Live + lecteur) */
  isLive: z.boolean().default(false),
  /** Afficher le CTA Live sur le hub du challenge */
  showOnHub: z.boolean().default(true),
  title: z.preprocess(emptyToNullString, z.string().max(120).nullable()).default(null),
  description: z.preprocess(emptyToNullString, z.string().max(500).nullable()).default(null),
  /** Ex. customer-igynxd2rwhmuoxw8 ou igynxd2rwhmuoxw8 */
  customerCode: z.preprocess(emptyToNullString, z.string().max(80).nullable()).default(null),
  /** Live Input ID Cloudflare (ou Video ID VOD) */
  liveInputId: z.preprocess(emptyToNullString, z.string().max(80).nullable()).default(null),
  /**
   * URL iframe complète Cloudflare (prioritaire si renseignée).
   * Ex. https://customer-xxx.cloudflarestream.com/{id}/iframe
   */
  embedUrl: nullableString.default(null),
  dvrEnabled: z.boolean().default(false),
  /** ISO ou datetime local — validé côté affichage */
  scheduledAt: z.preprocess(emptyToNullString, z.string().max(40).nullable()).default(null),
  /** Afficher le replay VOD quand le live est terminé */
  replayEnabled: z.boolean().default(false),
  /** Video ID Cloudflare Stream (enregistrement / VOD) */
  vodVideoId: z.preprocess(emptyToNullString, z.string().max(80).nullable()).default(null),
  /** URL iframe replay (prioritaire sur vodVideoId) */
  replayEmbedUrl: nullableString.default(null),
  /** Chat public sur la page Live */
  chatEnabled: z.boolean().default(false),
})

export type ChallengeLiveSettings = z.infer<typeof challengeLiveSettingsSchema>

export const DEFAULT_LIVE_SETTINGS: ChallengeLiveSettings = {
  enabled: false,
  isLive: false,
  showOnHub: true,
  title: null,
  description: null,
  customerCode: null,
  liveInputId: null,
  embedUrl: null,
  dvrEnabled: false,
  scheduledAt: null,
  replayEnabled: false,
  vodVideoId: null,
  replayEmbedUrl: null,
  chatEnabled: false,
}

export const updateLiveSettingsSchema = challengeLiveSettingsSchema.partial()

const CLOUDFLARE_IFRAME_RE =
  /^https:\/\/(customer-[a-z0-9]+)\.cloudflarestream\.com\/([A-Za-z0-9._-]+)\/iframe(?:\?[^#]*)?$/i

/** Extrait customer + input depuis une URL iframe Cloudflare */
export function parseCloudflareEmbedUrl(raw: string): {
  customerCode: string
  liveInputId: string
} | null {
  const url = raw.trim()
  const match = CLOUDFLARE_IFRAME_RE.exec(url)
  if (!match) return null
  return { customerCode: match[1], liveInputId: match[2] }
}

export function normalizeCloudflareCustomerCode(raw: string): string {
  const trimmed = raw.trim().replace(/^https?:\/\//i, '').split('/')[0] ?? ''
  const host = trimmed.replace(/\.cloudflarestream\.com$/i, '')
  if (host.startsWith('customer-')) return host
  return `customer-${host.replace(/^customer-/i, '')}`
}

export function buildCloudflareLiveEmbedUrl(opts: {
  customerCode: string
  liveInputId: string
  dvrEnabled?: boolean
}): string {
  const customer = normalizeCloudflareCustomerCode(opts.customerCode)
  const id = opts.liveInputId.trim()
  const base = `https://${customer}.cloudflarestream.com/${id}/iframe`
  return opts.dvrEnabled ? `${base}?dvrEnabled=true` : base
}

export function resolveLiveEmbedUrl(live: ChallengeLiveSettings): string | null {
  const pasted = live.embedUrl?.trim()
  if (pasted) {
    const parsed = parseCloudflareEmbedUrl(pasted)
    if (parsed) {
      return buildCloudflareLiveEmbedUrl({
        customerCode: parsed.customerCode,
        liveInputId: parsed.liveInputId,
        dvrEnabled: live.dvrEnabled,
      })
    }
    if (/cloudflarestream\.com/i.test(pasted) && pasted.includes('/iframe')) {
      try {
        const u = new URL(pasted)
        if (live.dvrEnabled) u.searchParams.set('dvrEnabled', 'true')
        else u.searchParams.delete('dvrEnabled')
        return u.toString()
      } catch {
        return pasted
      }
    }
  }

  if (live.customerCode?.trim() && live.liveInputId?.trim()) {
    return buildCloudflareLiveEmbedUrl({
      customerCode: live.customerCode,
      liveInputId: live.liveInputId,
      dvrEnabled: live.dvrEnabled,
    })
  }

  return null
}

/** Lecteur VOD / replay Cloudflare (sans dvrEnabled) */
export function resolveReplayEmbedUrl(live: ChallengeLiveSettings): string | null {
  const pasted = live.replayEmbedUrl?.trim()
  if (pasted) {
    const parsed = parseCloudflareEmbedUrl(pasted)
    if (parsed) {
      return buildCloudflareLiveEmbedUrl({
        customerCode: parsed.customerCode,
        liveInputId: parsed.liveInputId,
        dvrEnabled: false,
      })
    }
    if (/cloudflarestream\.com/i.test(pasted) && pasted.includes('/iframe')) {
      try {
        const u = new URL(pasted)
        u.searchParams.delete('dvrEnabled')
        return u.toString()
      } catch {
        return pasted
      }
    }
  }

  if (live.customerCode?.trim() && live.vodVideoId?.trim()) {
    return buildCloudflareLiveEmbedUrl({
      customerCode: live.customerCode,
      liveInputId: live.vodVideoId,
      dvrEnabled: false,
    })
  }

  return null
}

export function parseLiveSettings(raw: unknown): ChallengeLiveSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_LIVE_SETTINGS }
  try {
    return challengeLiveSettingsSchema.parse(raw)
  } catch {
    return { ...DEFAULT_LIVE_SETTINGS }
  }
}

export function parseLiveSettingsFromChallenge(raw: unknown): ChallengeLiveSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_LIVE_SETTINGS }
  const obj = raw as Record<string, unknown>
  return parseLiveSettings(obj.live)
}

export function mergeChallengeLiveSettings(
  existingSettings: unknown,
  patch: Partial<ChallengeLiveSettings>
): Record<string, unknown> {
  const base =
    existingSettings && typeof existingSettings === 'object'
      ? { ...(existingSettings as Record<string, unknown>) }
      : {}

  const current = parseLiveSettings(base.live)
  const mergedLive = challengeLiveSettingsSchema.parse({
    ...current,
    ...patch,
  })

  if (typeof patch.embedUrl === 'string' && patch.embedUrl.trim()) {
    const parsed = parseCloudflareEmbedUrl(patch.embedUrl.trim())
    if (parsed) {
      mergedLive.customerCode = parsed.customerCode
      mergedLive.liveInputId = parsed.liveInputId
    }
  }

  if (typeof patch.replayEmbedUrl === 'string' && patch.replayEmbedUrl.trim()) {
    const parsed = parseCloudflareEmbedUrl(patch.replayEmbedUrl.trim())
    if (parsed) {
      if (!mergedLive.customerCode) mergedLive.customerCode = parsed.customerCode
      mergedLive.vodVideoId = parsed.liveInputId
    }
  }

  return {
    ...base,
    live: mergedLive,
  }
}

/** Live visible sur le hub (publié + showOnHub) */
export function isLiveVisibleOnHub(live: ChallengeLiveSettings): boolean {
  return live.enabled && live.showOnHub
}
