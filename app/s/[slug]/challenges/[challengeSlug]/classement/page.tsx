import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeRankingsPageView } from '@/components/structures/challenge-rankings-page-view'
import { loadPublicChallengeRankings } from '@/lib/rankings/build-challenge-rankings'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeRankings(slug, challengeSlug)

  if (!page) {
    return { title: 'Classement indisponible' }
  }

  return {
    title: `Classement — ${page.challenge.name} | ${page.structure.name}`,
    description: `Classement officiel du challenge ${page.challenge.name}.`,
  }
}

export default async function ChallengeRankingsPage({ params }: PageProps) {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeRankings(slug, challengeSlug)

  if (!page) {
    notFound()
  }

  return <ChallengeRankingsPageView data={page} />
}
