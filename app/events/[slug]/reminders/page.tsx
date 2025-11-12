"use client"

/**
 * @file app/events/[slug]/reminders/page.tsx
 * @description Page pour gérer les préférences de rappel d'un événement
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Bell, BellOff } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ReminderData {
  id: string
  email: string
  remindersEnabled: boolean
  event: {
    id: string
    title: string
    slug: string
    startsAt: string | null
  }
}

export default function EventRemindersPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const registrationId = searchParams.get('registration')
  const action = searchParams.get('action')
  
  const [data, setData] = useState<ReminderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!registrationId) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/registrations/${registrationId}/reminders`)
        if (res.ok) {
          const result = await res.json()
          if (result.success && result.data) {
            setData(result.data)
            
            // Si action=unsubscribe, désactiver automatiquement
            if (action === 'unsubscribe' && result.data.remindersEnabled) {
              handleToggleReminders(false)
            }
          }
        } else {
          toast.error('Inscription non trouvée')
        }
      } catch (error) {
        console.error('[EventRemindersPage] Erreur:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [registrationId, action])

  const handleToggleReminders = async (enabled: boolean) => {
    if (!registrationId) return

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/registrations/${registrationId}/reminders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })

      const result = await res.json()

      if (res.ok && result.success) {
        setData((prev) => prev ? { ...prev, remindersEnabled: enabled } : null)
        toast.success(
          enabled
            ? 'Rappels activés ! Vous recevrez des rappels quotidiens 5 jours avant l\'événement.'
            : 'Rappels désactivés pour cet événement.'
        )
      } else {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (error: any) {
      console.error('[EventRemindersPage] Erreur toggle:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || !registrationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-background">
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Inscription non trouvée</h1>
            <p className="text-muted-foreground mb-6">
              Impossible de trouver cette inscription. Vérifiez le lien.
            </p>
            <Link href="/events">
              <Button>Retour aux événements</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const eventDate = data.event.startsAt
    ? new Date(data.event.startsAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date à confirmer'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-background">
      <div className="container mx-auto px-4 py-12">
        <Link href={`/events/${data.event.slug}`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'événement
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              {data.remindersEnabled ? (
                <Bell className="w-16 h-16 text-green-600 mx-auto mb-4" />
              ) : (
                <BellOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              )}
              <h1 className="text-3xl font-bold mb-2">Gestion des rappels</h1>
              <p className="text-muted-foreground">
                {data.event.title}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h2 className="font-semibold mb-4">Informations</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email :</strong> {data.email}
                  </p>
                  <p>
                    <strong>Date de l'événement :</strong> {eventDate}
                  </p>
                  <p>
                    <strong>Statut des rappels :</strong>{' '}
                    <span className={data.remindersEnabled ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                      {data.remindersEnabled ? 'Activés' : 'Désactivés'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Comment fonctionnent les rappels ?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Les rappels commencent 5 jours avant l'événement</li>
                  <li>Vous recevrez un email de rappel chaque jour</li>
                  <li>Les rappels s'arrêtent automatiquement le jour de l'événement</li>
                  <li>Vous pouvez désactiver les rappels à tout moment</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleToggleReminders(!data.remindersEnabled)}
                  disabled={isUpdating}
                  variant={data.remindersEnabled ? 'destructive' : 'default'}
                  className="flex-1 gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : data.remindersEnabled ? (
                    <>
                      <BellOff className="w-4 h-4" />
                      Désactiver les rappels
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Activer les rappels
                    </>
                  )}
                </Button>
              </div>

              {action === 'unsubscribe' && data.remindersEnabled === false && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Rappels désactivés</p>
                    <p className="text-sm text-green-700 mt-1">
                      Vous ne recevrez plus de rappels pour cet événement.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

