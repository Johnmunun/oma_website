/**
 * @file app/events/[slug]/register/page.tsx
 * @description Page publique de formulaire d'inscription à un événement
 * Sécurisée avec token pour éviter les abus
 */

"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EventRegistrationForm } from '@/components/admin/event-registration-form'
import { Card } from '@/components/ui/card'
import { Calendar, MapPin, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HtmlContent } from '@/components/html-content'

interface Event {
  id: string
  title: string
  description: string | null
  location: string | null
  startsAt: string | null
  endsAt: string | null
  imageUrl: string | null
  status: string
}

export default function EventRegisterPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/events?slug=${slug}`)
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
          const eventData = data.data[0]
          if (eventData.status !== 'PUBLISHED') {
            setError('Cet événement n\'est pas disponible pour les inscriptions')
            return
          }
          setEvent(eventData)
        } else {
          setError('Événement non trouvé')
        }
      } catch (err) {
        console.error('[EventRegisterPage] Erreur:', err)
        setError('Erreur de connexion')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadEvent()
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-background">
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Erreur</h1>
            <p className="text-muted-foreground mb-6">{error || 'Événement non trouvé'}</p>
            <Link href="/events">
              <Button>Retour aux événements</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-background">
      <div className="container mx-auto px-4 py-12">
        <Link href={`/events/${slug}`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'événement
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Informations de l'événement */}
            <Card className="p-6">
              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
              
              {event.description && (
                <div className="mb-6">
                  <HtmlContent content={event.description} className="text-muted-foreground" />
                </div>
              )}

              <div className="space-y-4">
                {event.startsAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date et heure</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.startsAt)}
                        {event.endsAt && ` - ${formatDate(event.endsAt)}`}
                      </p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg mt-6"
                />
              )}
            </Card>

            {/* Formulaire d'inscription */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-2">Inscription</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Remplissez le formulaire ci-dessous pour vous inscrire à cet événement.
              </p>

              <EventRegistrationForm
                eventId={event.id}
                eventTitle={event.title}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

