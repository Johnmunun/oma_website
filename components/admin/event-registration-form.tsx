"use client"

/**
 * @file components/admin/event-registration-form.tsx
 * @description Formulaire d'inscription public sécurisé pour les événements
 * Utilise un token pour sécuriser les inscriptions
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface EventRegistrationFormProps {
  eventId: string
  eventTitle: string
  onSuccess?: () => void
}

export function EventRegistrationForm({
  eventId,
  eventTitle,
  onSuccess,
}: EventRegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false)

  // Charger le token sécurisé
  useEffect(() => {
    const loadToken = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/events/${eventId}/register`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.token) {
            setToken(data.data.token)
          } else {
            toast.error('Impossible de charger le formulaire d\'inscription')
          }
        } else {
          const error = await res.json()
          toast.error(error.error || 'Erreur lors du chargement du formulaire')
        }
      } catch (error) {
        console.error('[EventRegistrationForm] Erreur chargement token:', error)
        toast.error('Erreur de connexion')
      } finally {
        setIsLoading(false)
      }
    }

    loadToken()
  }, [eventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Formulaire non prêt. Veuillez réessayer.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          token,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Gérer spécifiquement le cas où l'utilisateur est déjà inscrit (409 Conflict)
        if (res.status === 409) {
          setIsAlreadyRegistered(true)
          toast.info(data.error || 'Vous êtes déjà inscrit à cet événement', {
            duration: 5000,
          })
          
          // Réinitialiser le formulaire
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            notes: '',
          })

          if (onSuccess) {
            onSuccess()
          }
          return
        }
        
        // Pour les autres erreurs, lancer une exception
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      if (data.success) {
        setIsSuccess(true)
        toast.success('Inscription réussie ! Un email de confirmation a été envoyé.')
        
        // Réinitialiser le formulaire
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          notes: '',
        })

        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error('[EventRegistrationForm] Erreur soumission:', error)
      toast.error(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isAlreadyRegistered) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Vous êtes déjà inscrit !
        </h3>
        <p className="text-sm text-blue-700 mb-2">
          Votre inscription à l'événement "{eventTitle}" est déjà enregistrée.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          Si vous avez des questions, n'hésitez pas à nous contacter.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setIsAlreadyRegistered(false)}
        >
          Réessayer avec un autre email
        </Button>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Inscription confirmée !
        </h3>
        <p className="text-sm text-green-700 mb-2">
          Votre inscription à l'événement "{eventTitle}" est confirmée.
        </p>
        <p className="text-xs text-green-600 mt-2">
          📧 Un email de confirmation vous a été envoyé. Vérifiez votre boîte de réception.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nom complet *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          minLength={2}
          placeholder="Jean Dupont"
        />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="jean.dupont@example.com"
        />
      </div>

      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div>
        <Label htmlFor="notes">Message / Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informations complémentaires..."
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !token}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "S'inscrire à l'événement"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        * Champs obligatoires. Vos données sont sécurisées et ne seront utilisées que pour cet événement.
      </p>
    </form>
  )
}

