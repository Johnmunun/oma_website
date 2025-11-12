"use client"

/**
 * @file app/events/page.tsx
 * @description Page publique listant tous les événements avec pagination
 * Inclut une bannière dynamique style YouTube avec photo de couverture
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HtmlContent } from '@/components/html-content'
import { DynamicBanner } from '@/components/dynamic-banner'

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
}

export default function EventsIndexPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const itemsPerPage = 12

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        })
        
        if (filter === 'upcoming') {
          params.append('upcoming', 'true')
        } else if (filter === 'past') {
          params.append('past', 'true')
        }

        const res = await fetch(`/api/events?${params.toString()}`, {
          next: { revalidate: 30 },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setEvents(data.data)
            setTotalPages(data.pagination?.totalPages || 1)
            setTotalEvents(data.pagination?.total || 0)
          }
        }
      } catch (error) {
        console.error('[EventsPage] Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [currentPage, filter])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date à confirmer'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDateLabel = (startsAt: string | null) => {
    if (!startsAt) return 'Date à confirmer'
    const date = new Date(startsAt)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return formatDate(startsAt)
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Demain'
    if (diffDays <= 7) return `Dans ${diffDays} jours`
    return formatDate(startsAt)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-background">
      {/* Bannière dynamique style YouTube */}
      <DynamicBanner />

      <div className="container mx-auto px-4 py-12">
        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('all')
              setCurrentPage(1)
            }}
            className="rounded-full"
          >
            Tous ({totalEvents})
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('upcoming')
              setCurrentPage(1)
            }}
            className="rounded-full"
          >
            À venir
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('past')
              setCurrentPage(1)
            }}
            className="rounded-full"
          >
            Passés
          </Button>
        </div>

        {/* Liste des événements */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Aucun événement</h2>
            <p className="text-muted-foreground">
              {filter === 'upcoming' 
                ? 'Aucun événement à venir pour le moment.'
                : filter === 'past'
                ? 'Aucun événement passé.'
                : 'Aucun événement disponible.'}
            </p>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                    {/* Image - Header complet avec coins arrondis */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-muted to-muted/50 rounded-t-lg -mb-8">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-muted-foreground opacity-30" />
                        </div>
                      )}
                      {/* Badge type */}
                      {event.type && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-gold text-primary px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            {event.type}
                          </span>
                        </div>
                      )}
                      {/* Overlay au survol */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Contenu */}
                    <div className="p-6 pt-12 flex flex-col flex-grow">
                      <h3 className="font-serif font-bold text-xl mb-3 text-foreground line-clamp-2 group-hover:text-gold transition-colors">
                        {event.title}
                      </h3>

                      <div className="space-y-2 mb-4 flex-grow">
                        {event.startsAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                            <span className="line-clamp-1">{getDateLabel(event.startsAt)}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                      </div>

                      <Button className="w-full bg-gold hover:bg-gold-dark text-primary mt-auto">
                        Voir les détails
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isLoading}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-4">
              Page {currentPage} sur {totalPages} • {totalEvents} événement{totalEvents !== 1 ? 's' : ''} au total
            </p>
          </>
        )}
      </div>
    </div>
  )
}
