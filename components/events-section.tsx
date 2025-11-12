"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { ShareButtons } from "@/components/admin/share-buttons"
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"

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
  status: string
}

export function EventsSection() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        
        // Récupérer les événements en parallèle avec cache
        const [upcomingRes, allRes] = await Promise.all([
          fetch("/api/events?upcoming=true&limit=20", {
            next: { revalidate: 30 }, // Cache 30 secondes
          }),
          fetch("/api/events?limit=50", {
            next: { revalidate: 30 }, // Cache 30 secondes
          })
        ])
        
        // Traiter les résultats en parallèle
        const [upcomingData, allData] = await Promise.all([
          upcomingRes.ok ? upcomingRes.json() : { success: false },
          allRes.ok ? allRes.json() : { success: false }
        ])
        
        if (upcomingData.success && upcomingData.data) {
          console.log("[EventsSection] Événements à venir reçus:", upcomingData.data.length)
          setUpcomingEvents(upcomingData.data)
        } else {
          console.warn("[EventsSection] Pas de données pour les événements à venir:", upcomingData)
        }

        if (allData.success && allData.data) {
          const now = new Date()
          const past = allData.data.filter((event: Event) => {
            if (!event.startsAt) return false
            return new Date(event.startsAt) < now
          })
          console.log("[EventsSection] Événements passés trouvés:", past.length)
          setPastEvents(past.slice(0, 12))
        } else {
          console.warn("[EventsSection] Pas de données pour tous les événements:", allData)
        }
      } catch (error) {
        console.error("[EventsSection] Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

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

  // Obtenir l'URL de l'événement
  const getEventUrl = (slug: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/events/${slug}`
    }
    return `/events/${slug}`
  }

  return (
    <section id="evenements" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-up" delay={100}>
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
              Nos événements
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Rejoignez-nous lors de nos prochains événements ou revivez nos moments passés
            </p>
          </div>
        </AnimateOnScroll>

        <div className="flex justify-center gap-4 mb-12">
          <Button
            variant={activeTab === "upcoming" ? "default" : "outline"}
            onClick={() => setActiveTab("upcoming")}
            className={
              activeTab === "upcoming"
                ? "bg-gold hover:bg-gold-dark text-primary"
                : "border-gold text-gold hover:bg-gold hover:text-primary"
            }
          >
            À venir
          </Button>
          <Button
            variant={activeTab === "past" ? "default" : "outline"}
            onClick={() => setActiveTab("past")}
            className={
              activeTab === "past"
                ? "bg-gold hover:bg-gold-dark text-primary"
                : "border-gold text-gold hover:bg-gold hover:text-primary"
            }
          >
            Moments passés
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des événements...</p>
          </div>
        ) : activeTab === "upcoming" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {upcomingEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Aucun événement à venir pour le moment.</p>
              </div>
            ) : (
              upcomingEvents.slice(0, 6).map((event, index) => (
                <AnimateOnScroll key={event.id} animation="fade-up" delay={index * 100}>
                  <div
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative flex flex-col h-full"
                    style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                  >
                  {/* Image de l'événement avec coins arrondis */}
                  <div className="relative h-56 overflow-hidden rounded-t-2xl flex-shrink-0">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/20 to-gold/5">
                        <Calendar className="w-16 h-16 text-gold/30" />
                      </div>
                    )}
                    {/* Badge type en haut à gauche */}
                    {event.type && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-gold text-primary px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          {event.type}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu de la carte - flex pour pousser les boutons en bas */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Titre */}
                    <h3 className="font-serif font-bold text-xl mb-4 text-foreground line-clamp-2 group-hover:text-gold transition-colors">
                      {event.title}
                    </h3>
                    
                    {/* Informations avec meilleure disposition */}
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{formatDate(event.startsAt)}</p>
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground line-clamp-2">{event.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Boutons d'action en bas - Uniquement pour les événements à venir */}
                    {(() => {
                      const isPast = event.startsAt ? new Date(event.startsAt) < new Date() : false
                      if (isPast) {
                        return (
                          <div className="pt-4 border-t border-border/50 mt-auto">
                            <Link href={`/events/${event.slug}`} className="w-full">
                              <Button className="w-full bg-gold hover:bg-gold-dark text-primary rounded-lg py-2.5 font-semibold">
                                Voir les détails
                              </Button>
                            </Link>
                          </div>
                        )
                      }
                      return (
                        <div className="flex flex-col gap-3 pt-4 border-t border-border/50 mt-auto">
                          <Link href={`/events/${event.slug}`} className="w-full">
                            <Button className="w-full bg-gold hover:bg-gold-dark text-primary rounded-lg py-2.5 font-semibold">
                              En savoir plus
                            </Button>
                          </Link>
                          <div className="flex justify-center">
                            <ShareButtons
                              url={getEventUrl(event.slug)}
                              title={event.title}
                              description={event.description || undefined}
                              imageUrl={event.imageUrl || undefined}
                              className="flex-shrink-0"
                            />
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                </AnimateOnScroll>
              ))
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pastEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Aucun événement passé pour le moment.</p>
              </div>
            ) : (
              pastEvents.slice(0, 8).map((event, index) => (
                <AnimateOnScroll key={event.id} animation="fade-up" delay={index * 50}>
                  <Link href={`/events/${event.slug}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative h-full"
                      style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    >
                    {/* Image avec coins arrondis */}
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/20 to-gold/5">
                          <Calendar className="w-16 h-16 text-gold/30" />
                        </div>
                      )}
                      {/* Overlay subtil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Contenu de la carte */}
                    <div className="p-4">
                      <h3 className="font-serif font-bold text-base mb-2 text-foreground text-center line-clamp-2 group-hover:text-gold transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center">{formatDate(event.startsAt)}</p>
                    </div>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))
            )}
          </div>
        )}

        {/* CTA: Plus d'événements */}
        <div className="mt-12 flex justify-center">
          <Link href="/events">
            <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-primary w-full sm:w-auto">
              <span className="w-full sm:w-auto">Découvrir nos prochains événements</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
