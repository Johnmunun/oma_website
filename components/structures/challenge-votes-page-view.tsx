'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Heart, Loader2, Trophy } from 'lucide-react'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PublicChallengePageData } from '@/lib/challenges/public-challenge-page'
import type { ChallengeVotesSettings } from '@/lib/challenges/challenge-feature-settings'
import {
  getChallengeCandidatePath,
  getChallengeHubPath,
  getChallengeRankingsPath,
} from '@/lib/structures/public-url'
import { cn } from '@/lib/utils'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'
import { toast } from 'sonner'

type VoteCandidate = {
  id: string
  number?: number
  fullName: string
  age: number | null
  city: string | null
  candidateCode?: string | null
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
  voteSubmitPath?: string
}

export function ChallengeVotesPageView({ data }: { data: PublicVotesPageData }) {
  const { structure, challenge, contactSlug, candidates, totalVotes, coverImageUrl } = data
  const hasCover = Boolean(coverImageUrl)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)
  const rankingsPath = getChallengeRankingsPath(structure, challenge.slug)
  const hubPath = getChallengeHubPath(structure, challenge.slug)
  const voteSubmitPath =
    data.voteSubmitPath ||
    `/api/structures/${contactSlug}/challenges/${challenge.slug}/votes`

  useEffect(() => {
    try {
      const preselect = new URLSearchParams(window.location.search).get('c')
      if (preselect && candidates.some((c) => c.id === preselect)) {
        setSelectedId(preselect)
      }
    } catch {
      // ignore
    }
  }, [candidates])

  const selected = candidates.find((c) => c.id === selectedId) ?? null

  const hero = (
    <div className={cn(hasCover && 'drop-shadow-lg')}>
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.22em]',
          hasCover ? 'text-white/70' : 'text-slate-500',
        )}
      >
        Vote du public · {challenge.name}
      </p>
      <h1
        className={cn(
          'mt-3 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl',
          hasCover ? 'text-white' : 'text-slate-900',
        )}
      >
        Soutenez un talent
      </h1>
      <p className={cn('mt-3 text-base', hasCover ? 'text-white/75' : 'text-slate-600')}>
        1 vote par email · {totalVotes} vote{totalVotes !== 1 ? 's' : ''} enregistré
        {totalVotes !== 1 ? 's' : ''}
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
      const res = await fetch(voteSubmitPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: selectedId, email: email.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur')
      setVoted(true)
      toast.success(json.message || 'Vote enregistré !')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer le vote")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (voted) {
    return (
      <ChallengeRegistrationShell data={data} hero={hero} backHref={hubPath} backLabel="Challenge" wide>
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white px-8 py-12 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14" style={{ color: 'var(--st-primary)' }} />
          <h2 className="mt-5 font-serif text-2xl font-bold text-slate-900">Merci pour votre vote</h2>
          <p className="mt-2 text-sm text-slate-500">
            Votre voix est enregistrée. Suivez le classement pour voir l&apos;évolution.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={rankingsPath}
              className="inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--st-primary)' }}
            >
              Voir le classement
            </Link>
            <Link href={hubPath} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              Retour au challenge
            </Link>
          </div>
        </div>
      </ChallengeRegistrationShell>
    )
  }

  return (
    <ChallengeRegistrationShell data={data} hero={hero} backHref={hubPath} backLabel="Challenge" wide>
      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Trophy className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-serif text-xl font-bold text-slate-800">
            Aucun candidat éligible
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Les votes ouvriront dès que des vidéos seront publiées.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-2">
            {candidates.map((c) => {
              const parsed = c.video?.videoUrl ? parseVideoUrl(c.video.videoUrl) : null
              const thumb = c.video?.thumbnailUrl || parsed?.thumbnailUrl
              const isSelected = selectedId === c.id
              const profilePath = c.candidateCode
                ? getChallengeCandidatePath(structure, challenge.slug, c.candidateCode)
                : null
              return (
                <div
                  key={c.id}
                  className={cn(
                    'overflow-hidden rounded-2xl bg-white transition',
                    isSelected
                      ? 'shadow-md ring-2'
                      : 'ring-1 ring-slate-200/80 hover:ring-slate-300',
                  )}
                  style={isSelected ? { ['--tw-ring-color' as string]: 'var(--st-primary)' } : undefined}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className="w-full text-left"
                  >
                    <div className="relative aspect-[16/10] bg-slate-100">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center"
                          style={{
                            background:
                              'linear-gradient(145deg, var(--st-primary), var(--st-primary-dark))',
                          }}
                        >
                          <Trophy className="h-8 w-8 text-white/70" />
                        </div>
                      )}
                      <span className="absolute left-2.5 top-2.5 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                        #{c.number ?? '—'}
                      </span>
                      {isSelected && (
                        <span
                          className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                          style={{ backgroundColor: 'var(--st-primary)' }}
                        >
                          Sélectionné
                        </span>
                      )}
                    </div>
                    <div className="px-3.5 py-3">
                      <p className="font-semibold text-slate-900">{c.fullName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {[c.candidateCode, c.city].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--st-primary-dark)' }}>
                        {c.voteCount} vote{c.voteCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                  {profilePath && (
                    <div className="border-t border-slate-100 px-3.5 py-2">
                      <Link
                        href={profilePath}
                        className="text-xs font-medium hover:underline"
                        style={{ color: 'var(--st-primary-dark)' }}
                      >
                        Voir la fiche
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <aside className="sticky top-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Confirmer le vote
            </p>
            <p className="mt-3 font-serif text-xl font-bold text-slate-900">
              {selected ? selected.fullName : 'Choisissez un candidat'}
            </p>
            {selected?.candidateCode && (
              <p className="mt-1 font-mono text-xs text-slate-500">{selected.candidateCode}</p>
            )}

            <label htmlFor="voter-email" className="mt-6 block text-sm font-medium text-slate-700">
              Votre email
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
            <p className="mt-2 text-xs text-slate-400">Un seul vote par adresse email.</p>

            <Button
              type="submit"
              disabled={isSubmitting || !selectedId}
              className="mt-6 h-12 w-full rounded-full font-semibold text-white"
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
          </aside>
        </form>
      )}
    </ChallengeRegistrationShell>
  )
}
