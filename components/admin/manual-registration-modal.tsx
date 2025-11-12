"use client"

/**
 * @file components/admin/manual-registration-modal.tsx
 * @description Modal pour créer une inscription manuellement depuis l'admin
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ManualRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
  onSuccess?: () => void
}

export function ManualRegistrationModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onSuccess,
}: ManualRegistrationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/admin/events/${eventId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'inscription')
      }

      if (data.success) {
        toast.success('Inscription créée avec succès')
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          notes: '',
        })
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error('[ManualRegistrationModal] Erreur:', error)
      toast.error(error.message || 'Erreur lors de la création de l\'inscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inscrire quelqu'un à "{eventTitle}"</DialogTitle>
          <DialogDescription>
            Créez une inscription manuellement pour cet événement. Utile pour les personnes qui appellent par téléphone ou qui n'ont pas accès à internet.
          </DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer l\'inscription'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

