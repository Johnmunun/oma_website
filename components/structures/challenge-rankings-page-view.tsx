'use client'

import Link from 'next/link'
import { Heart, Medal, Star, Trophy } from 'lucide-react'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import type { PublicChallengePageData } from '@/lib/challenges/public-challenge-page'
import type { ChallengeRankingSettings, ChallengeVotesSettings } from '@/lib/challenges/challenge-feature-settings'
import type { RankingEntry } from '@/lib/rankings/build-challenge-rankings'
import {
  getChallengeRegistrationPath,
  getChallengeVotesPath,
} from '@/lib/structures/public-url'
import { cn } from '@/lib/utils'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'

export type PublicRankingsPageData = PublicChallengePageData & {
  features: {
    ranking: ChallengeRankingSettings
    votes: ChallengeVotesSettings
  }
  phases?: {
    enabled: boolean
    activePhase: { id: string; name: string } | null
  }
  rankings: RankingEntry[]
  totalVotes: number
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-lg font-bold text-amber-950 shadow-md">
        1
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-lg font-bold text-slate-800 shadow-md">
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-700/80 text-lg font-bold text-white shadow-md">
        3
      </span>
    )
  }
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
      {rank}
    </span>
  )
}

function CandidateThumb({ entry }: { entry: RankingEntry }) {
  const thumb = entry.video?.thumbnailUrl
  const parsed = entry.video?.videoUrl ? parseVideoUrl(entry.video.videoUrl) : null
  const src = thumb || parsed?.thumbnailUrl

  if (src) {
    return (
      <img
        src={src}
        alt={entry.fullName}
        className="h-14 w-14 rounded-xl object-cover ring-2 ring-white shadow-md"
      />
    )
  }

  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-md"
      style={{
        backgroundImage:
          'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
      }}
    >
      <Trophy className="h-6 w-6" />
    </div>
  )
}

export function ChallengeRankingsPageView({ data }: { data: PublicRankingsPageData }) {
  const { structure, challenge, contactSlug, features, rankings, totalVotes, coverImageUrl } = data
  const hasCover = Boolean(coverImageUrl)
  const showJury = features.ranking.showJuryDetails
  const votesActive = features.votes.enabled && features.votes.published
  const votesPath = getChallengeVotesPath(structure, challenge.slug)
  const registrationPath = getChallengeRegistrationPath(structure, challenge.slug)
  const phaseLabel = data.phases?.enabled ? data.phases.activePhase?.name : null

  const hero = (
    <div className={cn(hasCover && 'drop-shadow-lg')}>
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.22em]',
          hasCover ? 'text-white/70' : 'text-slate-500',
        )}
      >
        Classement officiel · {structure.name}
        {phaseLabel ? ` · ${phaseLabel}` : ''}
      </p>
      <h1
        className={cn(
          'mt-3 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl',
          hasCover ? 'text-white' : 'text-slate-900',
        )}
      >
        {challenge.name}
      </h1>
      {totalVotes > 0 && votesActive && (
        <p className={cn('mt-3 text-sm', hasCover ? 'text-white/70' : 'text-slate-500')}>
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} du public
        </p>
      )}
    </div>
  )

  return (
    <ChallengeRegistrationShell
      data={data}
      hero={hero}
      backHref={`/s/${contactSlug}`}
      backLabel="Accueil"
      wide
    >
      <div className="mb-8 flex flex-wrap gap-3">
        {votesActive && (
          <Link
            href={votesPath}
            className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
            style={{ backgroundColor: 'var(--st-primary)' }}
          >
            <Heart className="h-4 w-4" />
            Voter
          </Link>
        )}
        <Link
          href={registrationPath}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          S&apos;inscrire
        </Link>
      </div>

      {rankings.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-xl">
          <Medal className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-800">Classement en préparation</p>
          <p className="mt-2 text-sm text-slate-500">
            Les candidats apparaîtront ici une fois leurs vidéos publiées et évaluées.
          </p>
          <Link
            href={registrationPath}
            className="mt-6 inline-block text-sm font-medium hover:underline"
            style={{ color: 'var(--st-primary)' }}
          >
            Voir la page d&apos;inscription
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {totalVotes > 0 && votesActive && (
            <p className="text-center text-sm text-slate-500">
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''} du public enregistré{totalVotes !== 1 ? 's' : ''}
            </p>
          )}

          {rankings.slice(0, 3).length > 0 && (
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[1, 0, 2].map((idx) => {
                const entry = rankings[idx]
                if (!entry) return <div key={idx} />
                const isFirst = entry.rank === 1
                return (
                  <div
                    key={entry.candidateId}
                    className={cn(
                      'flex flex-col items-center rounded-2xl border bg-white p-5 text-center shadow-lg',
                      isFirst && 'order-first sm:order-none sm:-mt-2 sm:scale-105 sm:border-[var(--st-primary-light)]',
                    )}
                  >
                    <RankBadge rank={entry.rank} />
                    <div className="mt-4">
                      <CandidateThumb entry={entry} />
                    </div>
                    <p className="mt-3 font-serif text-lg font-bold text-slate-900">{entry.fullName}</p>
                    {entry.city && (
                      <p className="text-xs text-slate-500">{entry.city}</p>
                    )}
                    <p
                      className="mt-2 text-2xl font-bold tabular-nums"
                      style={{ color: 'var(--st-primary)' }}
                    >
                      {entry.combinedScore.toFixed(2)}
                    </p>
                    {showJury && entry.juryAverage != null && (
                      <p className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
                        <Star className="h-3 w-3" />
                        Jury : {entry.juryAverage.toFixed(1)}/10
                      </p>
                    )}
                    {votesActive && entry.voteCount > 0 && (
                      <p className="mt-0.5 text-xs text-slate-500">{entry.voteCount} vote(s)</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
            <div
              className="h-1.5 w-full"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
              }}
            />
            <ul className="divide-y divide-slate-100">
              {rankings.map((entry) => (
                <li
                  key={entry.candidateId}
                  className="flex items-center gap-4 px-4 py-4 md:px-6"
                >
                  <RankBadge rank={entry.rank} />
                  <CandidateThumb entry={entry} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{entry.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {[entry.age != null ? `${entry.age} ans` : null, entry.city]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xl font-bold tabular-nums"
                      style={{ color: 'var(--st-primary)' }}
                    >
                      {entry.combinedScore.toFixed(2)}
                    </p>
                    {showJury && entry.juryAverage != null && (
                      <p className="text-xs text-slate-500">
                        Jury {entry.juryAverage.toFixed(1)}/10
                      </p>
                    )}
                    {votesActive && (
                      <p className="text-xs text-slate-400">{entry.voteCount} vote(s)</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </ChallengeRegistrationShell>
  )
}
