"use server"

import { stripe } from "@/lib/stripe"
import { FORMATIONS } from "@/lib/products"

export async function startCheckoutSession(formationId: string) {
  const formation = FORMATIONS.find((f) => f.id === formationId)

  if (!formation) {
    throw new Error(`Formation with id "${formationId}" not found`)
  }

  // Create Checkout Sessions
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: formation.name,
            description: formation.description,
          },
          unit_amount: formation.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  })

  return session.client_secret
}
