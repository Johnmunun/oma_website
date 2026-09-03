import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChallengeCandidatePageView } from '@/components/structures/challenge-candidate-page-view'
import { loadPublicCandidatePage } from '@/lib/candidates/load-public-candidate'

type PageProps = {
  params: Promise<{ slug: string; challengeSlug: string; code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, challengeSlug, code } = await params
  const page = await loadPublicCandidatePage(slug, challengeSlug, code)
  if (!page) return { title: 'Candidat introuvable' }
  return {
    title: `${page.candidate.fullName} — ${page.challenge.name}`,
    description: `Soutenez ${page.candidate.fullName} (${page.candidate.candidateCode}) dans ${page.challenge.name}.`,
  }
}

export default async function ChallengeCandidatePage({ params }: PageProps) {
  const { slug, challengeSlug, code } = await params
  const page = await loadPublicCandidatePage(slug, challengeSlug, code)
  if (!page) notFound()
  return <ChallengeCandidatePageView data={page} />
}
