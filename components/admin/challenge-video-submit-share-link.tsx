'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getChallengeVideoSubmitPath,
  getChallengeVideoSubmitUrl,
} from '@/lib/structures/public-url'
import { toast } from 'sonner'

interface ChallengeVideoSubmitShareLinkProps {
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
  challengeSlug: string
  candidateName?: string
  token?: string | null
  className?: string
}

export function ChallengeVideoSubmitShareLink({
  structure,
  challengeSlug,
  candidateName,
  token,
  className,
}: ChallengeVideoSubmitShareLinkProps) {
  const [copied, setCopied] = useState(false)

  if (!token) {
    return (
      <div className={`rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground ${className ?? ''}`}>
        Lien de dépôt vidéo disponible après validation du candidat.
      </div>
    )
  }

  const path = getChallengeVideoSubmitPath(structure, challengeSlug, token)
  const url = getChallengeVideoSubmitUrl(structure, challengeSlug, token)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien copié')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${className ?? ''}`}>
      <div className="mb-2 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-gold-text" />
        <p className="text-sm font-semibold">
          Lien dépôt vidéo{candidateName ? ` — ${candidateName}` : ''}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={url} className="font-mono text-xs" />
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
            <Copy className="mr-1 h-3.5 w-3.5" />
            {copied ? 'Copié' : 'Copier'}
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={path} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              Ouvrir
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
