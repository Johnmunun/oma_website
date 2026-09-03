'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Heart,
  Radio,
  Trophy,
  UserPlus,
  Users,
  Video,
} from 'lucide-react'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import type { PublicChallengeHubData } from '@/lib/challenges/load-public-challenge-hub'
import {
  getChallengeCandidatePath,
  getChallengeLivePath,
  getChallengeRankingsPath,
  getChallengeRegistrationPath,
  getChallengeVotePortalPath,
  getChallengeVotesPath,
} from '@/lib/structures/public-url'
import { cn } from '@/lib/utils'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ChallengeHubPageView({ data }: { data: PublicChallengeHubData }) {
  const { structure, challenge, features, coverImageUrl, stats, spotlight, live } = data
  const hasCover = Boolean(coverImageUrl)
  const registerPath = getChallengeRegistrationPath(structure, challenge.slug)
  const livePath = getChallengeLivePath(structure, challenge.slug)
  const votesPath =
    features.votes.enabled && features.votes.published && data.voteToken
      ? getChallengeVotePortalPath(structure, data.voteToken)
      : getChallengeVotesPath(structure, challenge.slug)
  const rankingsPath = getChallengeRankingsPath(structure, challenge.slug)
  const votesOpen = features.votes.enabled && features.votes.published
  const rankingOpen = features.ranking.published
  const liveOpen = live.visibleOnHub

  const hero = (
    <div className={cn(hasCover && 'drop-shadow-lg')}>
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.22em]',
          hasCover ? 'text-white/70' : 'text-slate-500',
        )}
      >
        Challenge · {structure.name}
      </p>
      <h1
        className={cn(
          'mt-3 max-w-3xl font-serif text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]',
          hasCover ? 'text-white' : 'text-slate-900',
        )}
      >
        {challenge.name}
      </h1>
      <p
        className={cn(
          'mt-4 max-w-2xl text-base leading-relaxed md:text-lg',
          hasCover ? 'text-white/80' : 'text-slate-600',
        )}
      >
        {challenge.description?.trim() ||
          'Inscrivez-vous, découvrez les talents et suivez le classement en direct.'}
      </p>
      {(challenge.startsAt || challenge.endsAt) && (
        <p
          className={cn(
            'mt-4 inline-flex items-center gap-2 text-sm',
            hasCover ? 'text-white/65' : 'text-slate-500',
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          {[formatDate(challenge.startsAt), formatDate(challenge.endsAt)]
            .filter(Boolean)
            .join(' → ')}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {liveOpen && (
          <Link
            href={livePath}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold shadow-lg transition',
              live.isLive
                ? 'bg-red-600 text-white hover:bg-red-500'
                : hasCover
                  ? 'border border-white/35 bg-white/10 text-white hover:bg-white/20'
                  : 'border border-slate-300 bg-white text-slate-800 hover:border-slate-400',
            )}
          >
            <Radio className="h-4 w-4" />
            {live.isLive ? 'En direct' : live.replayEnabled ? 'Replay' : 'Live'}
          </Link>
        )}
        <Link
          href={registerPath}
          className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          style={{
            backgroundColor: hasCover ? 'white' : 'var(--st-primary)',
            color: hasCover ? 'var(--st-primary-dark)' : 'white',
          }}
        >
          <UserPlus className="h-4 w-4" />
          S&apos;inscrire
        </Link>
        {votesOpen && (
          <Link
            href={votesPath}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-full border px-6 text-sm font-semibold transition',
              hasCover
                ? 'border-white/35 bg-white/10 text-white hover:bg-white/20'
                : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400',
            )}
          >
            <Heart className="h-4 w-4" />
            Voter
          </Link>
        )}
        {rankingOpen && (
          <Link
            href={rankingsPath}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-full border px-6 text-sm font-semibold transition',
              hasCover
                ? 'border-white/35 bg-white/10 text-white hover:bg-white/20'
                : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400',
            )}
          >
            <Trophy className="h-4 w-4" />
            Classement
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <ChallengeRegistrationShell
      data={data}
      hero={hero}
      backHref={`/s/${data.contactSlug}`}
      backLabel="Accueil"
      wide
    >
      {/* Stats — barre horizontale, pas de cards empilées */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Users, label: 'Candidats', value: stats.approvedCount },
            { icon: Video, label: 'Vidéos', value: stats.publishedVideos },
            { icon: Heart, label: 'Votes', value: stats.totalVotes },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-6 py-5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--st-primary-soft)' }}
              >
                <item.icon className="h-5 w-5" style={{ color: 'var(--st-primary-dark)' }} />
              </div>
              <div>
                <p className="font-serif text-2xl font-bold tabular-nums text-slate-900">
                  {item.value}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {spotlight.length > 0 ? (
        <section className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900 md:text-3xl">
                Talents en lice
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Cliquez sur une fiche pour voir la vidéo et partager
              </p>
            </div>
            {votesOpen && (
              <Link
                href={votesPath}
                className="hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex"
                style={{ color: 'var(--st-primary-dark)' }}
              >
                Tous les votes <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spotlight.map((c) => {
              const parsed = c.video?.videoUrl ? parseVideoUrl(c.video.videoUrl) : null
              const thumb = c.video?.thumbnailUrl || parsed?.thumbnailUrl
              const profilePath = getChallengeCandidatePath(
                structure,
                challenge.slug,
                c.candidateCode
              )
              return (
                <Link
                  key={c.id}
                  href={profilePath}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{
                          background:
                            'linear-gradient(145deg, var(--st-primary), var(--st-primary-dark))',
                        }}
                      >
                        <Trophy className="h-10 w-10 text-white/70" />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-md bg-black/75 px-2 py-0.5 font-mono text-xs font-bold text-white">
                      #{c.number}
                    </span>
                  </div>
                  <div className="px-4 py-4">
                    <p className="font-serif text-lg font-bold text-slate-900 group-hover:underline group-hover:underline-offset-2">
                      {c.fullName}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-mono">{c.candidateCode}</span>
                      <span className="font-medium" style={{ color: 'var(--st-primary-dark)' }}>
                        {c.voteCount} vote{c.voteCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="mt-14 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
          <Trophy className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-serif text-xl font-bold text-slate-800">
            Les talents arriveront bientôt
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Dès qu&apos;un candidat est validé et sa vidéo publiée, sa fiche apparaîtra ici.
          </p>
          <Link
            href={registerPath}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'var(--st-primary-dark)' }}
          >
            S&apos;inscrire maintenant <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </ChallengeRegistrationShell>
  )
}
