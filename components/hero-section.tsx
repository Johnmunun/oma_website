"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Calendar } from "lucide-react"
import { EntranceAnimation } from "@/components/animations/entrance-animation"

export function HeroSection() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Image par défaut
  const defaultImage = "/professional-speaker-on-stage-with-dramatic-lighti.jpg"
  
  // Charger l'image hero depuis les settings
  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.heroImageUrl) {
            setHeroImageUrl(data.data.heroImageUrl)
          }
        }
      } catch (err) {
        console.error('[HeroSection] Erreur chargement image hero:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadHeroImage()
    
    // Écouter les mises à jour des settings
    const handleSettingsUpdate = () => {
      loadHeroImage()
    }
    
    window.addEventListener('settings-updated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])
  
  // Utiliser l'image dynamique si disponible, sinon l'image par défaut
  const imageSrc = heroImageUrl || defaultImage
  
  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary max-w-full">
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
        {/* Overlay renforcé pour meilleur contraste du texte (WCAG AA) */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/75 to-primary/90 md:from-primary/90 md:via-primary/80 md:to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_100%)]" />
        {/* Lignes décoratives discrètes */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center max-w-full overflow-x-hidden pt-20 pb-28">
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
          <p className="text-lg md:text-xl lg:text-2xl text-primary-foreground/85 mb-10 md:mb-12 max-w-2xl mx-auto text-pretty leading-relaxed">
            Formation, communication et leadership — avec OMA TV
          </p>
        </EntranceAnimation>
        <EntranceAnimation animation="scale" delay={650}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative inline-flex">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-primary font-semibold text-lg px-8 py-6 group button-gold-glow"
                disabled
                aria-disabled="true"
              >
                <GraduationCap className="mr-2 h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:translate-y-[-2px]" />
                Découvrir nos formations
              </Button>

              {/* Badge "À venir" */}
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg tracking-wide">
                À venir
              </span>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold/80 text-gold hover:bg-gold hover:text-primary font-semibold text-lg px-8 py-6 bg-transparent backdrop-blur-[2px] group"
              asChild
            >
              <Link href="#evenements">
                <Calendar className="mr-2 h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:translate-x-1" />
                Voir les événements
              </Link>
            </Button>
          </div>
        </EntranceAnimation>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gold/70">Scroll</span>
        <div className="w-6 h-10 border-2 border-gold/70 rounded-full flex items-start justify-center p-2 animate-bounce">
          <div className="w-1 h-2.5 bg-gold rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
