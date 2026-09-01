"use client"

import Image from "next/image"
import Link from "next/link"
import { Sparkles, Target, Eye, Heart, ArrowRight } from "lucide-react"
import { EmblaCarousel } from "@/components/ui/embla-carousel"
import { useState, useEffect } from "react"
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"
import { Button } from "@/components/ui/button"
import { ABOUT_STATS, ABOUT_LEADERS, ABOUT_VALUES } from "@/lib/about-content"

export function AboutPageContent() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const statsDesktopView = (
    <div className="grid md:grid-cols-3 gap-6 md:gap-0 max-w-5xl mx-auto">
      {ABOUT_STATS.map((stat, index) => (
        <div
          key={stat.label}
          className={`text-center px-6 py-4 ${
            index < ABOUT_STATS.length - 1 ? "md:border-r md:border-gold/20" : ""
          }`}
        >
          <div className="text-5xl font-serif font-bold text-gold-text mb-2 tracking-tight">{stat.value}</div>
          <p className="text-muted-foreground text-sm md:text-base">{stat.label}</p>
        </div>
      ))}
    </div>
  )

  const statsSlides = ABOUT_STATS.map((stat) => (
    <div key={stat.label} className="text-center px-4">
      <div className="text-4xl sm:text-5xl font-serif font-bold text-gold-text mb-2">{stat.value}</div>
      <p className="text-muted-foreground text-sm sm:text-base">{stat.label}</p>
    </div>
  ))

  const leadersDesktopView = (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {ABOUT_LEADERS.map((leader) => (
        <div
          key={`${leader.name}-${leader.role}`}
          className="group relative bg-card/80 rounded-xl p-8 shadow-soft border border-border/80 hover:border-gold/30 transition-all duration-300 hover:shadow-soft-lg"
        >
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Image
            src={leader.image}
            alt={leader.name}
            width={128}
            height={128}
            className="w-32 h-32 rounded-full mx-auto mb-5 object-cover border-[3px] border-gold shadow-md ring-4 ring-gold/10"
            loading="lazy"
            sizes="(max-width: 768px) 96px, 128px"
            quality={85}
          />
          <h3 className="font-serif font-bold text-2xl text-center mb-2">{leader.name}</h3>
          <p className="text-gold-text text-center mb-4 text-sm font-medium tracking-wide">{leader.role}</p>
          <p className="text-muted-foreground text-center leading-relaxed">{leader.description}</p>
        </div>
      ))}
    </div>
  )

  const leadersSlides = ABOUT_LEADERS.map((leader) => (
    <div key={`${leader.name}-${leader.role}-slide`} className="bg-card rounded-xl p-6 sm:p-8 shadow-soft border border-border mx-2">
      <Image
        src={leader.image}
        alt={leader.name}
        width={128}
        height={128}
        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 object-cover border-[3px] border-gold ring-4 ring-gold/10"
        loading="lazy"
        sizes="(max-width: 640px) 96px, 128px"
        quality={85}
      />
      <h3 className="font-serif font-bold text-xl sm:text-2xl text-center mb-2">{leader.name}</h3>
      <p className="text-gold-text text-center mb-4 text-sm sm:text-base font-medium">{leader.role}</p>
      <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">{leader.description}</p>
    </div>
  ))

  const valueIcons = [Target, Eye, Heart, Sparkles]

  return (
    <>
      {/* Mission */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.35] section-grain" aria-hidden />
        <div className="container mx-auto px-4 relative">
          <AnimateOnScroll animation="fade-up" delay={100}>
            <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-text px-4 py-2 rounded-full mb-6 border border-gold/15">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Notre histoire</span>
              </div>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-6 text-balance">
                Révéler vos talents
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 text-pretty">
                Créé en 2019 par le Coach Bin Adan, le Réseau OMA est une plateforme internationale dédiée à
                l&apos;art oratoire, la communication et le leadership. Notre mission : accompagner les talents et
                révéler leur potentiel à travers des formations de qualité et un accompagnement personnalisé.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
                Présent dans six pays à travers l&apos;Afrique, l&apos;Asie et l&apos;Europe, nous formons des
                orateurs, leaders et communicants capables de transformer leurs idées en impact concret.
              </p>
              <blockquote className="relative text-xl sm:text-2xl font-serif italic text-gold-text my-8 max-w-xl mx-auto">
                <span className="absolute -left-2 -top-3 text-5xl text-gold/25 font-serif leading-none select-none" aria-hidden>
                  &ldquo;
                </span>
                Savoir parler, c&apos;est savoir agir.
              </blockquote>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={200}>
            <div className="rounded-2xl border border-gold/10 bg-muted/20 py-10 px-4 md:px-8">
              {isMounted && (
                <EmblaCarousel
                  breakpoint="md"
                  desktopView={statsDesktopView}
                  slideClassName="w-[80%] sm:w-[60%]"
                  options={{ align: "center", containScroll: "trimSnaps" }}
                >
                  {statsSlides}
                </EmblaCarousel>
              )}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-muted/25 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" aria-hidden />
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-up" delay={100}>
            <div className="text-center mb-12 md:mb-16">
              <p className="text-gold-text text-sm font-semibold tracking-[0.2em] uppercase mb-4">Nos valeurs</p>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance">
                Ce qui nous guide
              </h2>
            </div>
          </AnimateOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {ABOUT_VALUES.map((value, index) => {
              const Icon = valueIcons[index] ?? Sparkles
              return (
                <AnimateOnScroll key={value.title} animation="fade-up" delay={index * 80}>
                  <div className="h-full bg-card rounded-xl p-6 sm:p-8 border border-border/80 shadow-soft hover:border-gold/30 hover:shadow-soft-lg transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-gold-text" />
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-up" delay={100}>
            <div className="text-center mb-12 md:mb-16">
              <p className="text-gold-text text-sm font-semibold tracking-[0.2em] uppercase mb-4">Leadership</p>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance">
                L&apos;équipe dirigeante
              </h2>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={200}>
            {isMounted && (
              <EmblaCarousel
                breakpoint="md"
                desktopView={leadersDesktopView}
                slideClassName="w-[90%] sm:w-[80%]"
                options={{ align: "center", containScroll: "trimSnaps" }}
              >
                {leadersSlides}
              </EmblaCarousel>
            )}
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12),transparent_70%)]" aria-hidden />
        <div className="container mx-auto px-4 relative text-center">
          <AnimateOnScroll animation="fade-up" delay={100}>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-primary-foreground mb-4 text-balance">
              Prêt à développer votre potentiel ?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-pretty">
              Rejoignez le Réseau OMA et participez à nos événements, formations et contenus OMA TV.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-primary font-semibold w-full sm:w-auto" asChild>
                <Link href="/#evenements">
                  Voir les événements
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gold/60 text-gold hover:bg-gold/10 w-full sm:w-auto"
                asChild
              >
                <Link href="/#contact">Nous contacter</Link>
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  )
}
