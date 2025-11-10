"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "John Munung",
    role: "Directrice Marketing",
    content:
      "Le Réseau OMA a transformé ma façon de communiquer. Je suis maintenant capable de captiver mon audience et de transmettre mes idées avec impact.",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
  },
  {
    name: "Jean-Pierre",
    role: "Entrepreneur",
    content:
      "Grâce aux formations OMA, j'ai développé mes compétences en leadership et j'ai pu faire passer mon entreprise au niveau supérieur.",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
  },
  {
    name: "Sophie Kasongo",
    role: "Coach Professionnelle",
    content:
      "L'accompagnement personnalisé et la qualité des formations sont exceptionnels. Je recommande vivement le Réseau OMA à tous les professionnels.",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
              {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                <Star key={i} className="h-6 w-6 text-gold fill-gold" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-center text-foreground mb-8 leading-relaxed text-pretty font-serif italic">
              "{testimonials[currentIndex].content}"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <img
                src={testimonials[currentIndex].image || "/placeholder.svg"}
                alt={testimonials[currentIndex].name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gold"
              />
              <div>
                <div className="font-semibold text-foreground">{testimonials[currentIndex].name}</div>
                <div className="text-muted-foreground text-sm">{testimonials[currentIndex].role}</div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? "bg-gold w-8" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
