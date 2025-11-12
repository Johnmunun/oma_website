"use client"

import { Mic, Briefcase, Megaphone, Smartphone, GraduationCap } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"

const domains = [
  {
    icon: Mic,
    title: "Art oratoire & Maîtrise de cérémonie",
    description: "Développez votre éloquence et votre présence scénique pour captiver votre audience.",
  },
  {
    icon: Briefcase,
    title: "Management & Leadership",
    description: "Apprenez à diriger avec confiance et à inspirer vos équipes vers l'excellence.",
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-up" delay={100}>
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
              Nos domaines d'expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Une approche complète pour développer vos compétences en communication et leadership
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {domains.map((domain, index) => {
            const Icon = domain.icon
            return (
              <AnimateOnScroll key={index} animation="fade-up" delay={index * 100}>
                <div
                  className="bg-card rounded-lg p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                <div className="w-16 h-16 bg-gold/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <Icon className="h-8 w-8 text-gold" />
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
