'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Heart, Loader2, Trophy } from 'lucide-react'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PublicChallengePageData } from '@/lib/challenges/public-challenge-page'
import type { ChallengeVotesSettings } from '@/lib/challenges/challenge-feature-settings'
import {
  getChallengeRankingsPath,
} from '@/lib/structures/public-url'
import { cn } from '@/lib/utils'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'
import { toast } from 'sonner'

type VoteCandidate = {
  id: string
  fullName: string
  age: number | null
  city: string | null
  video: {
    title: string | null
    thumbnailUrl: string | null
    videoUrl: string
  } | null
  voteCount: number
}

export type PublicVotesPageData = PublicChallengePageData & {
  features: { votes: ChallengeVotesSettings }
  candidates: VoteCandidate[]
  totalVotes: number
}

export function ChallengeVotesPageView({ data }: { data: PublicVotesPageData }) {
  const { structure, challenge, contactSlug, candidates, totalVotes, coverImageUrl } = data
  const hasCover = Boolean(coverImageUrl)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)
  const rankingsPath = getChallengeRankingsPath(structure, challenge.slug)

  const hero = (
    <div className={cn('text-center md:text-left', hasCover && 'drop-shadow-lg')}>
      <span
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
        style={
          hasCover
            ? { backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }
            : { backgroundColor: 'var(--st-primary-soft)', color: 'var(--st-primary-dark)' }
        }
      >
        <Heart className="h-3.5 w-3.5" />
        Vote du public
      </span>
      <h1
        className={cn(
          'mt-5 font-serif text-3xl font-bold leading-tight md:text-4xl',
          hasCover ? 'text-white' : 'text-slate-900',
        )}
      >
        Soutenez un talent
      </h1>
      <p className={cn('mt-2 text-base', hasCover ? 'text-white/85' : 'text-slate-600')}>
        {challenge.name} · {structure.name}
      </p>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) {
      toast.error('Sélectionnez un candidat')
      return
    }
    if (!email.trim()) {
      toast.error('Indiquez votre email')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(
        `/api/structures/${contactSlug}/challenges/${challenge.slug}/votes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: selectedId, email: email.trim() }),
        }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur')
      setVoted(true)
      toast.success(json.message || 'Vote enregistré !')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Impossible d\'enregistrer le vote')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (voted) {
    return (
      <ChallengeRegistrationShell data={data} hero={hero} backHref={rankingsPath} backLabel="Classement">
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-xl">
          <CheckCircle2 className="mx-auto h-16 w-16" style={{ color: 'var(--st-primary)' }} />
          <h2 className="mt-6 font-serif text-2xl font-bold text-slate-900">Merci pour votre vote !</h2>
          <p className="mt-3 text-slate-600">
            Votre voix compte. Consultez le classement pour suivre l&apos;évolution du concours.
          </p>
          <Button asChild className="mt-8" style={{ backgroundColor: 'var(--st-primary)' }}>
            <Link href={rankingsPath}>Voir le classement</Link>
          </Button>
        </div>
      </ChallengeRegistrationShell>
    )
  }

  return (
    <ChallengeRegistrationShell data={data} hero={hero} backHref={rankingsPath} backLabel="Classement">
      <div className="mb-4 text-center text-sm text-slate-500">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''} enregistré{totalVotes !== 1 ? 's' : ''} · 1 vote par email
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center shadow-xl">
          <Trophy className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-semibold text-slate-800">Aucun candidat éligible pour le moment</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {candidates.map((c) => {
              const parsed = c.video?.videoUrl ? parseVideoUrl(c.video.videoUrl) : null
              const thumb = c.video?.thumbnailUrl || parsed?.thumbnailUrl
              const selected = selectedId === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition',
                    selected
                      ? 'border-[var(--st-primary)] ring-2 ring-[var(--st-primary-soft)]'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-md',
                  )}
                >
                  {thumb ? (
                    <img src={thumb} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{
                        backgroundImage:
                          'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
                      }}
                    >
                      <Trophy className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{c.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {[c.age != null ? `${c.age} ans` : null, c.city].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-1 text-xs font-medium" style={{ color: 'var(--st-primary)' }}>
                      {c.voteCount} vote{c.voteCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-xl md:p-8">
            <label htmlFor="voter-email" className="text-sm font-medium text-slate-700">
              Votre email (pour éviter les votes multiples)
            </label>
            <Input
              id="voter-email"
              type="email"
              required
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !selectedId}
              className="mt-6 w-full font-semibold text-white sm:w-auto"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi…
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Confirmer mon vote
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </ChallengeRegistrationShell>
  )
}
