import { FORMATIONS } from "@/lib/products"
import { FormationCard } from "@/components/formation-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FormationsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="font-serif font-bold text-4xl md:text-6xl mb-6 text-balance">
            Nos Formations Professionnelles
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl text-pretty">
            Investissez dans votre développement personnel et professionnel avec nos formations certifiantes en art
            oratoire, communication et marketing digital.
          </p>
        </div>
      </div>

      {/* Formations Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FORMATIONS.map((formation) => (
            <FormationCard key={formation.id} formation={formation} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif font-bold text-3xl md:text-4xl mb-4 text-foreground">
            Besoin d'aide pour choisir ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Notre équipe est là pour vous conseiller et vous aider à trouver la formation qui correspond à vos
            objectifs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gold hover:bg-gold-dark text-primary" asChild>
              <a href="https://wa.me/243858703808">Contactez-nous sur WhatsApp</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/#contact">Envoyer un message</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
