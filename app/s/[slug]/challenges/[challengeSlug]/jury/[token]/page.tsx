import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeJuryPortalView } from '@/components/structures/challenge-jury-portal-view'
import { loadPublicJuryPortal } from '@/lib/jury/load-public-jury-portal'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string; token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug, token } = await params
  const page = await loadPublicJuryPortal(slug, challengeSlug, token)
  if (!page) return { title: 'Portail jury invalide' }
  return {
    title: `Jury — ${page.challenge.name} | ${page.structure.name}`,
    robots: { index: false, follow: false },
  }
}

export default async function ChallengeJuryPortalPage({ params }: PageProps) {
  const { slug, challengeSlug, token } = await params
  const page = await loadPublicJuryPortal(slug, challengeSlug, token)
  if (!page) notFound()

  return (
    <ChallengeJuryPortalView
      data={{
        structure: page.structure,
        challenge: page.challenge,
        member: page.member,
        candidates: page.candidates,
        evaluations: page.evaluations,
        contactSlug: page.contactSlug,
        token: page.token,
      }}
    />
  )
}
