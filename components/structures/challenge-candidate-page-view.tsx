'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Heart, Share2, Trophy } from 'lucide-react'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import { Button } from '@/components/ui/button'
import type { PublicCandidatePageData } from '@/lib/candidates/load-public-candidate'
import {
  getChallengeCandidateUrl,
  getChallengeHubPath,
  getChallengeVotePortalPath,
  getChallengeVotesPath,
} from '@/lib/structures/public-url'
import { cn } from '@/lib/utils'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'
import { toast } from 'sonner'

export function ChallengeCandidatePageView({ data }: { data: PublicCandidatePageData }) {
  const { structure, challenge, candidate, features, coverImageUrl } = data
  const hasCover = Boolean(coverImageUrl)
  const [copied, setCopied] = useState(false)
  const votesOpen = features.votes.enabled && features.votes.published
  const hubPath = getChallengeHubPath(structure, challenge.slug)
  const votesBase =
    votesOpen && data.voteToken
      ? getChallengeVotePortalPath(structure, data.voteToken)
      : getChallengeVotesPath(structure, challenge.slug)
  const voteHref = `${votesBase}?c=${encodeURIComponent(candidate.id)}`

  const profileUrl = useMemo(
    () => getChallengeCandidateUrl(structure, challenge.slug, candidate.candidateCode),
    [structure, challenge.slug, candidate.candidateCode]
  )

  const parsed = candidate.video?.videoUrl ? parseVideoUrl(candidate.video.videoUrl) : null
  const embedUrl = parsed?.embedUrl
  const thumb = candidate.video?.thumbnailUrl || parsed?.thumbnailUrl

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Soutenez ${candidate.fullName} (#${candidate.number} · ${candidate.candidateCode}) dans ${challenge.name} ! ${profileUrl}`
  )}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success('Lien de la fiche copié')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

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
        Candidat #{candidate.number}
      </span>
      <h1
        className={cn(
          'mt-5 font-serif text-3xl font-bold leading-tight md:text-4xl',
          hasCover ? 'text-white' : 'text-slate-900',
        )}
      >
        {candidate.fullName}
      </h1>
      <p className={cn('mt-2 font-mono text-sm', hasCover ? 'text-white/80' : 'text-slate-500')}>
        {candidate.candidateCode}
        {[candidate.age != null ? `${candidate.age} ans` : null, candidate.city]
          .filter(Boolean)
          .map((v) => ` · ${v}`)
          .join('')}
      </p>
    </div>
  )

  return (
    <ChallengeRegistrationShell data={data} hero={hero} backHref={hubPath} backLabel="Challenge">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
        {embedUrl ? (
          <div className="aspect-video w-full bg-black">
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
            className="flex aspect-video items-center justify-center text-white"
            style={{
              backgroundImage:
                'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
            }}
          >
            <Trophy className="h-16 w-16 opacity-80" />
          </div>
        )}

        <div className="space-y-5 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              #{candidate.number}
            </span>
            <span className="font-mono text-sm text-slate-500">{candidate.candidateCode}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--st-primary)' }}>
              {candidate.voteCount} vote{candidate.voteCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {votesOpen && (
              <Button asChild className="font-semibold text-white" style={{ backgroundColor: 'var(--st-primary)' }}>
                <Link href={voteHref}>
                  <Heart className="mr-2 h-4 w-4" />
                  Voter pour {candidate.fullName.split(' ')[0]}
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Share2 className="mr-2 h-4 w-4" />
                Partager WhatsApp
              </a>
            </Button>
            <Button type="button" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
              {copied ? 'Copié' : 'Copier le lien'}
            </Button>
          </div>
        </div>
      </div>
    </ChallengeRegistrationShell>
  )
}
