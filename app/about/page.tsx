import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { AboutPageHero } from "@/components/about-page-hero"
import { AboutPageContent } from "@/components/about-page-content"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "About Us — Réseau OMA",
  description:
    "Découvrez le Réseau OMA : notre mission, nos valeurs et notre engagement pour l'art oratoire, la communication et le leadership à l'international.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden max-w-full w-full">
      <Navigation />
      <AboutPageHero />
      <AboutPageContent />
      <Footer />
    </main>
  )
}
