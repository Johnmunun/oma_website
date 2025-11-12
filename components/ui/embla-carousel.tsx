/**
 * @file components/ui/embla-carousel.tsx
 * @description Composant Embla Carousel réutilisable avec accessibilité et SSR-safe
 * Compatible Next.js App Router, TypeScript, Tailwind CSS
 * Usage: Carousel sur mobile, grille/liste sur desktop
 */

"use client"

import { useEffect, useState, useCallback, ReactNode } from "react"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmblaCarouselProps {
  children: ReactNode[]
  options?: EmblaOptionsType
  className?: string
  slideClassName?: string
  showDots?: boolean
  showArrows?: boolean
  breakpoint?: "sm" | "md" | "lg" // Breakpoint pour passer en grille sur desktop
  desktopView?: ReactNode // Contenu à afficher sur desktop (grille/liste)
}

export function EmblaCarousel({
  children,
  options = {},
  className,
  slideClassName,
  showDots = true,
  showArrows = true,
  breakpoint = "md",
  desktopView,
}: EmblaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: false,
      skipSnaps: false,
      dragFree: false,
      ...options,
    },
    []
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(true)

  // Détecter si on est sur mobile ou desktop
  useEffect(() => {
    setIsMounted(true)
    
    const checkMobile = () => {
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
      }
      setIsMobile(window.innerWidth < breakpoints[breakpoint])
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [breakpoint])

  // Initialiser les scroll snaps
  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  // Mettre à jour l'index sélectionné
  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect)
  }, [emblaApi, onInit, onSelect])

  // Navigation
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  // Éviter l'erreur d'hydratation
  if (!isMounted) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex gap-4 overflow-hidden">
          {children.map((child, index) => (
            <div key={index} className={cn("min-w-0 flex-shrink-0", slideClassName)}>
              {child}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Sur desktop, afficher la vue grille/liste si fournie
  if (!isMobile && desktopView) {
    return <div className={cn("w-full", className)}>{desktopView}</div>
  }

  // Sur mobile ou si pas de desktopView, afficher le carousel
  return (
    <div className={cn("relative w-full", className)}>
      {/* Container du carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y" role="region" aria-label="Carousel">
          {children.map((child, index) => (
            <div
              key={index}
              className={cn("min-w-0 flex-shrink-0", slideClassName)}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} sur ${children.length}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      {showArrows && children.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0",
              selectedIndex === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={scrollPrev}
            disabled={selectedIndex === 0}
            aria-label="Slide précédent"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Slide précédent</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0",
              selectedIndex === scrollSnaps.length - 1 && "opacity-50 cursor-not-allowed"
            )}
            onClick={scrollNext}
            disabled={selectedIndex === scrollSnaps.length - 1}
            aria-label="Slide suivant"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Slide suivant</span>
          </Button>
        </>
      )}

      {/* Dots de pagination */}
      {showDots && children.length > 1 && (
        <div
          className="flex justify-center gap-2 mt-4"
          role="tablist"
          aria-label="Pagination du carousel"
        >
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === selectedIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Aller au slide ${index + 1}`}
              aria-selected={index === selectedIndex}
              role="tab"
            />
          ))}
        </div>
      )}
    </div>
  )
}







