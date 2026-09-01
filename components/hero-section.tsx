"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Calendar, Play, ArrowRight } from "lucide-react"
import { EntranceAnimation } from "@/components/animations/entrance-animation"
import { HeroVectorLeft, HeroVectorRight } from "@/components/illustrations/landing-vectors"

const HERO_STATS = [
  { value: "2019", label: "Année de création" },
  { value: "1000+", label: "Talents accompagnés" },
  { value: "6", label: "Pays" },
]

interface UpcomingEvent {
  id: string
  title: string
  slug: string
  startsAt: string | null
}

export function HeroSection() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nextEvent, setNextEvent] = useState<UpcomingEvent | null>(null)

  const defaultImage = "/professional-speaker-on-stage-with-dramatic-lighti.jpg"

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.heroImageUrl) {
            setHeroImageUrl(data.data.heroImageUrl)
          }
        }
      } catch (err) {
        console.error("[HeroSection] Erreur chargement image hero:", err)
      } finally {
        setIsLoading(false)
      }
    }

    const loadNextEvent = async () => {
      try {
        const res = await fetch("/api/events?upcoming=true&limit=1")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.length > 0) {
            setNextEvent(data.data[0])
          }
        }
      } catch (err) {
        console.error("[HeroSection] Erreur chargement événement:", err)
      }
    }

    loadHeroImage()
    loadNextEvent()

    const handleSettingsUpdate = () => loadHeroImage()
    window.addEventListener("settings-updated", handleSettingsUpdate)
    return () => window.removeEventListener("settings-updated", handleSettingsUpdate)
  }, [])

  const imageSrc = heroImageUrl || defaultImage

  const formatEventDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <section id="accueil" className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-primary max-w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 max-w-full">
        {!isLoading && (
          <Image
            src={imageSrc}
            alt="Orateur professionnel"
            fill
            priority
            className="object-cover opacity-45 md:opacity-35 hero-ken-burns"
            sizes="100vw"
            quality={90}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/75 to-primary/90 md:from-primary/90 md:via-primary/80 md:to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Illustrations vectorielles décoratives */}
      <HeroVectorLeft className="absolute left-0 top-1/4 w-24 sm:w-32 md:w-40 lg:w-48 opacity-60 md:opacity-80 hidden sm:block z-[1]" />
      <HeroVectorRight className="absolute right-0 bottom-1/4 w-24 sm:w-32 md:w-40 lg:w-48 opacity-60 md:opacity-80 hidden sm:block z-[1]" />

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center max-w-full overflow-x-hidden pt-24 pb-36 md:pt-28 md:pb-40 flex-1 flex flex-col justify-center">
        <EntranceAnimation animation="fade-down" delay={100}>
          <p className="font-serif text-gold tracking-[0.35em] uppercase text-sm md:text-base mb-6 md:mb-8">
            Réseau OMA
          </p>
        </EntranceAnimation>
        <EntranceAnimation animation="fade-down" delay={250}>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-primary-foreground mb-6 text-balance leading-[1.1]">
            Dompter la parole, c&apos;est{" "}
            <span className="text-gold italic">dompter le monde.</span>
          </h1>
        </EntranceAnimation>
        <EntranceAnimation animation="fade-up" delay={450}>
          <p className="text-lg md:text-xl lg:text-2xl text-primary-foreground/85 mb-8 md:mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">
            Formation, communication et leadership — avec OMA TV
          </p>
        </EntranceAnimation>
        <EntranceAnimation animation="scale" delay={650}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-lg sm:max-w-none mx-auto">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-primary font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 group button-gold-glow w-full sm:w-auto"
              asChild
            >
              <Link href="#oma-tv">
                <Play className="mr-2 h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                Découvrir OMA TV
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold/80 text-gold hover:bg-gold hover:text-primary font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-transparent backdrop-blur-[2px] group w-full sm:w-auto"
              asChild
            >
              <Link href="#evenements">
                <Calendar className="mr-2 h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                Voir les événements
              </Link>
            </Button>
          </div>
        </EntranceAnimation>

        {/* Stats strip */}
        <EntranceAnimation animation="fade-up" delay={800}>
          <div className="mt-10 md:mt-14 grid grid-cols-3 gap-2 sm:gap-4 max-w-xl sm:max-w-2xl mx-auto">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gold/20 bg-primary/40 backdrop-blur-sm px-2 py-3 sm:px-4 sm:py-4"
              >
                <div className="font-serif font-bold text-xl sm:text-2xl md:text-3xl text-gold leading-none mb-1">
                  {stat.value}
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm text-primary-foreground/75 leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </EntranceAnimation>
      </div>

      {/* Compact events ticker */}
      {nextEvent && (
        <div className="relative z-10 border-t border-gold/20 bg-primary/60 backdrop-blur-sm">
          <Link
            href={`/events/${nextEvent.slug}`}
            className="container mx-auto px-4 py-3 flex items-center justify-center gap-2 sm:gap-3 text-primary-foreground/90 hover:text-gold transition-colors group max-w-full"
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gold font-semibold shrink-0">
              Prochain
            </span>
            <span className="text-xs sm:text-sm font-medium truncate max-w-[50vw] sm:max-w-md">
              {nextEvent.title}
            </span>
            {nextEvent.startsAt && (
              <span className="hidden sm:inline text-xs text-primary-foreground/60 shrink-0">
                · {formatEventDate(nextEvent.startsAt)}
              </span>
            )}
            <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gold/70">Défiler</span>
        <div className="w-6 h-10 border-2 border-gold/70 rounded-full flex items-start justify-center p-2 animate-bounce">
          <div className="w-1 h-2.5 bg-gold rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
