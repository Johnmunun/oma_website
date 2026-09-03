'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Link2, Send, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  formatBytesLabel,
  CLOUDFLARE_TUS_MAX_BYTES,
} from '@/lib/videos/cloudflare-stream-limits'
import {
  uploadFileToCloudflareDirectUrl,
  uploadFileToCloudflareTusUrl,
} from '@/lib/videos/upload-to-cloudflare-direct'
import { cn } from '@/lib/utils'

interface ChallengeVideoSubmitFormProps {
  contactSlug: string
  challengeSlug: string
  token: string
  candidateName: string
  existingVideo?: { title: string | null; status: string } | null
  cloudflareUploadEnabled?: boolean
}

type Mode = 'upload' | 'link'

export function ChallengeVideoSubmitForm({
  contactSlug,
  challengeSlug,
  token,
  candidateName,
  existingVideo,
  cloudflareUploadEnabled = false,
}: ChallengeVideoSubmitFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(cloudflareUploadEnabled ? 'upload' : 'link')
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '' })
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const apiBase = `/api/structures/${encodeURIComponent(contactSlug)}/challenges/${encodeURIComponent(challengeSlug)}/videos`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    setProgress(null)

    try {
      let videoUrl: string | null = form.videoUrl.trim() || null
      let fileId: string | null = null

      if (mode === 'upload') {
        if (!cloudflareUploadEnabled) {
          throw new Error('Upload Cloudflare indisponible pour le moment')
        }
        if (!file) throw new Error('Choisissez un fichier vidéo')
        if (file.size > CLOUDFLARE_TUS_MAX_BYTES) {
          throw new Error(
            `Fichier trop volumineux (max ${formatBytesLabel(CLOUDFLARE_TUS_MAX_BYTES)}). Compressez la vidéo ou utilisez un lien.`
          )
        }
        if (!file.type.startsWith('video/')) {
          throw new Error('Le fichier doit être une vidéo')
        }

        const prep = await fetch(`${apiBase}/direct-upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            fileName: file.name,
            fileSize: file.size,
          }),
        }).then((r) => r.json())

        if (!prep.success) {
          throw new Error(prep.error || 'Impossible de préparer l’upload')
        }

        setProgress(0)
        if (prep.data.mode === 'tus') {
          await uploadFileToCloudflareTusUrl(prep.data.uploadURL, file, setProgress)
        } else {
          await uploadFileToCloudflareDirectUrl(prep.data.uploadURL, file, setProgress)
        }
        fileId = prep.data.uid as string
        videoUrl = null
      } else if (!videoUrl) {
        throw new Error('Collez un lien vidéo')
      }

      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          title: form.title.trim() || null,
          description: form.description.trim() || null,
          videoUrl,
          fileId,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'envoi")
      }
      setSuccess(data.message || 'Vidéo enregistrée avec succès.')
      setForm({ title: '', description: '', videoUrl: '' })
      setFile(null)
      setProgress(null)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl text-left">
      <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl ring-1 ring-slate-100 md:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Film className="h-4 w-4" style={{ color: 'var(--st-primary)' }} />
          Vidéo de {candidateName}
        </div>

        {existingVideo && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
            Une vidéo est déjà enregistrée ({existingVideo.title || 'Sans titre'}) — statut :{' '}
            <strong>{existingVideo.status}</strong>. Vous pouvez la remplacer ci-dessous.
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="video-title" className="text-sm font-medium text-slate-700">
            Titre de la prestation
          </label>
          <Input
            id="video-title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Ex. Mon poème — Talents Enfants 2026"
            className="h-11"
          />
        </div>

        {cloudflareUploadEnabled && (
          <div className="flex gap-2 rounded-xl bg-slate-50 p-1 ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                mode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
              )}
            >
              <Upload className="h-4 w-4" />
              Upload fichier
            </button>
            <button
              type="button"
              onClick={() => setMode('link')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                mode === 'link' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
              )}
            >
              <Link2 className="h-4 w-4" />
              Lien
            </button>
          </div>
        )}

        {mode === 'upload' && cloudflareUploadEnabled ? (
          <div className="space-y-2">
            <label htmlFor="video-file" className="text-sm font-medium text-slate-700">
              Fichier vidéo *
            </label>
            <Input
              id="video-file"
              type="file"
              accept="video/*"
              disabled={isSubmitting}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="h-11 cursor-pointer"
            />
            <p className="text-xs text-slate-500">
              Stockage Cloudflare Stream — MP4/MOV recommandé, jusqu’à{' '}
              {formatBytesLabel(CLOUDFLARE_TUS_MAX_BYTES)} (upload resumable au-delà de 200 Mo)
            </p>
            {file && (
              <p className="text-xs font-medium text-slate-600">
                {file.name} ({Math.round(file.size / (1024 * 1024))} Mo)
              </p>
            )}
            {progress !== null && (
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: 'var(--st-primary)',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500">Upload {progress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="video-url" className="text-sm font-medium text-slate-700">
              Lien vidéo *
            </label>
            <Input
              id="video-url"
              value={form.videoUrl}
              onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=…"
              required={mode === 'link'}
              className="h-11"
            />
            <p className="text-xs text-slate-500">YouTube, Vimeo ou lien Cloudflare Stream</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="video-desc" className="text-sm font-medium text-slate-700">
            Description (optionnel)
          </label>
          <Textarea
            id="video-desc"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            className="resize-none"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
            {success}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full font-semibold text-white sm:w-auto sm:min-w-[220px]"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Envoi…' : 'Envoyer ma vidéo'}
        </Button>
      </div>
    </form>
  )
}
