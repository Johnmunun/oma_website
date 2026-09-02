import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeVideoSubmitPageView } from '@/components/structures/challenge-video-submit-page-view'
import { loadPublicVideoSubmitPage } from '@/lib/videos/submit-public-challenge-video'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string; token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug, token } = await params
  const page = await loadPublicVideoSubmitPage(slug, challengeSlug, token)
  if (!page) return { title: 'Lien vidéo invalide' }
  return {
    title: `Déposer une vidéo — ${page.challenge.name} | ${page.structure.name}`,
    robots: { index: false, follow: false },
  }
}

export default async function ChallengeVideoSubmitPage({ params }: PageProps) {
  const { slug, challengeSlug, token } = await params
  const page = await loadPublicVideoSubmitPage(slug, challengeSlug, token)
  if (!page) notFound()

  return (
    <ChallengeVideoSubmitPageView
      data={{
        structure: page.structure,
        challenge: page.challenge,
        candidate: page.candidate,
        contactSlug: page.contactSlug,
        token: page.token,
      }}
    />
  )
}
