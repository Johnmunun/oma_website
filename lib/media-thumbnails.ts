/**
 * @file lib/media-thumbnails.ts
 * @description Détection de plateforme + génération de miniatures (YouTube, TikTok, Instagram…)
 */

export type DetectedMediaMeta = {
  platform: string | null
  thumbnailUrl: string | null
  title?: string | null
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

/** TikTok oEmbed renvoie souvent 400 avec un UA Chrome ; les bots passent. */
const TIKTOK_BOT_UAS = [
  "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "TelegramBot (like TwitterBot)",
  "Mozilla/5.0 (compatible; Twitterbot/1.0)",
]

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

/** Normalise une URL TikTok (photo→video, trim, https) */
export function normalizeTikTokUrl(raw: string): string {
  let url = raw.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  try {
    const u = new URL(url)
    // /@user/photo/ID → /@user/video/ID (oEmbed plus fiable)
    u.pathname = u.pathname.replace(/\/photo\//, "/video/")
    // retirer query tracking inutiles sauf vraiment nécessaires
    return u.toString()
  } catch {
    return url
  }
}

/** Suit les redirections des liens courts vm.tiktok.com / vt.tiktok.com */
async function resolveTikTokCanonicalUrl(url: string): Promise<string> {
  const normalized = normalizeTikTokUrl(url)
  const isShort =
    /vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t\//i.test(normalized)

  if (!isShort && /tiktok\.com\/@[^/]+\/video\/\d+/i.test(normalized)) {
    return normalized
  }

  try {
    const res = await fetch(normalized, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": TIKTOK_BOT_UAS[0],
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    })
    // URL finale après redirects
    if (res.url && res.url.includes("tiktok.com")) {
      return normalizeTikTokUrl(res.url.split("?")[0])
    }
  } catch (err) {
    console.warn("[Media] Résolution short-link TikTok échouée:", err)
  }
  return normalized
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1].replace(/&amp;/g, "&")
  }
  return null
}

function extractOgTitle(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

async function fetchTikTokOEmbed(url: string): Promise<DetectedMediaMeta> {
  const attempts: string[] = []
  const normalized = normalizeTikTokUrl(url)
  attempts.push(normalized)
  try {
    const bare = new URL(normalized)
    bare.search = ""
    if (bare.toString() !== normalized) attempts.push(bare.toString())
  } catch {
    /* ignore */
  }
  if (url.trim() !== normalized) attempts.unshift(url.trim())

  // Un seul UA bot suffit en pratique ; fallback rapide si besoin
  const uas = TIKTOK_BOT_UAS.slice(0, 2)

  for (const attemptUrl of [...new Set(attempts)]) {
    for (const ua of uas) {
      try {
        const res = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(attemptUrl)}`,
          {
            headers: {
              "User-Agent": ua,
              Accept: "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          }
        )
        if (!res.ok) {
          console.warn("[Media] TikTok oEmbed status", res.status, attemptUrl)
          continue
        }
        const data = await res.json()
        if (data?.thumbnail_url) {
          return {
            platform: "tiktok",
            thumbnailUrl: data.thumbnail_url,
            title: data.title || null,
          }
        }
      } catch (err) {
        console.warn("[Media] TikTok oEmbed erreur:", err)
      }
    }
  }
  return { platform: "tiktok", thumbnailUrl: null }
}

/** Fallback : scrape og:image de la page TikTok (UA bot obligatoire) */
async function fetchTikTokOgImage(url: string): Promise<DetectedMediaMeta> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": TIKTOK_BOT_UAS[0],
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    })
    if (!res.ok) return { platform: "tiktok", thumbnailUrl: null }
    const html = await res.text()
    const thumbnailUrl = extractOgImage(html)
    if (!thumbnailUrl) return { platform: "tiktok", thumbnailUrl: null }
    return {
      platform: "tiktok",
      thumbnailUrl,
      title: extractOgTitle(html),
    }
  } catch (err) {
    console.warn("[Media] TikTok OG scrape échoué:", err)
    return { platform: "tiktok", thumbnailUrl: null }
  }
}

async function fetchNoembed(url: string, platform: string | null): Promise<DetectedMediaMeta> {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
      {
        headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!res.ok) return { platform, thumbnailUrl: null }
    const data = await res.json()
    return {
      platform,
      thumbnailUrl: data.thumbnail_url || null,
      title: data.title || null,
    }
  } catch (err) {
    console.warn("[Media] noembed échoué:", err)
    return { platform, thumbnailUrl: null }
  }
}

async function fetchMicrolinkImage(url: string, platform: string | null): Promise<DetectedMediaMeta> {
  try {
    const res = await fetch(
      `https://api.microlink.io?url=${encodeURIComponent(url)}&palette=false&audio=false&video=false&iframe=false`,
      {
        headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
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

/** Miniature synchrone (YouTube / Instagram media URL) — sans fetch réseau */
export function getSyncThumbnail(url: string): string | null {
  const platform = detectPlatformFromUrl(url)
  if (platform === "youtube") {
    const id = extractYouTubeId(url)
    return id ? getYouTubeThumbnail(id) : null
  }
  if (platform === "instagram") {
    const code = extractInstagramShortcode(url)
    return code ? `https://www.instagram.com/p/${code}/media/?size=l` : null
  }
  return null
}

async function resolveTikTokMeta(url: string): Promise<DetectedMediaMeta> {
  const canonical = await resolveTikTokCanonicalUrl(url)
  console.log("[Media] TikTok canonical:", canonical)

  // Profil seul (@user) : oEmbed n'a pas de miniature
  if (/tiktok\.com\/@[^/]+\/?$/i.test(canonical.replace(/\?.*$/, ""))) {
    return { platform: "tiktok", thumbnailUrl: null, title: null }
  }

  const oembed = await fetchTikTokOEmbed(canonical)
  if (oembed.thumbnailUrl) return oembed

  const og = await fetchTikTokOgImage(canonical)
  if (og.thumbnailUrl) return og

  const noembed = await fetchNoembed(canonical, "tiktok")
  if (noembed.thumbnailUrl) return noembed

  const micro = await fetchMicrolinkImage(canonical, "tiktok")
  if (micro.thumbnailUrl) return micro

  return { platform: "tiktok", thumbnailUrl: null, title: oembed.title || og.title || null }
}

/**
 * Résout plateforme + miniature pour une URL média.
 */
export async function resolveMediaMeta(url: string): Promise<DetectedMediaMeta> {
  if (!url?.trim()) return { platform: null, thumbnailUrl: null }

  const platform = detectPlatformFromUrl(url)
  const syncThumb = getSyncThumbnail(url)

  if (platform === "youtube") {
    return { platform, thumbnailUrl: syncThumb }
  }

  if (platform === "tiktok") {
    return resolveTikTokMeta(url)
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
