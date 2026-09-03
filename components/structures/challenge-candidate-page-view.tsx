'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Heart, Share2, Trophy } from 'lucide-react'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import { ShareButtons } from '@/components/admin/share-buttons'
import type { PublicCandidatePageData } from '@/lib/candidates/load-public-candidate'
import {
  buildCandidateVoteShareText,
  buildCandidateVoteShareUrl,
  buildWhatsAppShareHref,
} from '@/lib/votes/build-candidate-vote-share'
import {
  getChallengeCandidateUrl,
  getChallengeHubPath,
  getChallengeVotePortalPath,
  getChallengeVotePortalUrl,
  getChallengeVotesPath,
  getChallengeVotesUrl,
} from '@/lib/structures/public-url'
import { cn } from '@/lib/utils'
import { resolveChallengeVideoPlayback } from '@/lib/videos/resolve-challenge-video-playback'
import { toast } from 'sonner'

export function ChallengeCandidatePageView({ data }: { data: PublicCandidatePageData }) {
  const { structure, challenge, candidate, features, coverImageUrl } = data
  const hasCover = Boolean(coverImageUrl)
  const [copied, setCopied] = useState(false)
  const votesOpen = features.votes.enabled && features.votes.published
  const hubPath = getChallengeHubPath(structure, challenge.slug)
  const voteBasePath =
    votesOpen && data.voteToken
      ? getChallengeVotePortalPath(structure, data.voteToken)
      : getChallengeVotesPath(structure, challenge.slug)
  const voteHref = `${voteBasePath}?c=${encodeURIComponent(candidate.id)}`

  const profileUrl = useMemo(
    () => getChallengeCandidateUrl(structure, challenge.slug, candidate.candidateCode),
    [structure, challenge.slug, candidate.candidateCode]
  )

  const voteShareUrl = useMemo(() => {
    const base =
      votesOpen && data.voteToken
        ? getChallengeVotePortalUrl(structure, data.voteToken)
        : getChallengeVotesUrl(structure, challenge.slug)
    return buildCandidateVoteShareUrl({
      voteBaseUrl: base,
      candidateId: candidate.id,
    })
  }, [
    votesOpen,
    data.voteToken,
    structure,
    challenge.slug,
    candidate.id,
  ])

  const shareText = useMemo(
    () =>
      buildCandidateVoteShareText({
        fullName: candidate.fullName,
        number: candidate.number,
        candidateCode: candidate.candidateCode,
        challengeName: challenge.name,
        voteUrl: voteShareUrl,
        profileUrl,
      }),
    [
      candidate.fullName,
      candidate.number,
      candidate.candidateCode,
      challenge.name,
      voteShareUrl,
      profileUrl,
    ]
  )

  const parsed = candidate.video
    ? resolveChallengeVideoPlayback(candidate.video)
    : null
  const embedUrl = parsed?.embedUrl
  const thumb = candidate.video?.thumbnailUrl || parsed?.thumbnailUrl
  const firstName = candidate.fullName.split(' ')[0]

  const whatsappHref = buildWhatsAppShareHref(shareText)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(votesOpen ? voteShareUrl : profileUrl)
      setCopied(true)
      toast.success(votesOpen ? 'Lien de vote copié' : 'Lien de la fiche copié')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  const hero = (
    <div className={cn(hasCover && 'drop-shadow-lg')}>
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.22em]',
          hasCover ? 'text-white/70' : 'text-slate-500',
        )}
      >
        Candidat #{candidate.number} · {challenge.name}
      </p>
      <h1
        className={cn(
          'mt-3 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl',
          hasCover ? 'text-white' : 'text-slate-900',
        )}
      >
        {candidate.fullName}
      </h1>
      <p className={cn('mt-3 text-sm', hasCover ? 'text-white/75' : 'text-slate-500')}>
        <span className="font-mono">{candidate.candidateCode}</span>
        {[candidate.age != null ? `${candidate.age} ans` : null, candidate.city]
          .filter(Boolean)
          .map((v) => (
            <span key={String(v)}>
              <span className="mx-2 opacity-40">·</span>
              {v}
            </span>
          ))}
      </p>
    </div>
  )

  return (
    <ChallengeRegistrationShell data={data} hero={hero} backHref={hubPath} backLabel="Challenge" wide>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-slate-200/60">
          {embedUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title={candidate.video?.title || candidate.fullName}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <div
              className="flex aspect-video items-center justify-center"
              style={{
                background:
                  'linear-gradient(145deg, var(--st-primary), var(--st-primary-dark))',
              }}
            >
              <Trophy className="h-14 w-14 text-white/70" />
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Soutenir
            </p>
            <p className="text-sm font-semibold tabular-nums" style={{ color: 'var(--st-primary-dark)' }}>
              {candidate.voteCount} vote{candidate.voteCount !== 1 ? 's' : ''}
            </p>
          </div>

          <p className="mt-4 font-serif text-2xl font-bold text-slate-900">{candidate.fullName}</p>
          <p className="mt-1 font-mono text-sm text-slate-500">{candidate.candidateCode}</p>

          <div className="mt-6 space-y-3">
            {votesOpen && (
              <Link
                href={voteHref}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-md transition hover:brightness-110"
                style={{ backgroundColor: 'var(--st-primary)' }}
              >
                <Heart className="h-4 w-4" />
                Voter pour {firstName}
              </Link>
            )}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" />
              Partager le vote sur WhatsApp
            </a>
            <div className="flex justify-center">
              <ShareButtons
                url={votesOpen ? voteShareUrl : profileUrl}
                title={`Soutenez ${candidate.fullName}`}
                description={shareText}
                className="w-full justify-center rounded-full"
              />
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied
                ? 'Lien copié'
                : votesOpen
                  ? 'Copier le lien de vote'
                  : 'Copier le lien'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
            Partagez le lien de vote pour maximiser les chances de {firstName}.
          </p>
        </aside>
      </div>
    </ChallengeRegistrationShell>
  )
}
