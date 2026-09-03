import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeHubPageView } from '@/components/structures/challenge-hub-page-view'
import { loadPublicChallengeHub } from '@/lib/challenges/load-public-challenge-hub'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeHub(slug, challengeSlug)
  if (!page) return { title: 'Challenge introuvable' }
  return {
    title: `${page.challenge.name} | ${page.structure.name}`,
    description:
      page.challenge.description?.trim() ||
      `Challenge ${page.challenge.name} organisé par ${page.structure.name}.`,
  }
}

export default async function ChallengeHubPage({ params }: PageProps) {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeHub(slug, challengeSlug)
  if (!page) notFound()
  return <ChallengeHubPageView data={page} />
}
