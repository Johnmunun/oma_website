"use client"

import { Sparkles } from "lucide-react"
import { EmblaCarousel } from "@/components/ui/embla-carousel"
import { useState, useEffect } from "react"

export function AboutSection() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Stats pour le carousel
  const stats = [
    { value: "2019", label: "Année de création" },
    { value: "6", label: "Pays en Afrique, Asie et Europe" },
    { value: "1000+", label: "Talents accompagnés" },
  ]

  // Leaders pour le carousel
  const leaders = [
    {
      image: "/images/leader-albin-speaking.jpg",
      name: "Coach Bin Adan",
      role: "Fondateur & Directeur Réseau OMA",
      description: "Expert en art oratoire et communication, passionné par le développement du leadership et l'accompagnement des talents.",
    },
    {
      image: "/images/coach-bin-professional.jpg",
      name: "Leader bin",
      role: "Directeur OMA TV",
      description: "Spécialiste en médias et communication digitale, il dirige la production de contenus inspirants pour OMA TV.",
    },
  ]

  // Vue desktop (grille)
  const statsDesktopView = (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-5xl font-bold text-gold mb-2">{stat.value}</div>
          <p className="text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )

  const leadersDesktopView = (
    <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
      {leaders.map((leader, index) => (
        <div key={index} className="bg-card rounded-lg p-8 shadow-lg border border-border">
          <img
            src={leader.image}
            alt={leader.name}
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gold"
            loading="lazy"
          />
          <h3 className="font-serif font-bold text-2xl text-center mb-2">{leader.name}</h3>
          <p className="text-gold text-center mb-4">{leader.role}</p>
          <p className="text-muted-foreground text-center leading-relaxed">{leader.description}</p>
        </div>
      ))}
    </div>
  )

  // Slides pour le carousel mobile
  const statsSlides = stats.map((stat, index) => (
    <div key={index} className="text-center px-4">
      <div className="text-4xl sm:text-5xl font-bold text-gold mb-2">{stat.value}</div>
      <p className="text-muted-foreground text-sm sm:text-base">{stat.label}</p>
    </div>
  ))

  const leadersSlides = leaders.map((leader, index) => (
    <div key={index} className="bg-card rounded-lg p-6 sm:p-8 shadow-lg border border-border mx-2">
      <img
        src={leader.image}
        alt={leader.name}
        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gold"
        loading="lazy"
      />
      <h3 className="font-serif font-bold text-xl sm:text-2xl text-center mb-2">{leader.name}</h3>
      <p className="text-gold text-center mb-4 text-sm sm:text-base">{leader.role}</p>
      <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">{leader.description}</p>
    </div>
  ))

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">À propos du Réseau OMA</span>
          </div>
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
            Révéler votre potentiel, accompagner vos talents
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-pretty">
            Créé en 2019 par le Coach Bin Adan, le Réseau OMA est une plateforme internationale dédiée à l'art oratoire,
            la communication et le leadership. Notre mission : accompagner les talents et révéler leur potentiel à
            travers des formations de qualité et un accompagnement personnalisé.
          </p>
          <blockquote className="text-2xl font-serif italic text-gold border-l-4 border-gold pl-6 my-8">
            "Savoir parler, c'est savoir agir."
          </blockquote>
        </div>

        {/* Stats - Carousel mobile / Grille desktop */}
        {isMounted && (
          <EmblaCarousel
            breakpoint="md"
            desktopView={statsDesktopView}
            slideClassName="w-[80%] sm:w-[60%]"
            options={{
              align: "center",
              containScroll: "trimSnaps",
            }}
          >
            {statsSlides}
          </EmblaCarousel>
        )}

        {/* Leaders - Carousel mobile / Grille desktop */}
        {isMounted && (
          <EmblaCarousel
            breakpoint="md"
            desktopView={leadersDesktopView}
            slideClassName="w-[90%] sm:w-[80%]"
            options={{
              align: "center",
              containScroll: "trimSnaps",
            }}
          >
            {leadersSlides}
          </EmblaCarousel>
        )}
      </div>
    </section>
  )
}
