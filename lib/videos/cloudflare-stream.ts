/**
 * Cloudflare Stream — upload direct + URLs de lecture
 */

import 'server-only'

import {
  buildCloudflareLiveEmbedUrl,
  normalizeCloudflareCustomerCode,
} from '@/lib/challenges/challenge-live-settings'

export class CloudflareStreamError extends Error {
  constructor(
    message: string,
    public statusCode = 500
  ) {
    super(message)
    this.name = 'CloudflareStreamError'
  }
}

export function getCloudflareStreamConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || ''
  const apiToken =
    process.env.CLOUDFLARE_STREAM_API_TOKEN?.trim() ||
    process.env.CLOUDFLARE_API_TOKEN?.trim() ||
    ''
  const customerCode =
    process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE?.trim() ||
    ''

  return { accountId, apiToken, customerCode }
}

export function isCloudflareStreamConfigured(): boolean {
  const { accountId, apiToken, customerCode } = getCloudflareStreamConfig()
  return Boolean(accountId && apiToken && customerCode)
}

export function buildCloudflareStreamPlayback(opts: {
  videoUid: string
  customerCode?: string | null
}): {
  videoUrl: string
  embedUrl: string
  thumbnailUrl: string
  watchUrl: string
} {
  const cfg = getCloudflareStreamConfig()
  const customer = normalizeCloudflareCustomerCode(
    opts.customerCode?.trim() || cfg.customerCode
  )
  const uid = opts.videoUid.trim()
  if (!uid) {
    throw new CloudflareStreamError('Video UID Cloudflare manquant', 400)
  }

  const embedUrl = buildCloudflareLiveEmbedUrl({
    customerCode: customer,
    liveInputId: uid,
    dvrEnabled: false,
  })
  const watchUrl = `https://${customer}.cloudflarestream.com/${uid}/watch`
  const thumbnailUrl = `https://${customer}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`

  return {
    videoUrl: watchUrl,
    embedUrl,
    thumbnailUrl,
    watchUrl,
  }
}

/**
 * One-time direct upload URL (fichiers ≤ ~200 Mo via POST multipart).
 * https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/
 */
export async function createCloudflareDirectUpload(opts?: {
  maxDurationSeconds?: number
  creator?: string
  metaName?: string
}): Promise<{ uploadURL: string; uid: string }> {
  const { accountId, apiToken } = getCloudflareStreamConfig()
  if (!accountId || !apiToken) {
    throw new CloudflareStreamError(
      'Cloudflare Stream non configuré (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_STREAM_API_TOKEN)',
      503
    )
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: opts?.maxDurationSeconds ?? 600,
          creator: opts?.creator,
          meta: opts?.metaName ? { name: opts.metaName } : undefined,
          requireSignedURLs: false,
        }),
      }
    )

    const json = (await res.json()) as {
      success?: boolean
      errors?: Array<{ message?: string }>
      result?: { uploadURL?: string; uid?: string }
    }

    if (!res.ok || !json.success || !json.result?.uploadURL || !json.result?.uid) {
      const msg =
        json.errors?.[0]?.message ||
        `Impossible de créer l'URL d'upload Cloudflare (${res.status})`
      throw new CloudflareStreamError(msg, res.status >= 400 ? res.status : 502)
    }

    return {
      uploadURL: json.result.uploadURL,
      uid: json.result.uid,
    }
  } catch (error) {
    if (error instanceof CloudflareStreamError) throw error
    console.error('[CloudflareStream] createDirectUpload:', error)
    throw new CloudflareStreamError('Erreur réseau Cloudflare Stream', 502)
  }
}
