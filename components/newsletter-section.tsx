"use client"

import type React from "react"

import { useState } from "react"
import { Mail, MessageCircle, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewsletterFormState {
  email: string
  whatsapp: string
  loading: boolean
  success: boolean
  error: string
}

export function NewsletterSection() {
  const [formState, setFormState] = useState<NewsletterFormState>({
    email: "",
    whatsapp: "",
    loading: false,
    success: false,
    error: "",
  })

  // Valide format email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Valide format WhatsApp (format international)
  const validateWhatsApp = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, "")
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(cleaned) && cleaned.length >= 10 // Minimum 10 chiffres
  }

  // Gère la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Réinitialise les messages
    setFormState((prev) => ({ ...prev, error: "", success: false }))

    // Valide les données
    if (!formState.email.trim()) {
      setFormState((prev) => ({ ...prev, error: "Veuillez entrer votre email" }))
      return
    }

    if (!validateEmail(formState.email)) {
      setFormState((prev) => ({ ...prev, error: "Veuillez entrer un email valide" }))
      return
    }

    if (!formState.whatsapp.trim()) {
      setFormState((prev) => ({ ...prev, error: "Veuillez entrer votre numéro WhatsApp" }))
      return
    }

    if (!validateWhatsApp(formState.whatsapp)) {
      setFormState((prev) => ({
        ...prev,
        error: "Format de numéro invalide. Utilisez le format international (+1234567890)",
      }))
      return
    }

    // Envoie les données à l'API
    setFormState((prev) => ({ ...prev, loading: true }))
    try {
      // Nettoyer le numéro WhatsApp (enlever les espaces)
      const cleanWhatsapp = formState.whatsapp.trim().replace(/\s/g, "")

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formState.email.trim(),
          whatsapp: cleanWhatsapp,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Afficher les détails de validation si disponibles
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          const details = data.details
            .map((d: { field: string; message: string }) => {
              // Traduire les noms de champs en français
              const fieldName = d.field === "email" ? "Email" : d.field === "whatsapp" ? "WhatsApp" : d.field
              return `${fieldName}: ${d.message}`
            })
            .join(", ")
          throw new Error(`Données invalides: ${details}`)
        }
        
        // Message d'erreur plus clair
        const errorMessage = data.error || "Erreur lors de l'inscription. Veuillez réessayer."
        throw new Error(errorMessage)
      }

      // Succès
      setFormState((prev) => ({
        ...prev,
        success: true,
        loading: false,
        email: "",
        whatsapp: "",
      }))

      // Réinitialiser le message de succès après 5 secondes
      setTimeout(() => {
        setFormState((prev) => ({ ...prev, success: false }))
      }, 5000)
    } catch (error: any) {
      console.error("[Newsletter] Erreur:", error)
      console.error("[Newsletter] Détails erreur:", {
        message: error.message,
        stack: error.stack,
      })
      
      // Message d'erreur plus clair
      let errorMessage = "Une erreur est survenue lors de l'inscription"
      
      if (error.message) {
        errorMessage = error.message
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Problème de connexion. Vérifiez votre connexion internet."
      }
      
      setFormState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }))
    }
  }

  return (
    <section id="newsletter" className="py-20 bg-primary relative">

      <div className="container mx-auto px-4 relative z-10">
        {/* En-tête */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">Restez Informé</h2>
          <p className="text-lg text-white">
            Abonnez-vous à notre newsletter pour recevoir les derniers événements, formations et actualisations
            directement sur WhatsApp
          </p>
        </div>

        {/* Formulaire */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gold" size={20} />
              <input
                type="email"
                placeholder="Votre email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-gold/50 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all"
                disabled={formState.loading}
              />
            </div>

            {/* Champ WhatsApp */}
            <div className="relative">
              <MessageCircle className="absolute left-4 top-3.5 text-gold" size={20} />
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formState.whatsapp}
                onChange={(e) => setFormState((prev) => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-gold/50 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all"
                disabled={formState.loading}
              />
            </div>

            {/* Message d'erreur */}
            {formState.error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/30 backdrop-blur-sm border border-red-500/60 rounded-lg">
                <AlertCircle size={18} className="text-red-300 flex-shrink-0" />
                <p className="text-sm text-red-100">{formState.error}</p>
              </div>
            )}

            {/* Message de succès */}
            {formState.success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/30 backdrop-blur-sm border border-green-500/60 rounded-lg animate-in fade-in">
                <CheckCircle size={18} className="text-green-300 flex-shrink-0" />
                <p className="text-sm text-green-100">Inscription réussie! Merci de votre confiance.</p>
              </div>
            )}

            {/* Bouton d'inscription */}
            <Button
              type="submit"
              disabled={formState.loading}
              className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {formState.loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Inscription en cours...
                </span>
              ) : (
                "S'abonner"
              )}
            </Button>

            {/* Note de confidentialité */}
            <p className="text-xs text-white/70 text-center">
              Nous respectons votre vie privée. Désinscription possible à tout moment.
            </p>
          </form>

          {/* Avantages */}
          <div className="mt-8 pt-8 border-t border-gold/30">
            <p className="text-sm text-white mb-4 font-semibold">Ce que vous recevrez :</p>
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                Les nouveaux événements et formations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                Des conseils en communication et leadership
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                Les offres spéciales et réductions exclusives
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
