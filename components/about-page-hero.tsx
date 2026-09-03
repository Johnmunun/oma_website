"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const DEFAULT_ABOUT_IMAGE = "/professional-speaker-on-stage-with-dramatic-lighti.jpg"
const FALLBACK_ABOUT_IMAGE = "/placeholder.svg"

export function AboutPageHero() {
  const [imageSrc, setImageSrc] = useState(DEFAULT_ABOUT_IMAGE)

  useEffect(() => {
    const loadImage = async () => {
      try {
        const res = await fetch("/api/site-settings")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.aboutHeroImageUrl) {
            setImageSrc(data.data.aboutHeroImageUrl)
          }
        }
      } catch (err) {
        console.error("[AboutPageHero] Erreur chargement image:", err)
      }
    }

    loadImage()

    const handleSettingsUpdate = () => loadImage()
    window.addEventListener("settings-updated", handleSettingsUpdate)
    return () => window.removeEventListener("settings-updated", handleSettingsUpdate)
  }, [])

  const handleImageError = () => {
    setImageSrc((current) =>
      current === FALLBACK_ABOUT_IMAGE ? current : FALLBACK_ABOUT_IMAGE
    )
  }

  return (
    <header className="relative bg-primary text-primary-foreground pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden min-h-[320px] md:min-h-[400px] flex items-end">
      {/* Image de fond floutée */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          className="object-cover scale-110 blur-lg opacity-45 md:opacity-40"
          sizes="100vw"
          quality={85}
          aria-hidden
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/92 via-primary/82 to-primary/96" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.2),transparent_55%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 w-full">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-6 text-primary-foreground/90 hover:text-gold hover:bg-primary-foreground/5 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Button>
        </Link>
        <p className="text-gold text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-4">About Us</p>
        <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-balance leading-tight">
          À propos du{" "}
          <span className="text-gold italic">Réseau OMA</span>
        </h1>
        <p className="text-lg sm:text-xl text-primary-foreground/85 max-w-3xl leading-relaxed text-pretty">
          Une plateforme internationale dédiée à l&apos;art oratoire, la communication et le leadership —
          pour former des voix qui transforment le monde.
        </p>
      </div>
    </header>
  )
}
