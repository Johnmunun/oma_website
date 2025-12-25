import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { FORMATIONS } from "@/lib/products"

export function FormationsSection() {
  const featuredFormations = FORMATIONS.slice(0, 3)

  return (
    <section id="formations" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
            Nos formations numériques
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Des programmes complets pour développer vos compétences à votre rythme
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {featuredFormations.map((formation) => {
            const priceInDollars = (formation.priceInCents / 100).toFixed(2)
            return (
              <div
                key={formation.id}
                className="bg-card rounded-lg overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={formation.image || "/placeholder.svg"}
                    alt={formation.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-gold text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {formation.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif font-bold text-xl mb-3 text-foreground">{formation.name}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{formation.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gold">${priceInDollars}</span>
                    <Button className="bg-gold hover:bg-gold-dark text-primary" asChild>
                      <a href="/formations">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        S'inscrire
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-gold hover:bg-gold-dark text-primary text-lg px-8 py-6" asChild>
            <a href="/formations">
              Voir plus de formations
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
