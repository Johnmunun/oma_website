"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Play, Youtube, Facebook, Instagram, Linkedin, Loader2 } from "lucide-react"
import Link from "next/link"
import { EmblaCarousel } from "@/components/ui/embla-carousel"

interface Media {
  id: string
  url: string
  type: "IMAGE" | "VIDEO" | "FILE"
  title: string | null
  description: string | null
  platform: string | null
  thumbnailUrl: string | null
  alt: string | null
  createdAt: string
}

// Fonction pour extraire l'ID d'une vidéo YouTube
function extractYouTubeId(url: string): string | null {
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
    if (match && match[1] && match[1].length === 11) {
      return match[1]
    }
  }
  
  return null
}

// Fonction pour générer une miniature YouTube
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

// Fonction pour obtenir la miniature d'une vidéo (avec fallback automatique pour YouTube)
function getVideoThumbnail(video: Media): string {
  // Si une miniature existe déjà, l'utiliser
  if (video.thumbnailUrl) {
    return video.thumbnailUrl
  }
  
  // Si c'est une vidéo YouTube sans miniature, générer automatiquement
  if (video.platform === 'youtube' || video.url.includes('youtube.com') || video.url.includes('youtu.be')) {
    const videoId = extractYouTubeId(video.url)
    if (videoId) {
      return getYouTubeThumbnail(videoId)
    }
  }
  
  // Fallback par défaut
  return "/placeholder.svg"
}

export function OmaTvSection() {
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [featuredMedia, setFeaturedMedia] = useState<Media | null>(null)

  // Mémoriser les miniatures générées pour éviter les recalculs
  const mediaWithThumbnails = useMemo(() => {
    return media.map(video => ({
      ...video,
      thumbnailUrl: getVideoThumbnail(video),
    }))
  }, [media])

  const featuredMediaWithThumbnail = useMemo(() => {
    if (!featuredMedia) return null
    return {
      ...featuredMedia,
      thumbnailUrl: getVideoThumbnail(featuredMedia),
    }
  }, [featuredMedia])

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/media?type=VIDEO&limit=10", {
          cache: "no-store",
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data && data.data.length > 0) {
            const videos = data.data
            setMedia(videos.slice(1))
            setFeaturedMedia(videos[0])
          }
        }
      } catch (error) {
        console.error("[OmaTvSection] Erreur chargement médias:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMedia()
  }, [])

  // Vue desktop (grille)
  const desktopView = mediaWithThumbnails.length > 0 ? (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
      {mediaWithThumbnails.map((video) => (
        <Link
          key={video.id}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
        >
          <div className="relative aspect-video">
            <img
              src={getVideoThumbnail(video)}
              alt={video.title || video.alt || "Vidéo OMA TV"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="h-6 w-6 text-primary ml-0.5" fill="currentColor" />
              </div>
            </div>
            {video.platform && (
              <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                {video.platform === "youtube" && <Youtube className="w-3 h-3" />}
                {video.platform === "facebook" && <Facebook className="w-3 h-3" />}
                {video.platform === "instagram" && <Instagram className="w-3 h-3" />}
                <span className="capitalize">{video.platform}</span>
              </div>
            )}
          </div>
          <div className="bg-white p-4">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {video.title || "Vidéo OMA TV"}
            </h3>
            {video.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {video.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  ) : null

  // Slides pour le carousel mobile
  const slides = mediaWithThumbnails.map((video) => (
    <Link
      key={video.id}
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 block mx-2"
    >
      <div className="relative aspect-video">
        <img
          src={getVideoThumbnail(video)}
          alt={video.title || video.alt || "Vidéo OMA TV"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-primary ml-0.5" fill="currentColor" />
          </div>
        </div>
        {video.platform && (
          <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            {video.platform === "youtube" && <Youtube className="w-3 h-3" />}
            {video.platform === "facebook" && <Facebook className="w-3 h-3" />}
            {video.platform === "instagram" && <Instagram className="w-3 h-3" />}
            <span className="capitalize">{video.platform}</span>
          </div>
        )}
      </div>
      <div className="bg-white p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">
          {video.title || "Vidéo OMA TV"}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </Link>
  ))

  return (
    <section id="oma-tv" className="py-24 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-6 text-balance">OMA TV</h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
            Découvrez nos émissions et vidéos inspirantes pour développer vos compétences en communication et leadership
          </p>
        </div>

        {/* Featured Video */}
        {isLoading ? (
          <div className="max-w-5xl mx-auto mb-12 flex items-center justify-center aspect-video">
            <Loader2 className="w-12 h-12 animate-spin text-gold" />
          </div>
        ) : featuredMediaWithThumbnail ? (
          <div className="max-w-5xl mx-auto mb-12">
            <Link
              href={featuredMediaWithThumbnail.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-video rounded-lg overflow-hidden shadow-2xl group block"
            >
              <img
                src={featuredMediaWithThumbnail.thumbnailUrl || "/placeholder.svg?height=720&width=1280"}
                alt={featuredMediaWithThumbnail.title || featuredMediaWithThumbnail.alt || "OMA TV Featured"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <Play className="h-10 w-10 text-primary ml-1" fill="currentColor" />
                </div>
              </div>
              {featuredMediaWithThumbnail.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-6">
                  <h3 className="font-serif font-bold text-2xl text-primary-foreground">
                    {featuredMediaWithThumbnail.title}
                  </h3>
                  {featuredMediaWithThumbnail.description && (
                    <p className="text-primary-foreground/90 mt-2 line-clamp-2">
                      {featuredMediaWithThumbnail.description}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </div>
        ) : null}

        {/* Video Grid (Desktop) / Carousel (Mobile) */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : media.length > 0 ? (
          <EmblaCarousel
            breakpoint="md"
            desktopView={desktopView}
            slideClassName="w-[85%] sm:w-[70%]"
            options={{
              align: "start",
              containScroll: "trimSnaps",
            }}
          >
            {slides}
          </EmblaCarousel>
        ) : !featuredMedia && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-primary-foreground/70">
              Aucune vidéo disponible pour le moment
            </p>
          </div>
        ) : null}

        {/* Social Links */}
        <div className="text-center mt-12">
          <p className="text-lg mb-6">Suivez-nous sur nos réseaux sociaux</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-primary bg-transparent text-sm sm:text-base"
            >
              <Youtube className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">YouTube</span>
              <span className="sm:hidden">YT</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-primary bg-transparent text-sm sm:text-base"
            >
              <Facebook className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Facebook</span>
              <span className="sm:hidden">FB</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-primary bg-transparent text-sm sm:text-base"
            >
              <Instagram className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Instagram</span>
              <span className="sm:hidden">IG</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-primary bg-transparent text-sm sm:text-base"
            >
              <Linkedin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">LinkedIn</span>
              <span className="sm:hidden">LI</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
