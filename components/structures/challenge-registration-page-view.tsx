'use client'

import { Sparkles } from 'lucide-react'
import { ChallengeRegistrationForm } from '@/components/structures/challenge-registration-form'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import type { PublicChallengeRegistrationPage } from '@/lib/challenges/load-public-challenge-registration'

interface ChallengeRegistrationPageViewProps {
  data: PublicChallengeRegistrationPage
}

export function ChallengeRegistrationPageView({ data }: ChallengeRegistrationPageViewProps) {
  const { structure, challenge, contactSlug, coverImageUrl } = data
  const hasCover = Boolean(coverImageUrl)

  const heroBadge = (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
      style={
        hasCover
          ? {
              backgroundColor: 'rgba(255,255,255,0.18)',
              color: 'white',
              backdropFilter: 'blur(8px)',
            }
          : {
              backgroundColor: 'var(--st-primary-soft)',
              color: 'var(--st-primary-dark)',
            }
      }
    >
      <Sparkles className="h-3.5 w-3.5" />
      Inscription ouverte
    </span>
  )

  const hero = hasCover ? (
    <div className="text-center md:text-left">
      {heroBadge}
      <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
        {challenge.name}
      </h1>
      {challenge.description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-md md:text-lg">
          {challenge.description}
        </p>
      )}
      <p className="mt-3 text-sm text-white/75">
        Organisé par <strong className="text-white">{structure.name}</strong>
      </p>
    </div>
  ) : (
    <div className="text-center">
      {heroBadge}
      <h1 className="mt-6 font-serif text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
        {challenge.name}
      </h1>
      {challenge.description && (
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
          {challenge.description}
        </p>
      )}
      <p className="mt-3 text-sm text-slate-500">
        Organisé par <strong className="text-slate-700">{structure.name}</strong>
      </p>
    </div>
  )

  return (
    <ChallengeRegistrationShell data={data} hero={hero}>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
        <div
          className="h-1.5 w-full"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--st-primary-dark), var(--st-primary), var(--st-primary-light))',
          }}
        />
        <div className="p-6 md:p-8">
          <ChallengeRegistrationForm
            variant="page"
            structureName={structure.name}
            contactSlug={contactSlug}
            challengeSlug={challenge.slug}
            challengeName={challenge.name}
            registrationSettings={data.registrationSettings}
            structure={structure}
          />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        En soumettant ce formulaire, vous acceptez d&apos;être contacté par {structure.name} concernant
        votre candidature.
      </p>
    </ChallengeRegistrationShell>
  )
}
