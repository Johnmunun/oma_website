"use client"

import { useEffect, useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface Testimonial {
  id: string
  name: string
  role: string | null
  content: string
  photoUrl: string | null
  rating: number
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/testimonials", {
          cache: "no-store", // Ne pas utiliser le cache pour avoir les données à jour
        })

        if (res.ok) {
          const data = await res.json()
          console.log("[TestimonialsSection] Témoignages reçus:", {
            success: data.success,
            count: data.data?.length || 0,
            testimonials: data.data,
          })
          
          if (data.success && data.data && data.data.length > 0) {
            setTestimonials(data.data)
          } else {
            console.warn("[TestimonialsSection] Aucun témoignage publié trouvé")
          }
        } else {
          const errorData = await res.json().catch(() => ({}))
          console.error("[TestimonialsSection] Erreur API:", {
            status: res.status,
            error: errorData,
          })
        }
      } catch (error) {
        console.error("[TestimonialsSection] Erreur chargement témoignages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTestimonials()
  }, [])

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [testimonials.length])

  // Si aucun témoignage, ne rien afficher
  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
              Ce que disent nos clients
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Des témoignages authentiques de personnes qui ont transformé leur communication
            </p>
          </div>
          <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null // Ne rien afficher si aucun témoignage publié
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
            Ce que disent nos clients
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Des témoignages authentiques de personnes qui ont transformé leur communication
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg p-8 md:p-12 shadow-xl border border-border">
            <div className="flex justify-center mb-6">
              {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                <Star key={i} className="h-6 w-6 text-gold fill-gold" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-center text-foreground mb-8 leading-relaxed text-pretty font-serif italic">
              "{currentTestimonial.content}"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <Avatar
                src={currentTestimonial.photoUrl}
                name={currentTestimonial.name}
                size="lg"
                className="border-2 border-gold"
              />
              <div>
                <div className="font-semibold text-foreground">{currentTestimonial.name}</div>
                {currentTestimonial.role && (
                  <div className="text-muted-foreground text-sm">{currentTestimonial.role}</div>
                )}
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? "bg-gold w-8" : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Afficher le témoignage ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
