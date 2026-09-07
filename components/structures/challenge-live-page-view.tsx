'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Heart,
  MessageSquare,
  Play,
  Radio,
  Trophy,
  X,
} from 'lucide-react'
import { StructureLogo } from '@/components/structure-logo'
import { ChallengeLiveChat } from '@/components/structures/challenge-live-chat'
import { ChallengeLiveReactions } from '@/components/structures/challenge-live-reactions'
import type { PublicChallengeLiveData } from '@/lib/challenges/load-public-challenge-live'
import { getStructureThemeVars } from '@/lib/structures/landing-theme'
import {
  getChallengeHubPath,
  getChallengeRankingsPath,
  getChallengeVotePortalPath,
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
  const { structure, challenge, live, embedUrl, replayUrl, contactSlug } = data
  const themeStyle = getStructureThemeVars(structure.landingThemeColor)
  const hubPath = getChallengeHubPath(structure, challenge.slug)
  const votesPath =
    data.votesOpen && data.voteToken
      ? getChallengeVotePortalPath(structure, data.voteToken)
      : getChallengeVotesPath(structure, challenge.slug)
  const rankingsPath = getChallengeRankingsPath(structure, challenge.slug)
  const landingPath = `/s/${contactSlug}`
  const scheduleLabel = formatSchedule(live.scheduledAt)
  const showVoteCta = Boolean(data.votesOpen)

  const showLivePlayer = live.isLive && Boolean(embedUrl)
  const showReplayPlayer = !live.isLive && live.replayEnabled && Boolean(replayUrl)
  const playerUrl = showLivePlayer ? embedUrl : showReplayPlayer ? replayUrl : null
  const chatOn = live.chatEnabled
  const [chatOpen, setChatOpen] = useState(true)

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

  return (
    <div
      className="structure-site min-h-screen bg-[#0f0f0f] text-white antialiased"
      style={themeStyle}
    >
      {/* Header type YouTube */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0f0f0f]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={hubPath}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour</span>
            </Link>
            <Link href={landingPath} className="flex min-w-0 items-center gap-2.5">
              <StructureLogo
                src={structure.logoUrl}
                alt={structure.name}
                size="sm"
                className="h-8 w-8 ring-1 ring-white/15"
              />
              <span className="truncate text-sm font-semibold tracking-tight">
                {structure.name}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {live.isLive && (
              <span className="inline-flex items-center gap-1.5 rounded bg-[#cc0000] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Live
              </span>
            )}
            {chatOn && (
              <button
                type="button"
                onClick={() => setChatOpen((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition lg:hidden',
                  chatOpen ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'
                )}
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-0 sm:px-4 lg:px-6 lg:py-4">
        <div
          className={cn(
            'lg:grid lg:items-start lg:gap-4',
            chatOn && chatOpen ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : 'lg:grid-cols-1'
          )}
        >
          {/* Colonne principale */}
          <div className="min-w-0">
            <div className="relative isolate bg-black sm:overflow-hidden sm:rounded-xl">
              {playerUrl ? (
                <div className="relative isolate aspect-video w-full">
                  <iframe
                    src={playerUrl}
                    title={title}
                    className="absolute inset-0 z-0 h-full w-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                  {showLivePlayer && live.reactionsEnabled && (
                    <ChallengeLiveReactions
                      contactSlug={contactSlug}
                      challengeSlug={challenge.slug}
                      enabled
                      variant="youtube"
                      className="z-30"
                    />
                  )}
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-[#1a1a1a] px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8">
                    <Radio className="h-7 w-7 text-white/70" />
                  </div>
                  <p className="text-lg font-semibold">
                    {live.isLive
                      ? 'Lecteur indisponible'
                      : live.replayEnabled
                        ? 'Replay en préparation'
                        : 'En attente de diffusion'}
                  </p>
                  <p className="max-w-md text-sm text-white/55">
                    {live.isLive
                      ? 'La configuration Cloudflare est incomplète. Réessayez dans un instant.'
                      : live.replayEnabled
                        ? 'Ajoutez le Video ID VOD dans l’admin Live pour activer le replay.'
                        : scheduleLabel
                          ? `Prévu le ${scheduleLabel}.`
                          : 'Le live démarrera bientôt. Gardez cette page ouverte.'}
                  </p>
                </div>
              )}
            </div>

            {/* Méta sous la vidéo — style YouTube */}
            <div className="space-y-3 px-3 pt-3 sm:px-0 sm:pt-4">
              <div className="flex flex-wrap items-center gap-2">
                {live.isLive && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-[#cc0000] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    En direct
                  </span>
                )}
                {showReplayPlayer && (
                  <span className="inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    <Play className="h-3 w-3" />
                    Replay
                  </span>
                )}
                <span className="text-xs text-white/45">{structure.name}</span>
              </div>

              <h1 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 border-b border-white/8 pb-4">
                <Link
                  href={landingPath}
                  className="flex items-center gap-2 rounded-full py-1 pr-3 transition hover:bg-white/8"
                >
                  <StructureLogo
                    src={structure.logoUrl}
                    alt={structure.name}
                    size="sm"
                    className="h-9 w-9 ring-1 ring-white/15"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{structure.name}</p>
                    <p className="truncate text-xs text-white/45">{challenge.name}</p>
                  </div>
                </Link>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {showVoteCta && (
                    <Link
                      href={votesPath}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-sm font-medium transition hover:bg-white/15"
                    >
                      <Heart className="h-4 w-4" />
                      Voter
                    </Link>
                  )}
                  <Link
                    href={rankingsPath}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-sm font-medium transition hover:bg-white/15"
                  >
                    <Trophy className="h-4 w-4" />
                    Classement
                  </Link>
                  <Link
                    href={hubPath}
                    className="inline-flex h-9 items-center rounded-full bg-white/10 px-3.5 text-sm font-medium transition hover:bg-white/15"
                  >
                    Hub
                  </Link>
                  {chatOn && (
                    <button
                      type="button"
                      onClick={() => setChatOpen((v) => !v)}
                      className="hidden h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-sm font-medium transition hover:bg-white/15 lg:inline-flex"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {chatOpen ? 'Masquer le chat' : 'Afficher le chat'}
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white/6 px-4 py-3">
                {scheduleLabel && !live.isLive && !showReplayPlayer && (
                  <p className="mb-2 inline-flex items-center gap-2 text-xs text-white/55">
                    <Calendar className="h-3.5 w-3.5" />
                    {scheduleLabel}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-white/75">{description}</p>
              </div>
            </div>

            {/* Chat mobile (sous la vidéo) */}
            {chatOn && chatOpen && (
              <div className="mt-4 border-t border-white/8 lg:hidden">
                <ChallengeLiveChat
                  contactSlug={contactSlug}
                  challengeSlug={challenge.slug}
                  variant="youtube"
                  className="h-[min(28rem,60vh)] rounded-none border-0"
                />
              </div>
            )}
          </div>

          {/* Chat desktop — panneau latéral type YouTube */}
          {chatOn && chatOpen && (
            <aside className="relative hidden lg:block">
              <div className="sticky top-[4.5rem] flex h-[calc(100vh-5.5rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#212121]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                  <p className="text-sm font-medium">Chat en direct</p>
                  <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    className="rounded-full p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white"
                    aria-label="Fermer le chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <ChallengeLiveChat
                  contactSlug={contactSlug}
                  challengeSlug={challenge.slug}
                  variant="youtube"
                  className="min-h-0 flex-1 rounded-none border-0"
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
