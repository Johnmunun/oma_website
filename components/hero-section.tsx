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
            className="object-cover opacity-40 md:opacity-30"
            sizes="100vw"
            quality={85}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/75 via-primary/65 to-primary md:from-primary/80 md:via-primary/70" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center max-w-full overflow-x-hidden">
        <EntranceAnimation animation="fade-down" delay={200}>
          <h1 className="font-serif font-bold text-5xl md:text-7xl lg:text-8xl text-primary-foreground mb-6 text-balance leading-tight">
            Dompter la parole, c'est <span className="text-gold">dompter le monde.</span>
          </h1>
        </EntranceAnimation>
        <EntranceAnimation animation="fade-up" delay={400}>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto text-pretty">
            Réseau OMA & OMA TV — Formation, Communication et Leadership
          </p>
        </EntranceAnimation>
        <EntranceAnimation animation="scale" delay={600}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="relative inline-flex">
  <Button
    size="lg"
    className="bg-gold hover:bg-gold-dark text-primary font-semibold text-lg px-8 py-6 group"
  >
    <GraduationCap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
    Découvrir nos formations
  </Button>

  {/* Badge "À venir" */}
  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
    À venir
  </span>
</div>

          <Button
            size="lg"
            variant="outline"
            className="border-2 border-gold text-gold hover:bg-gold hover:text-primary font-semibold text-lg px-8 py-6 bg-transparent"
            asChild
          >
            <Link href="#evenements">
              <Calendar className="mr-2 h-5 w-5" />
              Voir les événements
            </Link>
          </Button>
          </div>
        </EntranceAnimation>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-gold rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-gold rounded-full" />
        </div>
      </div>
    </section>
  )
}
