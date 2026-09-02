"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface StructureContactFormProps {
  structureName: string
  contactSlug: string
}

export function StructureContactForm({ structureName, contactSlug }: StructureContactFormProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    if (formData.name.trim().length < 2) {
      setSubmitStatus({ type: "error", message: "Le nom doit contenir au moins 2 caractères." })
      setIsSubmitting(false)
      return
    }

    if (formData.message.trim().length < 10) {
      setSubmitStatus({ type: "error", message: "Le message doit contenir au moins 10 caractères." })
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch(`/api/structures/${encodeURIComponent(contactSlug)}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: `Message pour ${structureName}`,
          message: formData.message.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'envoi du message")
      }

      setSubmitStatus({
        type: "success",
        message: data.message || "Votre message a été envoyé avec succès !",
      })
      setFormData({ name: "", email: "", message: "" })
      setTimeout(() => setSubmitStatus(null), 5000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer."
      setSubmitStatus({ type: "error", message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-lg text-left">
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
        <div>
          <label htmlFor="structure-contact-name" className="mb-1.5 block text-sm font-medium text-slate-200">
            Nom
          </label>
          <Input
            id="structure-contact-name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Votre nom"
            required
            className="border-white/20 bg-white/10 text-white placeholder:text-slate-400"
          />
        </div>
        <div>
          <label htmlFor="structure-contact-email" className="mb-1.5 block text-sm font-medium text-slate-200">
            Email
          </label>
          <Input
            id="structure-contact-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="votre@email.com"
            required
            className="border-white/20 bg-white/10 text-white placeholder:text-slate-400"
          />
        </div>
        <div>
          <label htmlFor="structure-contact-message" className="mb-1.5 block text-sm font-medium text-slate-200">
            Message
          </label>
          <Textarea
            id="structure-contact-message"
            value={formData.message}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Votre message..."
            rows={4}
            required
            className="border-white/20 bg-white/10 text-white placeholder:text-slate-400"
          />
        </div>

        {submitStatus && (
          <p
            className={`rounded-lg px-4 py-3 text-sm ${
              submitStatus.type === "success"
                ? "bg-emerald-500/20 text-emerald-100"
                : "bg-red-500/20 text-red-100"
            }`}
          >
            {submitStatus.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 rounded-full font-semibold text-white"
          style={{ backgroundColor: "var(--st-primary)" }}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
        </Button>
      </div>
    </form>
  )
}
