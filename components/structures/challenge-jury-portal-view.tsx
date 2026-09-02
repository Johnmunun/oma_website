'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gavel, Star } from 'lucide-react'
import { StructureLogo } from '@/components/structure-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getStructureThemeVars } from '@/lib/structures/landing-theme'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'
import { toast } from 'sonner'

export type PublicJuryPortalData = {
  structure: {
    name: string
    logoUrl: string | null
    landingThemeColor: string | null
  }
  challenge: { name: string; slug: string }
  member: { fullName: string; title: string | null }
  candidates: Array<{
    id: string
    fullName: string
    age: number | null
    city: string | null
    video: {
      title: string | null
      videoUrl: string
      thumbnailUrl: string | null
    } | null
  }>
  evaluations: Array<{
    candidateId: string
    score: number
    comment: string | null
  }>
  contactSlug: string
  token: string
}

export function ChallengeJuryPortalView({ data }: { data: PublicJuryPortalData }) {
  const { structure, challenge, member, candidates, evaluations, contactSlug, token } = data
  const themeStyle = getStructureThemeVars(structure.landingThemeColor)
  const landingPath = `/s/${contactSlug}`

  const evaluationMap = useMemo(() => {
    return new Map(evaluations.map((e) => [e.candidateId, e]))
  }, [evaluations])

  const evaluatedCount = evaluations.length
  const totalCount = candidates.length

  return (
    <div
      className="structure-site relative min-h-screen bg-[#fafafa] text-slate-900 antialiased"
      style={themeStyle}
    >
      <header className="relative border-b border-white/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href={landingPath} className="flex min-w-0 items-center gap-3">
            <StructureLogo
              src={structure.logoUrl}
              alt={structure.name}
              size="md"
              className="h-11 w-11 shadow-md ring-2 ring-[var(--st-primary-soft)]"
            />
            <span className="truncate font-serif text-lg font-bold">{structure.name}</span>
          </Link>
          <Link
            href={landingPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[var(--st-primary-dark)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <div className="text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{
              backgroundImage:
                'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
            }}
          >
            <Gavel className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-bold md:text-4xl">Portail jury</h1>
          <p className="mt-2 text-slate-600">{challenge.name}</p>
          <p className="mt-3 text-sm text-slate-500">
            Bonjour <strong>{member.fullName}</strong>
            {member.title ? ` · ${member.title}` : ''}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--st-primary-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--st-primary-dark)]">
            {evaluatedCount}/{totalCount} candidat(s) évalué(s)
          </p>
        </div>

        {candidates.length === 0 ? (
          <div className="mt-12 rounded-2xl border bg-white p-10 text-center text-slate-600">
            Aucune vidéo publiée à évaluer pour le moment.
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {candidates.map((candidate) => (
              <CandidateEvaluationCard
                key={candidate.id}
                candidate={candidate}
                contactSlug={contactSlug}
                challengeSlug={challenge.slug}
                token={token}
                existing={evaluationMap.get(candidate.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function CandidateEvaluationCard({
  candidate,
  contactSlug,
  challengeSlug,
  token,
  existing,
}: {
  candidate: PublicJuryPortalData['candidates'][0]
  contactSlug: string
  challengeSlug: string
  token: string
  existing?: { score: number; comment: string | null }
}) {
  const [score, setScore] = useState(existing ? String(existing.score) : '')
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(Boolean(existing))

  const video = candidate.video
  const parsed = video ? parseVideoUrl(video.videoUrl) : null

  const submit = async () => {
    const parsedScore = Number.parseFloat(score)
    if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10) {
      toast.error('Note entre 0 et 10 requise')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(
        `/api/structures/${encodeURIComponent(contactSlug)}/challenges/${encodeURIComponent(challengeSlug)}/jury/evaluations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            candidateId: candidate.id,
            score: parsedScore,
            comment: comment.trim() || null,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      toast.success('Évaluation enregistrée')
      setSaved(true)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row">
        {parsed && (parsed.source === 'YOUTUBE' || parsed.source === 'VIMEO') ? (
          <div className="aspect-video w-full max-w-sm shrink-0 overflow-hidden rounded-xl border bg-black">
            <iframe
              src={parsed.embedUrl}
              title={video?.title || candidate.fullName}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : video ? (
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--st-primary)] hover:underline"
          >
            Voir la vidéo
          </a>
        ) : null}

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{candidate.fullName}</h2>
            <p className="text-sm text-slate-500">
              {[candidate.age != null ? `${candidate.age} ans` : null, candidate.city]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {video?.title && <p className="mt-1 text-sm text-slate-600">{video.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Note /10 *</label>
              <Input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="8.5"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Commentaire</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Appréciation, points forts…"
                className="resize-none"
              />
            </div>
          </div>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => void submit()}
            className="text-white"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
            }}
          >
            <Star className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Enregistrement…' : saved ? 'Mettre à jour l\'évaluation' : 'Enregistrer l\'évaluation'}
          </Button>
        </div>
      </div>
    </div>
  )
}
