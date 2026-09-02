import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeRegistrationResultPage } from '@/components/structures/challenge-registration-result-page'
import { loadPublicChallengeRegistrationPage } from '@/lib/challenges/load-public-challenge-registration'
import type { RegistrationResultUrlParams } from '@/lib/challenges/registration-result-session'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string }>
  searchParams: Promise<RegistrationResultUrlParams>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug } = await params
  const page = await loadPublicChallengeRegistrationPage(slug, challengeSlug)

  if (!page) {
    return { title: 'Inscription introuvable' }
  }

  return {
    title: `Inscription confirmée — ${page.challenge.name} | ${page.structure.name}`,
    description: `Votre inscription au challenge ${page.challenge.name} a bien été enregistrée.`,
    robots: { index: false, follow: false },
  }
}

export default async function ChallengeRegistrationSuccessPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, challengeSlug } = await params
  const urlParams = await searchParams
  const page = await loadPublicChallengeRegistrationPage(slug, challengeSlug)

  if (!page) {
    notFound()
  }

  return (
    <ChallengeRegistrationResultPage
      data={page}
      expectedType="success"
      urlParams={urlParams}
    />
  )
}
