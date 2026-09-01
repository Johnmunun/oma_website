import type { Metadata } from "next"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { AboutPageContent } from "@/components/about-page-content"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us — Réseau OMA",
  description:
    "Découvrez le Réseau OMA : notre mission, nos valeurs et notre engagement pour l'art oratoire, la communication et le leadership à l'international.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden max-w-full w-full">
      <Navigation />

      {/* Page hero */}
      <header className="relative bg-primary text-primary-foreground pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent_55%)]" aria-hidden />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden />
        <div className="container mx-auto px-4 relative">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-6 text-primary-foreground/90 hover:text-gold hover:bg-primary-foreground/5 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          <p className="text-gold text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-4">About Us</p>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-balance leading-tight">
            À propos du{" "}
            <span className="text-gold italic">Réseau OMA</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/85 max-w-3xl leading-relaxed text-pretty">
            Une plateforme internationale dédiée à l&apos;art oratoire, la communication et le leadership —
            pour former des voix qui transforment le monde.
          </p>
        </div>
      </header>

      <AboutPageContent />
      <Footer />
    </main>
  )
}
