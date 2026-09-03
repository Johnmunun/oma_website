'use client'

import type React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StructureLogo } from '@/components/structure-logo'
import type { PublicChallengePageData } from '@/lib/challenges/public-challenge-page'
import { getStructureThemeVars } from '@/lib/structures/landing-theme'
import { getChallengeHubPath } from '@/lib/structures/public-url'

interface ChallengeRegistrationShellProps {
  data: PublicChallengePageData
  children: React.ReactNode
  hero?: React.ReactNode
  backHref?: string
  backLabel?: string
  /** Contenu plus large (hub, votes) */
  wide?: boolean
}

export function ChallengeRegistrationShell({
  data,
  children,
  hero,
  backHref,
  backLabel = 'Retour',
  wide = false,
}: ChallengeRegistrationShellProps) {
  const { structure, challenge, contactSlug, coverImageUrl } = data
  const themeStyle = getStructureThemeVars(structure.landingThemeColor)
  const landingPath = `/s/${contactSlug}`
  const hubPath = getChallengeHubPath(structure, challenge.slug)
  const resolvedBackHref = backHref ?? landingPath
  const hasCover = Boolean(coverImageUrl)
  const maxW = wide ? 'max-w-5xl' : 'max-w-3xl'

  return (
    <div
      className="structure-site relative min-h-screen bg-[#f7f7f5] text-slate-900 antialiased"
      style={themeStyle}
    >
      {!hasCover && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(var(--st-primary-rgb), 0.14), transparent)',
          }}
        />
      )}

      <header
        className={cn(
          'relative z-30',
          hasCover
            ? 'absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent'
            : 'border-b border-slate-200/80 bg-white/80 backdrop-blur-md',
        )}
      >
        <div className={cn('mx-auto flex items-center justify-between gap-4 px-4 py-3.5 md:px-6', maxW === 'max-w-5xl' ? 'max-w-5xl' : 'max-w-3xl')}>
          <Link href={landingPath} className="flex min-w-0 items-center gap-3">
            <StructureLogo
              src={structure.logoUrl}
              alt={structure.name}
              size="md"
              className={cn(
                'h-10 w-10 shadow-sm ring-1',
                hasCover ? 'ring-white/25' : 'ring-slate-200',
              )}
            />
            <div className="min-w-0">
              <p
                className={cn(
                  'truncate font-serif text-base font-bold leading-tight md:text-lg',
                  hasCover ? 'text-white' : 'text-slate-900',
                )}
              >
                {structure.name}
              </p>
              <p
                className={cn(
                  'truncate text-[11px] md:text-xs',
                  hasCover ? 'text-white/65' : 'text-slate-500',
                )}
              >
                {challenge.name}
              </p>
            </div>
          </Link>
          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href={hubPath}
              className={cn(
                'hidden rounded-lg px-3 py-1.5 text-sm font-medium transition sm:inline-flex',
                hasCover
                  ? 'text-white/85 hover:bg-white/10 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              Challenge
            </Link>
            <Link
              href={resolvedBackHref}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                hasCover
                  ? 'text-white/90 hover:bg-white/10'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          </nav>
        </div>
      </header>

      {hasCover ? (
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[38vh] min-h-[240px] md:h-[46vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl!}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-black/50 to-black/30" />
            <div className="absolute inset-0 flex items-end">
              <div className={cn('mx-auto w-full px-4 pb-12 pt-24 md:px-6 md:pb-16', maxW)}>
                {hero}
              </div>
            </div>
          </div>
        </div>
      ) : (
        hero && (
          <div className={cn('relative mx-auto px-4 pt-12 md:px-6 md:pt-16', maxW)}>
            {hero}
          </div>
        )
      )}

      <main
        className={cn(
          'relative z-10 mx-auto px-4 md:px-6',
          maxW,
          hasCover ? '-mt-6 pb-16 md:-mt-8 md:pb-20' : 'pb-16 pt-8 md:pb-20 md:pt-10',
        )}
      >
        {children}
      </main>

      <footer className="border-t border-slate-200/80 bg-white">
        <div
          className={cn(
            'mx-auto flex flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:text-left md:px-6',
            maxW,
          )}
        >
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">{challenge.name}</span>
            <span className="mx-2 text-slate-300">·</span>
            {structure.name}
          </p>
          <Link
            href={landingPath}
            className="text-sm font-medium transition hover:opacity-80"
            style={{ color: 'var(--st-primary-dark)' }}
          >
            Accueil {structure.name}
          </Link>
        </div>
      </footer>
    </div>
  )
}
