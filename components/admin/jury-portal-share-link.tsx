'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Gavel, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getChallengeJuryPortalPath,
  getChallengeJuryPortalUrl,
} from '@/lib/structures/public-url'
import { toast } from 'sonner'

interface JuryPortalShareLinkProps {
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
  challengeSlug: string
  challengeId: string
  memberId: string
  memberName?: string
  token: string
  onTokenRegenerated?: () => void
  canRegenerate?: boolean
  className?: string
}

export function JuryPortalShareLink({
  structure,
  challengeSlug,
  challengeId,
  memberId,
  memberName,
  token,
  onTokenRegenerated,
  canRegenerate = false,
  className,
}: JuryPortalShareLinkProps) {
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const path = getChallengeJuryPortalPath(structure, challengeSlug, token)
  const url = getChallengeJuryPortalUrl(structure, challengeSlug, token)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien jury copié')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  const regenerate = async () => {
    if (!canRegenerate) return
    setIsRegenerating(true)
    try {
      const res = await fetch(
        `/api/admin/challenges/${challengeId}/jury/${memberId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'regenerate_token' }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Nouveau lien généré')
      onTokenRegenerated?.()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${className ?? ''}`}>
      <div className="mb-2 flex items-center gap-2">
        <Gavel className="h-4 w-4 text-gold-text" />
        <p className="text-sm font-semibold">
          Portail d&apos;évaluation{memberName ? ` — ${memberName}` : ''}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={url} className="font-mono text-xs" />
        <div className="flex shrink-0 flex-wrap gap-2">
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
          {canRegenerate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRegenerating}
              onClick={() => void regenerate()}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Régénérer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
