"use client"

import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"
import { Button } from "@/components/ui/button"
import { ABOUT_STATS } from "@/lib/about-content"

export function AboutSection() {
  return (
    <section className="py-20 md:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.35] section-grain" aria-hidden />
      <div className="container mx-auto px-4 relative">
        <AnimateOnScroll animation="fade-up" delay={100}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-text px-4 py-2 rounded-full mb-6 border border-gold/15">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Réseau OMA</span>
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-6 text-balance">
              Révéler votre potentiel, accompagner vos talents
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 text-pretty max-w-2xl mx-auto">
              Depuis 2019, le Réseau OMA accompagne les talents en art oratoire, communication et leadership
              à travers l&apos;Afrique, l&apos;Asie et l&apos;Europe.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mb-10">
              {ABOUT_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gold/10 bg-muted/20 px-2 py-4 sm:px-4"
                >
                  <div className="font-serif font-bold text-xl sm:text-2xl md:text-3xl text-gold-text mb-1">
                    {stat.value}
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-primary font-semibold"
              asChild
            >
              <Link href="/about">
                En savoir plus sur nous
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
