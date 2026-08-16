/**
 * @file lib/media-thumbnails.ts
 * @description Détection de plateforme + génération de miniatures (YouTube, TikTok, Instagram…)
 */

export type DetectedMediaMeta = {
  platform: string | null
  thumbnailUrl: string | null
  title?: string | null
}

export function detectPlatformFromUrl(url: string): string | null {
  if (!url) return null
  const u = url.toLowerCase()
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube"
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook"
  if (u.includes("instagram.com")) return "instagram"
  if (u.includes("tiktok.com") || u.includes("vm.tiktok.com")) return "tiktok"
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter"
  if (u.includes("linkedin.com")) return "linkedin"
  return null
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const cleanUrl = url.trim()
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?|&|$)/,
  ]
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern)
    if (match?.[1]?.length === 11) return match[1]
  }
  return null
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
  return match?.[1] || null
}

/** Miniature synchrone (YouTube / Instagram media URL) — sans fetch réseau */
export function getSyncThumbnail(url: string): string | null {
  const platform = detectPlatformFromUrl(url)
  if (platform === "youtube") {
    const id = extractYouTubeId(url)
    return id ? getYouTubeThumbnail(id) : null
  }
  if (platform === "instagram") {
    const code = extractInstagramShortcode(url)
    // Endpoint public Instagram (fonctionne pour beaucoup de posts publics)
    return code ? `https://www.instagram.com/p/${code}/media/?size=l` : null
  }
  return null
}

async function fetchTikTokOEmbed(url: string): Promise<DetectedMediaMeta> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { platform: "tiktok", thumbnailUrl: null }
    const data = await res.json()
    return {
      platform: "tiktok",
      thumbnailUrl: data.thumbnail_url || null,
      title: data.title || null,
    }
  } catch (err) {
    console.warn("[Media] TikTok oEmbed échoué:", err)
    return { platform: "tiktok", thumbnailUrl: null }
  }
}

async function fetchMicrolinkImage(url: string, platform: string | null): Promise<DetectedMediaMeta> {
  try {
    const res = await fetch(
      `https://api.microlink.io?url=${encodeURIComponent(url)}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { platform, thumbnailUrl: null }
    const json = await res.json()
    const image =
      json?.data?.image?.url ||
      json?.data?.logo?.url ||
      null
    return {
      platform,
      thumbnailUrl: typeof image === "string" ? image : null,
      title: json?.data?.title || null,
    }
  } catch (err) {
    console.warn("[Media] Microlink échoué:", err)
    return { platform, thumbnailUrl: null }
  }
}

/**
 * Résout plateforme + miniature pour une URL média.
 * YouTube / Instagram : synchrone d'abord, puis enrichissement réseau si besoin.
 */
export async function resolveMediaMeta(url: string): Promise<DetectedMediaMeta> {
  if (!url?.trim()) return { platform: null, thumbnailUrl: null }

  const platform = detectPlatformFromUrl(url)
  const syncThumb = getSyncThumbnail(url)

  if (platform === "youtube") {
    return { platform, thumbnailUrl: syncThumb }
  }

  if (platform === "tiktok") {
    const oembed = await fetchTikTokOEmbed(url)
    if (oembed.thumbnailUrl) return oembed
    return fetchMicrolinkImage(url, "tiktok")
  }

  if (platform === "instagram") {
    if (syncThumb) return { platform, thumbnailUrl: syncThumb }
    return fetchMicrolinkImage(url, "instagram")
  }

  if (platform === "facebook") {
    return fetchMicrolinkImage(url, "facebook")
  }

  return { platform, thumbnailUrl: syncThumb }
}
