"use client"

import { Mic, Calendar, Megaphone, Smartphone, GraduationCap } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"
import { cn } from "@/lib/utils"

const domains = [
  {
    icon: Mic,
    title: "Art oratoire & Maîtrise de cérémonie",
    description: "Développez votre éloquence et votre présence scénique pour captiver votre audience.",
    bentoClass: "md:col-span-2 lg:col-span-4",
  },
  {
    icon: Calendar,
    title: "Événementiel",
    description: "Organisez et animez des événements mémorables avec professionnalisme et charisme.",
    bentoClass: "md:col-span-1 lg:col-span-2",
  },
  {
    icon: Megaphone,
    title: "Communication & Médias",
    description: "Maîtrisez les techniques de communication moderne et la gestion médiatique.",
    bentoClass: "lg:col-span-2",
  },
  {
    icon: Smartphone,
    title: "Marketing digital & Publicité",
    description: "Exploitez le pouvoir du digital pour développer votre marque et votre influence.",
    bentoClass: "lg:col-span-2",
  },
  {
    icon: GraduationCap,
    title: "Formation & Consultation",
    description: "Bénéficiez d'un accompagnement personnalisé pour atteindre vos objectifs.",
    bentoClass: "lg:col-span-2",
  },
]

function DomainCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: typeof Mic
  title: string
  description: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative h-full bg-card rounded-xl p-6 sm:p-8 shadow-soft border border-border/80 hover:border-gold/35 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg group overflow-hidden card-scale-hover",
        className
      )}
    >
      <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-gold/0 group-hover:bg-gold transition-colors duration-300 rounded-full" />
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gold/10 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-gold/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-gold-text transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />
      </div>
      <h3 className="font-serif font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  )
}

export function DomainsSection() {
  return (
    <section className="py-20 md:py-24 bg-muted/25 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" aria-hidden />
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-up" delay={100}>
          <div className="text-center mb-12 md:mb-16">
            <p className="text-gold-text text-sm font-semibold tracking-[0.2em] uppercase mb-4">Expertise</p>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 sm:mb-6 text-balance">
              Nos domaines d&apos;expertise
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Une approche complète pour développer vos compétences en communication et leadership
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {domains.map((domain, index) => {
            const Icon = domain.icon
            return (
              <AnimateOnScroll
                key={domain.title}
                animation="fade-up"
                delay={index * 80}
                className={domain.bentoClass}
              >
                <DomainCard
                  icon={Icon}
                  title={domain.title}
                  description={domain.description}
                />
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
