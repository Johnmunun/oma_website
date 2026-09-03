'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { Link2, Upload, X } from 'lucide-react'
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
import { uploadFileToCloudflareDirectUrl } from '@/lib/videos/upload-to-cloudflare-direct'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export type ChallengeVideoFormData = {
  candidateId: string
  title: string
  description: string
  videoUrl: string
  fileId?: string | null
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
  challengeId: string
  initialData?: Partial<ChallengeVideoFormData> & { id?: string; candidateId?: string } | null
}

const EMPTY: ChallengeVideoFormData = {
  candidateId: '',
  title: '',
  description: '',
  videoUrl: '',
  fileId: null,
}

const MAX_BYTES = 200 * 1024 * 1024

export function ChallengeVideoDrawer({
  isOpen,
  onClose,
  onSubmit,
  candidates,
  challengeId,
  initialData,
}: ChallengeVideoDrawerProps) {
  const [form, setForm] = useState<ChallengeVideoFormData>(EMPTY)
  const [mode, setMode] = useState<'upload' | 'link'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
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
        fileId: initialData.fileId ?? null,
      })
      setMode(initialData.fileId ? 'upload' : 'link')
    } else {
      setForm({
        ...EMPTY,
        candidateId: candidates[0]?.id ?? '',
      })
      setMode('upload')
    }
    setFile(null)
    setProgress(null)
  }, [isOpen, initialData, candidates])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.candidateId) return

    setIsSubmitting(true)
    setProgress(null)
    try {
      let videoUrl = form.videoUrl.trim()
      let fileId = form.fileId ?? null

      if (mode === 'upload' && file) {
        if (file.size > MAX_BYTES) {
          toast.error('Fichier trop volumineux (max 200 Mo)')
          return
        }
        const prep = await fetch(`/api/admin/challenges/${challengeId}/videos/direct-upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            candidateId: form.candidateId,
          }),
        }).then((r) => r.json())

        if (!prep.success) {
          toast.error(prep.error || 'Upload Cloudflare indisponible')
          return
        }

        setProgress(0)
        await uploadFileToCloudflareDirectUrl(prep.data.uploadURL, file, setProgress)
        fileId = prep.data.uid
        videoUrl = ''
      } else if (mode === 'link' && !videoUrl) {
        toast.error('URL vidéo requise')
        return
      } else if (mode === 'upload' && !file && !fileId) {
        toast.error('Choisissez un fichier vidéo')
        return
      }

      await onSubmit({
        ...form,
        videoUrl,
        fileId,
      })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
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

          <div className="flex gap-2 rounded-lg bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                mode === 'upload' ? 'bg-background shadow-sm' : 'text-muted-foreground',
              )}
            >
              <Upload className="h-4 w-4" />
              Cloudflare
            </button>
            <button
              type="button"
              onClick={() => setMode('link')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                mode === 'link' ? 'bg-background shadow-sm' : 'text-muted-foreground',
              )}
            >
              <Link2 className="h-4 w-4" />
              Lien
            </button>
          </div>

          {mode === 'upload' ? (
            <div className="space-y-2">
              <Label>Fichier vidéo *</Label>
              <Input
                type="file"
                accept="video/*"
                disabled={isSubmitting}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Stockage Cloudflare Stream — max 200 Mo
              </p>
              {progress !== null && (
                <p className="text-xs text-muted-foreground">Upload {progress}%</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>URL vidéo *</Label>
              <Input
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="YouTube, Vimeo ou Cloudflare"
              />
            </div>
          )}

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
