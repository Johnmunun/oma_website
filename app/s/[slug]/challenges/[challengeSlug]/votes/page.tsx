import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeVotesPageView } from '@/components/structures/challenge-votes-page-view'
import { loadPublicVotePage } from '@/lib/votes/submit-public-challenge-vote'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug } = await params
  const page = await loadPublicVotePage(slug, challengeSlug)

  if (!page) {
    return { title: 'Vote indisponible' }
  }

  return {
    title: `Vote — ${page.challenge.name} | ${page.structure.name}`,
    description: `Votez pour votre candidat favori du challenge ${page.challenge.name}.`,
  }
}

export default async function ChallengeVotesPage({ params }: PageProps) {
  const { slug, challengeSlug } = await params
  const page = await loadPublicVotePage(slug, challengeSlug)

  if (!page) {
    notFound()
  }

  return <ChallengeVotesPageView data={page} />
}
