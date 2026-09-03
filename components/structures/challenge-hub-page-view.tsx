'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Heart,
  Trophy,
  UserPlus,
  Users,
  Video,
} from 'lucide-react'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import { Button } from '@/components/ui/button'
import type { PublicChallengeHubData } from '@/lib/challenges/load-public-challenge-hub'
import {
  getChallengeCandidatePath,
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
  const { structure, challenge, features, coverImageUrl, stats, spotlight } = data
  const hasCover = Boolean(coverImageUrl)
  const registerPath = getChallengeRegistrationPath(structure, challenge.slug)
  const votesPath =
    features.votes.enabled && features.votes.published && data.voteToken
      ? getChallengeVotePortalPath(structure, data.voteToken)
      : getChallengeVotesPath(structure, challenge.slug)
  const rankingsPath = getChallengeRankingsPath(structure, challenge.slug)
  const votesOpen = features.votes.enabled && features.votes.published
  const rankingOpen = features.ranking.published

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
        <Trophy className="h-3.5 w-3.5" />
        Challenge
      </span>
      <h1
        className={cn(
          'mt-5 font-serif text-3xl font-bold leading-tight md:text-5xl',
          hasCover ? 'text-white' : 'text-slate-900',
        )}
      >
        {challenge.name}
      </h1>
      <p className={cn('mt-3 max-w-2xl text-base md:text-lg', hasCover ? 'text-white/85' : 'text-slate-600')}>
        {challenge.description?.trim() ||
          `Concours organisé par ${structure.name} — inscrivez-vous, votez et suivez le classement.`}
      </p>
      {(challenge.startsAt || challenge.endsAt) && (
        <p className={cn('mt-3 flex items-center justify-center gap-2 text-sm md:justify-start', hasCover ? 'text-white/75' : 'text-slate-500')}>
          <Calendar className="h-4 w-4" />
          {[formatDate(challenge.startsAt), formatDate(challenge.endsAt)].filter(Boolean).join(' → ')}
        </p>
      )}
    </div>
  )

  return (
    <ChallengeRegistrationShell data={data} hero={hero} backHref={`/s/${data.contactSlug}`}>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: 'Candidats validés', value: stats.approvedCount },
          { icon: Video, label: 'Vidéos publiées', value: stats.publishedVideos },
          { icon: Heart, label: 'Votes', value: stats.totalVotes },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <item.icon className="h-5 w-5" style={{ color: 'var(--st-primary)' }} />
            <p className="mt-3 font-serif text-2xl font-bold text-slate-900">{item.value}</p>
            <p className="text-xs text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild className="font-semibold text-white" style={{ backgroundColor: 'var(--st-primary)' }}>
          <Link href={registerPath}>
            <UserPlus className="mr-2 h-4 w-4" />
            S&apos;inscrire
          </Link>
        </Button>
        {votesOpen && (
          <Button asChild variant="outline">
            <Link href={votesPath}>
              <Heart className="mr-2 h-4 w-4" />
              Voter
            </Link>
          </Button>
        )}
        {rankingOpen && (
          <Button asChild variant="outline">
            <Link href={rankingsPath}>
              <Trophy className="mr-2 h-4 w-4" />
              Classement
            </Link>
          </Button>
        )}
      </div>

      {spotlight.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">Talents en lice</h2>
              <p className="mt-1 text-sm text-slate-500">Découvrez les candidats et partagez leur fiche</p>
            </div>
            {votesOpen && (
              <Link
                href={votesPath}
                className="hidden items-center gap-1 text-sm font-semibold sm:inline-flex"
                style={{ color: 'var(--st-primary)' }}
              >
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spotlight.map((c) => {
              const parsed = c.video?.videoUrl ? parseVideoUrl(c.video.videoUrl) : null
              const thumb = c.video?.thumbnailUrl || parsed?.thumbnailUrl
              const profilePath = getChallengeCandidatePath(structure, challenge.slug, c.candidateCode)
              return (
                <Link
                  key={c.id}
                  href={profilePath}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-video bg-slate-100">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center text-white"
                        style={{
                          backgroundImage:
                            'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
                        }}
                      >
                        <Trophy className="h-10 w-10 opacity-80" />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
                      #{c.number}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-900 group-hover:underline">{c.fullName}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{c.candidateCode}</p>
                    <p className="mt-2 text-xs" style={{ color: 'var(--st-primary)' }}>
                      {c.voteCount} vote{c.voteCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </ChallengeRegistrationShell>
  )
}
