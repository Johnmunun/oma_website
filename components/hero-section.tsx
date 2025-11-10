"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, Calendar } from "lucide-react"

export function HeroSection() {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/professional-speaker-on-stage-with-dramatic-lighti.jpg"
          alt="Orateur professionnel"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <h1 className="font-serif font-bold text-5xl md:text-7xl lg:text-8xl text-primary-foreground mb-6 text-balance leading-tight">
          Dompter la parole, c'est <span className="text-gold">dompter le monde.</span>
        </h1>
        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto text-pretty">
          Réseau OMA & OMA TV — Formation, Communication et Leadership
        </p>
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
          >
            <Calendar className="mr-2 h-5 w-5" />
            Voir les événements
          </Button>
        </div>
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
