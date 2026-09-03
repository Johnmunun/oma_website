/**
 * Résolution d'embed / vignette pour une ChallengeVideo
 */

import { ChallengeVideoSource } from '@prisma/client'
import {
  buildCloudflareLiveEmbedUrl,
  normalizeCloudflareCustomerCode,
  parseCloudflareEmbedUrl,
} from '@/lib/challenges/challenge-live-settings'
import { parseVideoUrl, type ParsedVideoUrl } from '@/lib/videos/parse-video-url'

type VideoLike = {
  videoUrl: string
  thumbnailUrl?: string | null
  source?: ChallengeVideoSource | string | null
  fileId?: string | null
}

function getPublicCustomerCode(): string | null {
  const raw =
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE?.trim() ||
        process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE?.trim())) ||
    ''
  return raw || null
}

function extractUidFromCloudflareUrl(raw: string): string | null {
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    if (
      !/cloudflarestream\.com$/i.test(url.hostname) &&
      !/videodelivery\.net$/i.test(url.hostname)
    ) {
      return null
    }
    const part = url.pathname.split('/').filter(Boolean)[0]
    return part && part.length >= 16 ? part : null
  } catch {
    return null
  }
}

function buildUploadPlayback(
  uid: string,
  customerHint: string | null,
  videoUrl: string,
  thumbnailUrl?: string | null
): ParsedVideoUrl | null {
  const customer =
    customerHint ||
    parseCloudflareEmbedUrl(videoUrl)?.customerCode ||
    getPublicCustomerCode()
  if (!customer) {
    if (/cloudflarestream\.com/i.test(videoUrl) && videoUrl.includes('/iframe')) {
      return {
        source: ChallengeVideoSource.UPLOAD,
        videoUrl,
        embedUrl: videoUrl,
        thumbnailUrl: thumbnailUrl ?? null,
        externalId: uid,
      }
    }
    return null
  }

  const customerNorm = normalizeCloudflareCustomerCode(customer)
  return {
    source: ChallengeVideoSource.UPLOAD,
    videoUrl,
    embedUrl: buildCloudflareLiveEmbedUrl({
      customerCode: customerNorm,
      liveInputId: uid,
    }),
    thumbnailUrl:
      thumbnailUrl ||
      `https://${customerNorm}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`,
    externalId: uid,
  }
}

export function resolveChallengeVideoPlayback(video: VideoLike): ParsedVideoUrl | null {
  const fileId = video.fileId?.trim() || null

  if (fileId || video.source === ChallengeVideoSource.UPLOAD || video.source === 'UPLOAD') {
    const uid =
      fileId ||
      parseCloudflareEmbedUrl(video.videoUrl)?.liveInputId ||
      extractUidFromCloudflareUrl(video.videoUrl)
    if (uid) {
      const built = buildUploadPlayback(
        uid,
        parseCloudflareEmbedUrl(video.videoUrl)?.customerCode ?? null,
        video.videoUrl,
        video.thumbnailUrl
      )
      if (built) return built
    }
  }

  const fromUrl = parseVideoUrl(video.videoUrl)
  if (fromUrl?.source === ChallengeVideoSource.UPLOAD && fromUrl.externalId) {
    return {
      ...fromUrl,
      thumbnailUrl: video.thumbnailUrl || fromUrl.thumbnailUrl,
    }
  }

  return fromUrl
    ? { ...fromUrl, thumbnailUrl: video.thumbnailUrl || fromUrl.thumbnailUrl }
    : null
}
