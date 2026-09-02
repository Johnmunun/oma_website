import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeRegistrationPageView } from '@/components/structures/challenge-registration-page-view'
import { loadPublicChallengeRegistrationPage } from '@/lib/challenges/load-public-challenge-registration'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeRegistrationPage(slug, challengeSlug)

  if (!page) {
    return { title: 'Inscription introuvable' }
  }

  return {
    title: `Inscription — ${page.challenge.name} | ${page.structure.name}`,
    description:
      page.challenge.description ??
      `Inscrivez-vous au challenge ${page.challenge.name} avec ${page.structure.name}.`,
  }
}

export default async function ChallengeRegistrationPage({ params }: PageProps) {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeRegistrationPage(slug, challengeSlug)

  if (!page) {
    notFound()
  }

  return <ChallengeRegistrationPageView data={page} />
}
