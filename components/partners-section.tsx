/**
 * @file components/partners-section.tsx
 * @description Section publique pour afficher les partenaires
 * Carousel sur mobile, grille sur desktop
 */

"use client"

import { useEffect, useState } from "react"
import { Handshake } from "lucide-react"
import { EmblaCarousel } from "@/components/ui/embla-carousel"

interface Partner {
  id: string
  name: string
  logoUrl: string | null
  url: string | null
  order: number
}

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/partners', {
          cache: 'no-store',
        })
        
        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.error || `Erreur ${res.status}: Failed to load partners`)
        }
        
        if (data.success && data.data) {
          setPartners(data.data)
        } else {
          throw new Error(data.error || 'Erreur inconnue lors du chargement')
        }
      } catch (err: any) {
        console.error('[Partners] Erreur chargement partenaires:', err)
        setPartners([])
      } finally {
        setIsLoading(false)
      }
    }
    loadPartners()
  }, [])

  if (isLoading) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Chargement des partenaires...</p>
          </div>
        </div>
      </section>
    )
  }

  if (partners.length === 0) {
    return null
  }

  // Vue desktop (grille)
  const desktopView = (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {partners.map((partner) => (
        <div
          key={partner.id}
          className="p-6 hover:shadow-lg transition-all duration-300  hover:scale-105 rounded-lg"
        >
          {partner.url ? (
            <a
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {partner.logoUrl ? (
                <div className="w-full h-24 flex items-center justify-center mb-4">
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-24 flex items-center justify-center mb-4 bg-muted rounded-lg">
                  <Handshake className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
              )}
              <p className="text-sm font-medium text-center text-muted-foreground">
                {partner.name}
              </p>
            </a>
          ) : (
            <div>
              {partner.logoUrl ? (
                <div className="w-full h-24 flex items-center justify-center mb-4">
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-24 flex items-center justify-center mb-4 bg-muted rounded-lg">
                  <Handshake className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
              )}
              <p className="text-sm font-medium text-center text-muted-foreground">
                {partner.name}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  // Slides pour le carousel mobile
  const slides = partners.map((partner) => (
    <div
      key={partner.id}
      className="p-6 hover:shadow-lg transition-all duration-300 bg-white border-0 shadow-soft rounded-lg mx-2"
    >
      {partner.url ? (
        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {partner.logoUrl ? (
            <div className="w-full h-24 flex items-center justify-center mb-4">
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-24 flex items-center justify-center mb-4 bg-muted rounded-lg">
              <Handshake className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
          )}
          <p className="text-sm font-medium text-center text-muted-foreground">
            {partner.name}
          </p>
        </a>
      ) : (
        <div>
          {partner.logoUrl ? (
            <div className="w-full h-24 flex items-center justify-center mb-4">
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-24 flex items-center justify-center mb-4 bg-muted rounded-lg">
              <Handshake className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
          )}
          <p className="text-sm font-medium text-center text-muted-foreground">
            {partner.name}
          </p>
        </div>
      )}
    </div>
  ))

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-6">
            <Handshake className="h-4 w-4" />
            <span className="text-sm font-semibold">Nos Partenaires</span>
          </div>
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
            Des partenaires de confiance
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            Nous collaborons avec des organisations et entreprises qui partagent nos valeurs
            et notre vision pour l'excellence en communication et leadership.
          </p>
        </div>

        {/* Carousel mobile / Grille desktop */}
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
      </div>
    </section>
  )
}
