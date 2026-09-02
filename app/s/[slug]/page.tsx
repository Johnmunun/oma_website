import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StructureLandingView } from '@/components/structures/structure-landing-view'
import { loadPublicStructureBySegment } from '@/lib/structures/load-public-structure'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const structure = await loadPublicStructureBySegment(slug)

  if (!structure) {
    return { title: 'Structure introuvable' }
  }

  return {
    title: `${structure.name} | Réseau OMA`,
    description:
      structure.description ??
      `${structure.name} — structure partenaire du Réseau OMA.`,
  }
}

export default async function StructureLandingPage({ params }: PageProps) {
  const { slug } = await params
  const structure = await loadPublicStructureBySegment(slug)

  if (!structure) {
    notFound()
  }

  return <StructureLandingView structure={structure} />
}
