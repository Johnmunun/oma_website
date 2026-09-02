'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChallengeVideoSubmitFormProps {
  contactSlug: string
  challengeSlug: string
  token: string
  candidateName: string
  existingVideo?: { title: string | null; status: string } | null
}

export function ChallengeVideoSubmitForm({
  contactSlug,
  challengeSlug,
  token,
  candidateName,
  existingVideo,
}: ChallengeVideoSubmitFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(
        `/api/structures/${encodeURIComponent(contactSlug)}/challenges/${encodeURIComponent(challengeSlug)}/videos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            title: form.title.trim() || null,
            description: form.description.trim() || null,
            videoUrl: form.videoUrl.trim(),
          }),
        }
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }
      setSuccess(data.message || 'Vidéo enregistrée avec succès.')
      setForm({ title: '', description: '', videoUrl: '' })
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

        <div className="space-y-1.5">
          <label htmlFor="video-url" className="text-sm font-medium text-slate-700">
            Lien vidéo *
          </label>
          <Input
            id="video-url"
            value={form.videoUrl}
            onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
            placeholder="https://www.youtube.com/watch?v=…"
            required
            className="h-11"
          />
          <p className="text-xs text-slate-500">YouTube, Vimeo ou lien direct (HTTPS)</p>
        </div>

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
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">{error}</p>
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
