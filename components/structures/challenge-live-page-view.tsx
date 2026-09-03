'use client'

import Link from 'next/link'
import { Calendar, Play, Radio, Trophy } from 'lucide-react'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import { ChallengeLiveChat } from '@/components/structures/challenge-live-chat'
import type { PublicChallengeLiveData } from '@/lib/challenges/load-public-challenge-live'
import {
  getChallengeHubPath,
  getChallengeRankingsPath,
  getChallengeVotesPath,
} from '@/lib/structures/public-url'
import { cn } from '@/lib/utils'

function formatSchedule(iso: string | null | undefined) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ChallengeLivePageView({ data }: { data: PublicChallengeLiveData }) {
  const { structure, challenge, live, embedUrl, replayUrl, coverImageUrl, contactSlug } = data
  const hasCover = Boolean(coverImageUrl)
  const hubPath = getChallengeHubPath(structure, challenge.slug)
  const votesPath = getChallengeVotesPath(structure, challenge.slug)
  const rankingsPath = getChallengeRankingsPath(structure, challenge.slug)
  const scheduleLabel = formatSchedule(live.scheduledAt)

  const showLivePlayer = live.isLive && Boolean(embedUrl)
  const showReplayPlayer =
    !live.isLive && live.replayEnabled && Boolean(replayUrl)
  const playerUrl = showLivePlayer ? embedUrl : showReplayPlayer ? replayUrl : null

  const title =
    live.title?.trim() ||
    (live.isLive
      ? `${challenge.name} — en direct`
      : showReplayPlayer
        ? `${challenge.name} — Replay`
        : `${challenge.name} — Live`)

  const description =
    live.description?.trim() ||
    (live.isLive
      ? 'La diffusion est en cours. Bon visionnage !'
      : showReplayPlayer
        ? 'Le live est terminé — revoyez l’enregistrement.'
        : 'La diffusion n’a pas encore commencé. Revenez à l’horaire annoncé.')

  const hero = (
    <div className={cn(hasCover && 'drop-shadow-lg')}>
      <div className="flex flex-wrap items-center gap-2">
        <p
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.22em]',
            hasCover ? 'text-white/70' : 'text-slate-500',
          )}
        >
          Live · {structure.name}
        </p>
        {live.isLive && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            En direct
          </span>
        )}
        {showReplayPlayer && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            <Play className="h-3 w-3" />
            Replay
          </span>
        )}
      </div>
      <h1
        className={cn(
          'mt-3 max-w-3xl font-serif text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl',
          hasCover ? 'text-white' : 'text-slate-900',
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          'mt-4 max-w-2xl text-base leading-relaxed md:text-lg',
          hasCover ? 'text-white/80' : 'text-slate-600',
        )}
      >
        {description}
      </p>
      {scheduleLabel && !live.isLive && !showReplayPlayer && (
        <p
          className={cn(
            'mt-4 inline-flex items-center gap-2 text-sm',
            hasCover ? 'text-white/65' : 'text-slate-500',
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          {scheduleLabel}
        </p>
      )}
    </div>
  )

  return (
    <ChallengeRegistrationShell
      data={data}
      hero={hero}
      backHref={hubPath}
      backLabel="Challenge"
      wide
    >
      <div className="overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-slate-900/10">
        {playerUrl ? (
          <div className="relative aspect-video w-full">
            <iframe
              src={playerUrl}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900 to-slate-950 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Radio className="h-7 w-7 text-white/80" />
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-white">
                {live.isLive
                  ? 'Lecteur indisponible'
                  : live.replayEnabled
                    ? 'Replay en préparation'
                    : 'En attente de diffusion'}
              </p>
              <p className="mt-2 max-w-md text-sm text-white/60">
                {live.isLive
                  ? 'La configuration Cloudflare est incomplète. Réessayez dans un instant.'
                  : live.replayEnabled
                    ? 'Ajoutez le Video ID VOD dans l’admin Live pour activer le replay.'
                    : scheduleLabel
                      ? `Prévu le ${scheduleLabel}.`
                      : 'Le live démarrera bientôt. Gardez cette page ouverte.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {live.chatEnabled ? (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex flex-wrap gap-3">
            <Link
              href={hubPath}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Hub du challenge
            </Link>
            <Link
              href={votesPath}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Voter
            </Link>
            <Link
              href={rankingsPath}
              className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ backgroundColor: 'var(--st-primary)' }}
            >
              <Trophy className="h-4 w-4" />
              Classement
            </Link>
          </div>
          <ChallengeLiveChat contactSlug={contactSlug} challengeSlug={challenge.slug} />
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={hubPath}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            Hub du challenge
          </Link>
          <Link
            href={votesPath}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            Voter
          </Link>
          <Link
            href={rankingsPath}
            className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ backgroundColor: 'var(--st-primary)' }}
          >
            <Trophy className="h-4 w-4" />
            Classement
          </Link>
        </div>
      )}
    </ChallengeRegistrationShell>
  )
}
