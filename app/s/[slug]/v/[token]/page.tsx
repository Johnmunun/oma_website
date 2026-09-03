import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeVotesPageView } from '@/components/structures/challenge-votes-page-view'
import { loadPublicVotePageByToken } from '@/lib/votes/submit-public-challenge-vote'

type PageProps = {
  params: Promise<{ slug: string; token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, token } = await params
  const page = await loadPublicVotePageByToken(slug, token)
  if (!page) return { title: 'Vote indisponible' }
  return {
    title: `Vote — ${page.challenge.name} | ${page.structure.name}`,
    description: `Votez pour votre candidat favori du challenge ${page.challenge.name}.`,
  }
}

export default async function ShortVotePortalPage({ params }: PageProps) {
  const { slug, token } = await params
  const page = await loadPublicVotePageByToken(slug, token)
  if (!page) notFound()

  return (
    <ChallengeVotesPageView
      data={{
        ...page,
        voteSubmitPath: `/api/structures/${page.contactSlug}/votes/${token}`,
      }}
    />
  )
}
