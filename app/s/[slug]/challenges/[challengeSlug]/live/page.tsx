import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeLivePageView } from '@/components/structures/challenge-live-page-view'
import { loadPublicChallengeLive } from '@/lib/challenges/load-public-challenge-live'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeLive(slug, challengeSlug)
  if (!page) return { title: 'Live indisponible' }

  const title =
    page.live.title?.trim() ||
    (page.live.isLive
      ? `${page.challenge.name} — en direct`
      : `Live — ${page.challenge.name}`)

  return {
    title: `${title} | ${page.structure.name}`,
    description:
      page.live.description?.trim() ||
      `Suivez le live du challenge ${page.challenge.name}.`,
  }
}

export default async function ChallengeLivePage({ params }: PageProps) {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeLive(slug, challengeSlug)
  if (!page) notFound()
  return <ChallengeLivePageView data={page} />
}
