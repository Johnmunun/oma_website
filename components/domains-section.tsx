"use client"

import { Mic, Calendar, Megaphone, Smartphone, GraduationCap } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"

const domains = [
  {
    icon: Mic,
    title: "Art oratoire & Maîtrise de cérémonie",
    description: "Développez votre éloquence et votre présence scénique pour captiver votre audience.",
  },
  {
    icon: Calendar,
    title: "Événementiel",
    description: "Organisez et animez des événements mémorables avec professionnalisme et charisme.",
  },
  {
    icon: Megaphone,
    title: "Communication & Médias",
    description: "Maîtrisez les techniques de communication moderne et la gestion médiatique.",
  },
  {
    icon: Smartphone,
    title: "Marketing digital & Publicité",
    description: "Exploitez le pouvoir du digital pour développer votre marque et votre influence.",
  },
  {
    icon: GraduationCap,
    title: "Formation & Consultation",
    description: "Bénéficiez d'un accompagnement personnalisé pour atteindre vos objectifs.",
  },
]

export function DomainsSection() {
  return (
    <section className="py-24 bg-muted/25 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" aria-hidden />
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-up" delay={100}>
          <div className="text-center mb-16">
            <p className="text-gold-text text-sm font-semibold tracking-[0.2em] uppercase mb-4">Expertise</p>
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
              Nos domaines d&apos;expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Une approche complète pour développer vos compétences en communication et leadership
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {domains.map((domain, index) => {
            const Icon = domain.icon
            return (
              <AnimateOnScroll key={index} animation="fade-up" delay={index * 100}>
                <div className="relative h-full bg-card rounded-xl p-8 shadow-soft border border-border/80 hover:border-gold/35 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg group overflow-hidden card-scale-hover">
                  <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-gold/0 group-hover:bg-gold transition-colors duration-300 rounded-full" />
                  <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon className="h-7 w-7 text-gold-text transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-3 text-foreground">{domain.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{domain.description}</p>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
