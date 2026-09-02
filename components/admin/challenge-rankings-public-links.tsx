'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, ExternalLink, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  getChallengeRankingsUrl,
  getChallengeVotesUrl,
} from '@/lib/structures/public-url'

interface ChallengePublicLinkProps {
  title: string
  description: string
  url: string | null
  disabled?: boolean
  disabledHint?: string
  className?: string
}

export function ChallengePublicLink({
  title,
  description,
  url,
  disabled,
  disabledHint,
  className,
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
}) {
  const isActive = challengeStatus === 'ACTIVE'

  const { rankingsUrl, votesUrl } = useMemo(() => {
    if (!structure?.slug || !challengeSlug.trim()) {
      return { rankingsUrl: null, votesUrl: null }
    }
    return {
      rankingsUrl: getChallengeRankingsUrl(structure, challengeSlug),
      votesUrl: getChallengeVotesUrl(structure, challengeSlug),
    }
  }, [structure, challengeSlug])

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
      />
      <ChallengePublicLink
        title="Page vote public"
        description="Les visiteurs votent une fois par email."
        url={votesUrl}
        disabled={!isActive || !votesPublished}
        disabledHint={
          !isActive
            ? 'Challenge non actif'
            : 'Activez et publiez les votes ci-dessous'
        }
      />
    </div>
  )
}
