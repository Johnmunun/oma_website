import { ChallengeVideoSource } from '@prisma/client'

export type ParsedVideoUrl = {
  source: ChallengeVideoSource
  videoUrl: string
  embedUrl: string
  thumbnailUrl: string | null
  externalId: string | null
}

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
]

const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/

export function parseVideoUrl(raw: string): ParsedVideoUrl | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const href = url.href

    for (const pattern of YOUTUBE_PATTERNS) {
      const match = href.match(pattern)
      if (match?.[1]) {
        const id = match[1]
        return {
          source: ChallengeVideoSource.YOUTUBE,
          videoUrl: `https://www.youtube.com/watch?v=${id}`,
          embedUrl: `https://www.youtube.com/embed/${id}`,
          thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          externalId: id,
        }
      }
    }

    const vimeoMatch = href.match(VIMEO_PATTERN)
    if (vimeoMatch?.[1]) {
      const id = vimeoMatch[1]
      return {
        source: ChallengeVideoSource.VIMEO,
        videoUrl: `https://vimeo.com/${id}`,
        embedUrl: `https://player.vimeo.com/video/${id}`,
        thumbnailUrl: null,
        externalId: id,
      }
    }

    if (url.protocol === 'https:' || url.protocol === 'http:') {
      // Cloudflare Stream (iframe / watch)
      if (/cloudflarestream\.com$/i.test(url.hostname)) {
        const uid = url.pathname.split('/').filter(Boolean)[0] || null
        const customer = url.hostname.replace(/\.cloudflarestream\.com$/i, '')
        const embedUrl = uid
          ? `https://${customer}.cloudflarestream.com/${uid}/iframe`
          : href
        return {
          source: ChallengeVideoSource.UPLOAD,
          videoUrl: href,
          embedUrl,
          thumbnailUrl: uid
            ? `https://${customer}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`
            : null,
          externalId: uid,
        }
      }

      return {
        source: ChallengeVideoSource.EXTERNAL,
        videoUrl: href,
        embedUrl: href,
        thumbnailUrl: null,
        externalId: null,
      }
    }
  } catch {
    return null
  }

  return null
}

export function buildUploadVideoRecord(videoUrl: string, fileId?: string | null): ParsedVideoUrl {
  return {
    source: ChallengeVideoSource.UPLOAD,
    videoUrl,
    embedUrl: videoUrl,
    thumbnailUrl: null,
    externalId: fileId ?? null,
  }
}
