'use client'

import type React from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StructureLogo } from '@/components/structure-logo'
import type { PublicChallengePageData } from '@/lib/challenges/public-challenge-page'
import { getStructureThemeVars } from '@/lib/structures/landing-theme'
import { getChallengeRegistrationPath } from '@/lib/structures/public-url'

interface ChallengeRegistrationShellProps {
  data: PublicChallengePageData
  children: React.ReactNode
  hero?: React.ReactNode
  backHref?: string
  backLabel?: string
}

export function ChallengeRegistrationShell({
  data,
  children,
  hero,
  backHref,
  backLabel = 'Retour',
}: ChallengeRegistrationShellProps) {
  const { structure, challenge, contactSlug, coverImageUrl } = data
  const themeStyle = getStructureThemeVars(structure.landingThemeColor)
  const landingPath = `/s/${contactSlug}`
  const resolvedBackHref = backHref ?? landingPath
  const hasCover = Boolean(coverImageUrl)

  return (
    <div
      className="structure-site relative min-h-screen bg-[#fafafa] text-slate-900 antialiased"
      style={themeStyle}
    >
      {!hasCover && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(var(--st-primary-rgb), 0.18), transparent)',
          }}
        />
      )}

      <header
        className={cn(
          'relative z-30 border-b',
          hasCover
            ? 'absolute inset-x-0 top-0 border-white/15 bg-black/25 backdrop-blur-md'
            : 'border-white/60 bg-white/90 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href={landingPath} className="flex min-w-0 items-center gap-3">
            <StructureLogo
              src={structure.logoUrl}
              alt={structure.name}
              size="md"
              className={cn(
                'h-11 w-11 shadow-md ring-2',
                hasCover ? 'ring-white/30' : 'ring-[var(--st-primary-soft)]',
              )}
            />
            <span
              className={cn(
                'truncate font-serif text-lg font-bold',
                hasCover ? 'text-white drop-shadow-sm' : 'text-slate-900',
              )}
            >
              {structure.name}
            </span>
          </Link>
          <Link
            href={resolvedBackHref}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium transition',
              hasCover
                ? 'text-white/90 hover:text-white'
                : 'text-slate-600 hover:text-[var(--st-primary-dark)]',
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>
      </header>

      {hasCover ? (
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[42vh] min-h-[280px] md:h-[52vh] lg:h-[58vh]">
            <img
              src={coverImageUrl!}
              alt={challenge.name}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: 'center' }}
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/80" />

            <div className="absolute inset-0 flex items-end">
              <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-24 md:px-6 md:pb-14">
                {hero ?? (
                  <DefaultRegistrationHero
                    challengeName={challenge.name}
                    challengeDescription={challenge.description}
                    structureName={structure.name}
                    onCover
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        hero && (
          <div className="relative mx-auto max-w-4xl px-4 pt-10 md:px-6 md:pt-14">{hero}</div>
        )
      )}

      <main
        className={cn(
          'relative z-10 mx-auto max-w-4xl px-4 md:px-6',
          hasCover ? '-mt-10 pb-12 md:-mt-14 md:pb-16' : 'py-10 md:py-16',
        )}
      >
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-slate-500 md:px-6">
          <Link href={landingPath} className="hover:underline" style={{ color: 'var(--st-primary)' }}>
            Découvrir {structure.name}
          </Link>
          <span className="mx-2">·</span>
          <span>{getChallengeRegistrationPath(structure, challenge.slug)}</span>
        </div>
      </footer>
    </div>
  )
}

function DefaultRegistrationHero({
  challengeName,
  challengeDescription,
  structureName,
  onCover,
}: {
  challengeName: string
  challengeDescription: string | null
  structureName: string
  onCover?: boolean
}) {
  const textClass = onCover ? 'text-white' : 'text-slate-900'
  const mutedClass = onCover ? 'text-white/85' : 'text-slate-600'
  const subtleClass = onCover ? 'text-white/70' : 'text-slate-500'

  return (
    <div className={cn('text-center md:text-left', onCover && 'drop-shadow-lg')}>
      <div
        className={cn(
          'mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg md:mx-0',
          onCover ? 'bg-white/15 backdrop-blur-sm ring-1 ring-white/25' : '',
        )}
        style={
          onCover
            ? undefined
            : {
                backgroundImage:
                  'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
              }
        }
      >
        <Trophy className={cn('h-7 w-7', onCover ? 'text-white' : 'text-white')} />
      </div>

      <h1
        className={cn(
          'mt-6 font-serif text-3xl font-bold leading-tight md:text-4xl lg:text-5xl',
          textClass,
        )}
      >
        {challengeName}
      </h1>
      {challengeDescription && (
        <p className={cn('mt-4 max-w-2xl text-base leading-relaxed md:text-lg', mutedClass)}>
          {challengeDescription}
        </p>
      )}
      <p className={cn('mt-3 text-sm', subtleClass)}>
        Organisé par <strong className={onCover ? 'text-white' : 'text-slate-700'}>{structureName}</strong>
      </p>
    </div>
  )
}
