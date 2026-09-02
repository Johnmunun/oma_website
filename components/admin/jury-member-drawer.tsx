'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

export type JuryMemberFormData = {
  fullName: string
  email: string
  title: string
  bio: string
  isActive: boolean
  sortOrder: string
}

interface JuryMemberDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: JuryMemberFormData) => Promise<void>
  initialData?: Partial<JuryMemberFormData> & { id?: string } | null
}

const EMPTY: JuryMemberFormData = {
  fullName: '',
  email: '',
  title: '',
  bio: '',
  isActive: true,
  sortOrder: '0',
}

export function JuryMemberDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: JuryMemberDrawerProps) {
  const [form, setForm] = useState<JuryMemberFormData>(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(initialData?.id)

  useEffect(() => {
    if (!isOpen) return
    if (initialData?.id) {
      setForm({
        fullName: initialData.fullName ?? '',
        email: initialData.email ?? '',
        title: initialData.title ?? '',
        bio: initialData.bio ?? '',
        isActive: initialData.isActive ?? true,
        sortOrder: initialData.sortOrder ?? '0',
      })
    } else {
      setForm(EMPTY)
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-lg flex-col border-l border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-bold">
            {isEdit ? 'Modifier le juré' : 'Ajouter un juré'}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="space-y-2">
            <Label>Nom complet *</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Fonction / titre</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex. Coach éloquence, Artiste"
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Ordre d&apos;affichage</Label>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, isActive: checked === true }))
              }
            />
            Juré actif
          </label>

          <div className="flex gap-3 border-t border-border pt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
