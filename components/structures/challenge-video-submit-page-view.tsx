'use client'

import Link from 'next/link'
import { ArrowLeft, Film } from 'lucide-react'
import { StructureLogo } from '@/components/structure-logo'
import { ChallengeVideoSubmitForm } from '@/components/structures/challenge-video-submit-form'
import { getStructureThemeVars } from '@/lib/structures/landing-theme'

export type PublicVideoSubmitPageData = {
  structure: {
    name: string
    slug: string
    logoUrl: string | null
    landingThemeColor: string | null
  }
  challenge: { name: string; slug: string; description: string | null }
  candidate: {
    fullName: string
    video: { title: string | null; status: string } | null
  }
  contactSlug: string
  token: string
}

export function ChallengeVideoSubmitPageView({ data }: { data: PublicVideoSubmitPageData }) {
  const { structure, challenge, candidate, contactSlug, token } = data
  const themeStyle = getStructureThemeVars(structure.landingThemeColor)
  const landingPath = `/s/${contactSlug}`

  return (
    <div
      className="structure-site relative min-h-screen bg-[#fafafa] text-slate-900 antialiased"
      style={themeStyle}
    >
      <header className="relative border-b border-white/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href={landingPath} className="flex min-w-0 items-center gap-3">
            <StructureLogo
              src={structure.logoUrl}
              alt={structure.name}
              size="md"
              className="h-11 w-11 shadow-md ring-2 ring-[var(--st-primary-soft)]"
            />
            <span className="truncate font-serif text-lg font-bold">{structure.name}</span>
          </Link>
          <Link
            href={landingPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[var(--st-primary-dark)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
        <div className="text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{
              backgroundImage:
                'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
            }}
          >
            <Film className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-bold md:text-4xl">Déposer votre vidéo</h1>
          <p className="mt-3 text-slate-600">{challenge.name}</p>
          <p className="mt-1 text-sm text-slate-500">
            Candidat : <strong>{candidate.fullName}</strong>
          </p>
        </div>

        <div className="mt-10">
          <ChallengeVideoSubmitForm
            contactSlug={contactSlug}
            challengeSlug={challenge.slug}
            token={token}
            candidateName={candidate.fullName}
            existingVideo={candidate.video}
          />
        </div>
      </main>
    </div>
  )
}
