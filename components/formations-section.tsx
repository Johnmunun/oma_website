"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Bell, ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"

export function FormationsSection() {
  return (
    <section id="formations" className="py-16 md:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" aria-hidden />
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-up" delay={100}>
          <div className="max-w-3xl mx-auto text-center rounded-2xl border border-gold/15 bg-gradient-to-br from-muted/30 to-background p-8 sm:p-10 md:p-12 shadow-soft">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 mb-6">
              <GraduationCap className="h-7 w-7 text-gold-text" />
            </div>
            <p className="text-gold-text text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3">
              Bientôt disponible
            </p>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mb-4 text-balance">
              Nos formations numériques arrivent
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto text-pretty">
              Des programmes complets en art oratoire, communication et leadership.
              Inscrivez-vous à la newsletter pour être informé du lancement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-primary font-semibold w-full sm:w-auto"
                asChild
              >
                <Link href="#newsletter">
                  <Bell className="mr-2 h-4 w-4" />
                  Recevoir les alertes
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gold/40 text-gold-text hover:bg-gold/10 w-full sm:w-auto"
                asChild
              >
                <Link href="#contact">
                  Nous contacter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
