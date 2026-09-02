'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type CandidateFormData = {
  fullName: string
  email: string
  phone: string
  birthDate: string
  age: string
  parentName: string
  parentEmail: string
  parentPhone: string
  city: string
  notes: string
  reviewNotes: string
  status: string
}

interface CandidateDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CandidateFormData) => Promise<void>
  initialData?: Partial<CandidateFormData> & { id?: string } | null
}

const EMPTY: CandidateFormData = {
  fullName: '',
  email: '',
  phone: '',
  birthDate: '',
  age: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  city: '',
  notes: '',
  reviewNotes: '',
  status: 'PENDING',
}

const STATUSES = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvé' },
  { value: 'REJECTED', label: 'Rejeté' },
] as const

export function CandidateDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CandidateDrawerProps) {
  const [form, setForm] = useState<CandidateFormData>(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(initialData?.id)

  useEffect(() => {
    if (!isOpen) return
    if (initialData?.id) {
      setForm({
        fullName: initialData.fullName ?? '',
        email: initialData.email ?? '',
        phone: initialData.phone ?? '',
        birthDate: initialData.birthDate ?? '',
        age: initialData.age ?? '',
        parentName: initialData.parentName ?? '',
        parentEmail: initialData.parentEmail ?? '',
        parentPhone: initialData.parentPhone ?? '',
        city: initialData.city ?? '',
        notes: initialData.notes ?? '',
        reviewNotes: initialData.reviewNotes ?? '',
        status: initialData.status ?? 'PENDING',
      })
    } else {
      setForm(EMPTY)
    }
  }, [isOpen, initialData])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-xl overflow-y-auto border-l border-border bg-background shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-6">
          <h2 className="text-xl font-bold">
            {isEdit ? 'Modifier le candidat' : 'Ajouter un candidat'}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-muted" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="candidate-name">Nom complet *</Label>
            <Input
              id="candidate-name"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="candidate-email">Email *</Label>
              <Input
                id="candidate-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-phone">Téléphone</Label>
              <Input
                id="candidate-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="candidate-age">Âge</Label>
              <Input
                id="candidate-age"
                type="number"
                min={5}
                max={18}
                value={form.age}
                onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-birthdate">Date de naissance</Label>
              <Input
                id="candidate-birthdate"
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidate-city">Ville</Label>
            <Input
              id="candidate-city"
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
            />
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-4">
            <p className="text-sm font-medium">Responsable / parent</p>
            <div className="space-y-2">
              <Label htmlFor="candidate-parent-name">Nom du parent</Label>
              <Input
                id="candidate-parent-name"
                value={form.parentName}
                onChange={(e) => setForm((prev) => ({ ...prev, parentName: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="candidate-parent-email">Email parent</Label>
                <Input
                  id="candidate-parent-email"
                  type="email"
                  value={form.parentEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, parentEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidate-parent-phone">Téléphone parent</Label>
                <Input
                  id="candidate-parent-phone"
                  value={form.parentPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, parentPhone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidate-notes">Notes candidat</Label>
            <Textarea
              id="candidate-notes"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {isEdit && (
            <>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidate-review-notes">Notes de validation</Label>
                <Textarea
                  id="candidate-review-notes"
                  value={form.reviewNotes}
                  onChange={(e) => setForm((prev) => ({ ...prev, reviewNotes: e.target.value }))}
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 border-t border-border pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
