import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: true, follow: true },
}

/** Layout isolé — pas de navigation OMA, site partenaire autonome */
export default function StructureSitesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
