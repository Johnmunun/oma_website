'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, ExternalLink, Link2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { buildWhatsAppShareHref } from '@/lib/votes/build-candidate-vote-share'
import {
  getChallengeHubUrl,
  getChallengeRankingsUrl,
  getChallengeVotePortalUrl,
  getChallengeVotesUrl,
} from '@/lib/structures/public-url'

interface ChallengePublicLinkProps {
  title: string
  description: string
  url: string | null
  disabled?: boolean
  disabledHint?: string
  className?: string
  whatsappText?: string | null
}

export function ChallengePublicLink({
  title,
  description,
  url,
  disabled,
  disabledHint,
  className,
  whatsappText,
}: ChallengePublicLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!url || disabled) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien copié')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  const whatsappHref =
    url && !disabled
      ? buildWhatsAppShareHref(whatsappText?.trim() || `Votez maintenant : ${url}`)
      : null

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15">
          <Link2 className="h-4 w-4 text-gold-text" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          readOnly
          value={url && !disabled ? url : ''}
          placeholder={disabled ? disabledHint : 'Lien public…'}
          className="font-mono text-xs"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!url || disabled}
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          {whatsappHref && (
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
          )}
          {url && !disabled && (
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChallengeRankingsPublicLinks({
  structure,
  challengeSlug,
  challengeStatus,
  rankingPublished,
  votesPublished,
  votePublicToken,
}: {
  structure?: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  } | null
  challengeSlug: string
  challengeStatus: string
  rankingPublished: boolean
  votesPublished: boolean
  votePublicToken?: string | null
}) {
  const isActive = challengeStatus === 'ACTIVE'

  const { rankingsUrl, votesUrl, shortVotesUrl, hubUrl } = useMemo(() => {
    if (!structure?.slug || !challengeSlug.trim()) {
      return { rankingsUrl: null, votesUrl: null, shortVotesUrl: null, hubUrl: null }
    }
    return {
      rankingsUrl: getChallengeRankingsUrl(structure, challengeSlug),
      votesUrl: getChallengeVotesUrl(structure, challengeSlug),
      shortVotesUrl: votePublicToken
        ? getChallengeVotePortalUrl(structure, votePublicToken)
        : null,
      hubUrl: getChallengeHubUrl(structure, challengeSlug),
    }
  }, [structure, challengeSlug, votePublicToken])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChallengePublicLink
        title="Hub du challenge"
        description="Page d'accueil publique : inscription, talents, vote, classement."
        url={hubUrl}
        disabled={!isActive}
        disabledHint="Challenge non actif"
        whatsappText={
          hubUrl ? `Suivez le challenge ici : ${hubUrl}` : null
        }
      />
      <ChallengePublicLink
        title="Page classement"
        description="Classement public combinant notes du jury et votes."
        url={rankingsUrl}
        disabled={!isActive || !rankingPublished}
        disabledHint={
          !isActive
            ? 'Challenge non actif'
            : 'Publiez le classement dans les paramètres ci-dessous'
        }
        whatsappText={
          rankingsUrl ? `Classement en direct : ${rankingsUrl}` : null
        }
      />
      <ChallengePublicLink
        title="Lien court de vote"
        description="À partager sur WhatsApp / réseaux (recommandé)."
        url={shortVotesUrl}
        disabled={!isActive || !votesPublished || !shortVotesUrl}
        disabledHint={
          !isActive
            ? 'Challenge non actif'
            : !votesPublished
              ? 'Activez et publiez les votes ci-dessous'
              : 'Enregistrez les réglages pour générer le token'
        }
        whatsappText={
          shortVotesUrl
            ? `Votez pour votre talent préféré : ${shortVotesUrl}`
            : null
        }
      />
      <ChallengePublicLink
        title="Page vote (URL longue)"
        description="Alternative avec le slug du challenge."
        url={votesUrl}
        disabled={!isActive || !votesPublished}
        disabledHint={
          !isActive
            ? 'Challenge non actif'
            : 'Activez et publiez les votes ci-dessous'
        }
        whatsappText={
          votesUrl ? `Votez maintenant : ${votesUrl}` : null
        }
      />
    </div>
  )
}
