'use client'

import type React from 'react'
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

export type ChallengeVideoFormData = {
  candidateId: string
  title: string
  description: string
  videoUrl: string
}

interface ApprovedCandidate {
  id: string
  fullName: string
  email: string
}

interface ChallengeVideoDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ChallengeVideoFormData) => Promise<void>
  candidates: ApprovedCandidate[]
  initialData?: Partial<ChallengeVideoFormData> & { id?: string; candidateId?: string } | null
}

const EMPTY: ChallengeVideoFormData = {
  candidateId: '',
  title: '',
  description: '',
  videoUrl: '',
}

export function ChallengeVideoDrawer({
  isOpen,
  onClose,
  onSubmit,
  candidates,
  initialData,
}: ChallengeVideoDrawerProps) {
  const [form, setForm] = useState<ChallengeVideoFormData>(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(initialData?.id)

  useEffect(() => {
    if (!isOpen) return
    if (initialData?.id) {
      setForm({
        candidateId: initialData.candidateId ?? '',
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        videoUrl: initialData.videoUrl ?? '',
      })
    } else {
      setForm({
        ...EMPTY,
        candidateId: candidates[0]?.id ?? '',
      })
    }
  }, [isOpen, initialData, candidates])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.candidateId || !form.videoUrl.trim()) return
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
          <h2 className="text-xl font-bold">{isEdit ? 'Modifier la vidéo' : 'Ajouter une vidéo'}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          {!isEdit && (
            <div className="space-y-2">
              <Label>Candidat approuvé *</Label>
              <Select
                value={form.candidateId}
                onValueChange={(v) => setForm((f) => ({ ...f, candidateId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un candidat" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName} · {c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex. Mon slam — finale locale"
            />
          </div>

          <div className="space-y-2">
            <Label>URL vidéo *</Label>
            <Input
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              placeholder="https://youtube.com/watch?v=… ou Vimeo"
              required
            />
            <p className="text-xs text-muted-foreground">YouTube, Vimeo ou lien HTTPS direct</p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>

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
