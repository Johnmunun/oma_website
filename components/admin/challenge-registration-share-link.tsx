'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, ExternalLink, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getChallengeRegistrationUrl } from '@/lib/structures/public-url'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type StructureSegmentSource = {
  slug: string
  landingPagePath?: string | null
  subdomain?: string | null
}

interface ChallengeRegistrationShareLinkProps {
  structure?: StructureSegmentSource | null
  challengeSlug?: string
  challengeStatus?: string
  challengeName?: string
  className?: string
}

export function ChallengeRegistrationShareLink({
  structure,
  challengeSlug,
  challengeStatus,
  challengeName,
  className,
}: ChallengeRegistrationShareLinkProps) {
  const [copied, setCopied] = useState(false)

  const registrationUrl = useMemo(() => {
    if (!structure?.slug || !challengeSlug?.trim()) return null
    return getChallengeRegistrationUrl(structure, challengeSlug)
  }, [structure, challengeSlug])

  const isActive = challengeStatus === 'ACTIVE'
  const placeholder = !structure?.slug
    ? 'Sélectionnez une structure pour générer le lien…'
    : !challengeSlug?.trim()
      ? 'Définissez le slug du challenge pour obtenir le lien public…'
      : !isActive
        ? 'Publiez le challenge (statut Actif) pour activer les inscriptions publiques'
        : 'Lien d\'inscription public'

  const handleCopy = async () => {
    if (!registrationUrl || !isActive) return
    try {
      await navigator.clipboard.writeText(registrationUrl)
      setCopied(true)
      toast.success('Lien copié dans le presse-papier')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-gold/25 bg-gradient-to-br from-gold/5 via-background to-background p-4 space-y-3',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15">
          <Link2 className="h-5 w-5 text-gold-text" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Lien d&apos;inscription public</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {challengeName
              ? `Page dédiée pour « ${challengeName} » — partagez-la sur les réseaux ou par email.`
              : 'Page dédiée d\'inscription au challenge, indépendante de la landing.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          readOnly
          value={registrationUrl && isActive ? registrationUrl : ''}
          placeholder={placeholder}
          className={cn(
            'font-mono text-xs sm:text-sm bg-background/80',
            !isActive && registrationUrl && 'text-muted-foreground'
          )}
          onFocus={(e) => {
            if (registrationUrl && isActive) e.target.select()
          }}
        />
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={!registrationUrl || !isActive}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="mr-1.5 h-4 w-4" />
            )}
            {copied ? 'Copié' : 'Copier'}
          </Button>
          {registrationUrl && isActive && (
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Ouvrir
              </a>
            </Button>
          )}
        </div>
      </div>

      {!isActive && challengeSlug?.trim() && structure?.slug && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Le lien sera actif lorsque le challenge passera en statut <strong>Actif</strong>.
        </p>
      )}
    </div>
  )
}
