"use client"

import { useState } from "react"
import type { Formation } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, ShoppingCart } from "lucide-react"
import Checkout from "@/components/checkout"

interface FormationCardProps {
  formation: Formation
}

export function FormationCard({ formation }: FormationCardProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const priceInDollars = (formation.priceInCents / 100).toFixed(2)

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={formation.image || "/placeholder.svg"}
          alt={formation.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <Badge className="absolute top-4 right-4 bg-gold text-primary">{formation.level}</Badge>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Clock className="h-4 w-4" />
          <span>{formation.duration}</span>
        </div>

        <h3 className="font-serif font-bold text-xl mb-3 text-foreground">{formation.name}</h3>

        <p className="text-muted-foreground mb-4 leading-relaxed text-sm">{formation.description}</p>

        <div className="mb-4 flex-grow">
          <h4 className="font-semibold text-sm mb-2 text-foreground">Ce que vous apprendrez :</h4>
          <ul className="space-y-2">
            {formation.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border pt-4 mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-gold">${priceInDollars}</div>
              <div className="text-xs text-muted-foreground">Paiement unique</div>
            </div>
          </div>

          <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gold hover:bg-gold-dark text-primary">
                <ShoppingCart className="mr-2 h-4 w-4" />
                S'inscrire maintenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Inscription - {formation.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Formation :</span>
                    <span>{formation.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Durée :</span>
                    <span>{formation.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Prix :</span>
                    <span className="text-2xl font-bold text-gold">${priceInDollars}</span>
                  </div>
                </div>
                <Checkout formationId={formation.id} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
