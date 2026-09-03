'use client'

import { ChallengeRegistrationForm } from '@/components/structures/challenge-registration-form'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import type { PublicChallengeRegistrationPage } from '@/lib/challenges/load-public-challenge-registration'

interface ChallengeRegistrationPageViewProps {
  data: PublicChallengeRegistrationPage
}

export function ChallengeRegistrationPageView({ data }: ChallengeRegistrationPageViewProps) {
  const { structure, challenge, contactSlug, coverImageUrl } = data
  const hasCover = Boolean(coverImageUrl)

  const hero = hasCover ? (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
        Inscription · {structure.name}
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
        {challenge.name}
      </h1>
      {challenge.description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
          {challenge.description}
        </p>
      )}
    </div>
  ) : (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Inscription · {structure.name}
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
        {challenge.name}
      </h1>
      {challenge.description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
          {challenge.description}
        </p>
      )}
    </div>
  )

  return (
    <ChallengeRegistrationShell data={data} hero={hero}>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
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
