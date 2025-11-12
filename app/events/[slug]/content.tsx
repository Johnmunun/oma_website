"use client"

/**
 * @file app/events/[slug]/content.tsx
 * @description Page de détail d'un événement avec photo de couverture responsive
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, MapPin, Clock, ArrowLeft, Loader2, CheckCircle2, Ticket } from 'lucide-react'
import Link from 'next/link'
import { EventRegistrationForm } from '@/components/admin/event-registration-form'
import { HtmlContent } from '@/components/html-content'
import { ShareButtons } from '@/components/admin/share-buttons'

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

export default function EventDetailContent({ slug }: { slug: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const registrationFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/events?slug=${slug}`, {
          next: { revalidate: 30 },
        })

        if (!res.ok) {
          if (res.status === 404) {
            setError('Événement non trouvé')
          } else {
            setError('Erreur lors du chargement de l\'événement')
          }
          return
        }

        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          setEvent(data.data[0])
        } else {
          setError('Événement non trouvé')
        }
      } catch (err) {
        console.error('[EventDetailContent] Erreur:', err)
        setError('Erreur de connexion')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [slug])

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

  const getEventUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/events/${slug}`
    }
    return ''
  }

  const scrollToRegistration = () => {
    if (registrationFormRef.current) {
      registrationFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setShowRegistrationForm(true)
    }
  }

  // Vérifier si l'événement est passé (calculé avant les conditions de retour)
  const isPast = event?.startsAt ? new Date(event.startsAt) < new Date() : false
  const eventUrl = event ? getEventUrl() : ''
  
  // Debug: afficher les infos dans la console (doit être avant les conditions de retour)
  useEffect(() => {
    if (event) {
      console.log('[EventDetailContent] Événement chargé:', {
        id: event.id,
        title: event.title,
        startsAt: event.startsAt,
        isPast,
        hasImage: !!event.imageUrl,
        willShowButton: !isPast && !!event.id,
        willShowForm: !isPast && !!event.id,
      })
    }
  }, [event, isPast])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Événement non trouvé</h1>
            <p className="text-muted-foreground mb-6">{error || 'Cet événement n\'existe pas'}</p>
            <Link href="/events">
              <Button>Retour aux événements</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Photo de couverture responsive */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center',
            }}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <Calendar className="w-24 h-24 text-muted-foreground opacity-30" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        
        {/* Contenu sur l'image */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8 md:pb-12 w-full">
            <div className="max-w-5xl w-full">
              <Link href="/events">
                <Button variant="ghost" size="sm" className="mb-4 text-white hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux événements
                </Button>
              </Link>
              
              {event.type && (
                <div className="inline-block bg-gold text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  {event.type}
                </div>
              )}
              
              {/* Titre et bouton Réserver sur la même ligne */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                <div className="flex-1">
                  <h1 className="font-serif font-bold text-3xl md:text-5xl lg:text-6xl text-white mb-4 md:mb-0 text-balance drop-shadow-lg">
                    {event.title}
                  </h1>
                  
                  {event.description && (
                    <p className="text-lg md:text-xl text-gray-100 mt-4 line-clamp-2 drop-shadow-md">
                      {event.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  )}
                </div>
                
                {/* Bouton Réserver aligné à droite - Toujours visible pour les événements à venir */}
                {!isPast && event.id && (
                  <div className="flex-shrink-0 z-20 relative">
                    <Button
                      size="lg"
                      onClick={scrollToRegistration}
                      className="bg-gold hover:bg-gold-dark text-primary font-semibold px-6 md:px-8 py-6 text-base md:text-lg shadow-2xl relative z-20 whitespace-nowrap gap-2"
                    >
                      <Ticket className="w-5 h-5 md:w-6 md:h-6" />
                      Réserver
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Informations principales */}
          <div className="grid md:grid-cols-3 gap-4 mb-12 -mt-8 relative z-10">
            {event.startsAt && (
              <Card className="p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date et heure</p>
                    <p className="font-semibold text-foreground">{formatDate(event.startsAt)}</p>
                    {event.endsAt && (
                      <p className="text-sm text-muted-foreground mt-1">Jusqu'au {formatDate(event.endsAt)}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {event.location && (
              <Card className="p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lieu</p>
                    <p className="font-semibold text-foreground">{event.location}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Statut</p>
                  <p className="font-semibold text-foreground">
                    {isPast ? 'Événement passé' : 'À venir'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Description complète */}
          {event.description && (
            <Card className="p-8 mb-12">
              <h2 className="font-serif font-bold text-3xl mb-6 text-foreground">À propos de cet événement</h2>
              <div className="prose prose-lg max-w-none">
                <HtmlContent content={event.description} />
              </div>
            </Card>
          )}

          {/* Section inscription - Toujours affichée pour les événements à venir */}
          {!isPast && event.id ? (
            <Card ref={registrationFormRef} className="p-8 md:p-12 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <h2 className="font-serif font-bold text-3xl mb-2 text-foreground">Réservez votre place</h2>
                  <p className="text-muted-foreground">
                    Inscrivez-vous dès maintenant pour ne pas manquer cet événement
                  </p>
                </div>
                <ShareButtons
                  url={eventUrl}
                  title={event.title}
                  description={event.description || undefined}
                  imageUrl={event.imageUrl || undefined}
                />
              </div>

              {/* Afficher le formulaire directement */}
              <EventRegistrationForm
                eventId={event.id}
                eventTitle={event.title}
                onSuccess={() => {
                  // Optionnel: masquer le formulaire après succès si nécessaire
                }}
              />
            </Card>
          ) : isPast ? (
            <Card className="p-12 text-center bg-muted/50">
              <h2 className="font-serif font-bold text-2xl mb-4 text-foreground">Événement passé</h2>
              <p className="text-muted-foreground mb-6">
                Cet événement s'est déroulé le {formatDate(event.startsAt)}. Merci à tous les participants !
              </p>
              <Link href="/events">
                <Button className="bg-gold hover:bg-gold-dark text-primary">
                  Découvrir nos prochains événements
                </Button>
              </Link>
            </Card>
          ) : null}

        </div>
      </div>
    </div>
  )
}
