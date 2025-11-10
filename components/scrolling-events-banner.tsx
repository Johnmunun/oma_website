"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"

interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  type: string | null
  location: string | null
  startsAt: string | null
  endsAt: string | null
  imageUrl: string | null
  showOnBanner?: boolean // Optionnel pour compatibilité avec l'ancienne structure
}

export function ScrollingEventsBanner() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events?upcoming=true&limit=10&bannerOnly=true", {
          cache: "no-store",
        })
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error("[ScrollingEventsBanner] Erreur fetch événements:", res.status, errorData)
          // Si le champ showOnBanner n'existe pas encore, ne pas afficher d'erreur visible
          // Le composant ne s'affichera simplement pas
          setLoading(false)
          return
        }

        const data = await res.json()
        
        // Si une warning est présente (champ manquant), ne pas afficher d'erreur
        if (data.warning) {
          console.warn("[ScrollingEventsBanner]", data.warning)
          setLoading(false)
          return
        }

        if (data.success && data.data) {
          // Filtrer les événements avec showOnBanner = true (au cas où certains seraient retournés)
          const bannerEvents = data.data.filter((event: Event) => event.showOnBanner === true)
          setEvents(bannerEvents)
        }
      } catch (error) {
        console.error("[ScrollingEventsBanner] Erreur:", error)
        // En cas d'erreur, ne pas bloquer l'application, simplement ne pas afficher le banner
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Si aucun événement, ne rien afficher
  if (loading || events.length === 0) {
    return null
  }

  // Dupliquer les événements pour créer un défilement infini fluide
  const duplicatedEvents = [...events, ...events]

  // Formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date à confirmer"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Déterminer le type d'événement pour le badge
  const getEventTypeBadge = (type: string | null) => {
    if (!type) return "Événement"
    return type
  }

  return (
    <section className="relative py-16 bg-primary border-y border-gold/20">
      {/* Ligne décorative en haut */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-gold" />
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-gold">
              Événements à venir
            </h2>
          </div>
          <Link 
            href="/events" 
            className="text-gold hover:text-gold-light transition-colors flex items-center gap-2 text-sm md:text-base font-medium"
          >
            Voir tous les événements <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Container de défilement */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-6 scroll-container"
            style={{
              animation: "scroll-left 40s linear infinite",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.animationPlayState = "paused"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animationPlayState = "running"
            }}
          >
            {duplicatedEvents.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className="flex-shrink-0 w-80 md:w-96"
              >
                <Link href={`/events/${event.slug}`}>
                  <div className="bg-card rounded-lg overflow-hidden shadow-xl border border-border hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                    {/* Badge type d'événement en haut */}
                    <div className="px-6 pt-4 pb-2">
                      <div className="inline-block bg-gradient-to-r from-gold to-gold-dark text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase">
                        {getEventTypeBadge(event.type)}
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="px-6 pb-6">
                      <h3 className="font-serif font-bold text-2xl md:text-3xl mb-4 text-foreground group-hover:text-gold transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-sm">{formatDate(event.startsAt)}</span>
                      </div>

                      {/* Lieu */}
                      {event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-6">
                          <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                          <span className="text-sm line-clamp-1">{event.location}</span>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-gold group-hover:text-gold-dark transition-colors font-semibold">
                        <span className="text-sm">En savoir plus</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ligne décorative en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </section>
  )
}
