// ============================================
// COMPOSANT: FORMULAIRE D'INSCRIPTION AUX FORMATIONS
// ============================================
// Formulaire pour que les utilisateurs s'inscrivent à une formation
// Remplace Google Forms avec une meilleure UX

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle } from "lucide-react"

interface RegistrationFormProps {
  formationId: string
  formationTitle: string
  onClose?: () => void
}

export function RegistrationForm({ formationId, formationTitle, onClose }: RegistrationFormProps) {
  // État du formulaire
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Gestionnaire de changement des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Gestionnaire de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation simple
      if (!formData.first_name.trim()) throw new Error("Veuillez entrer votre prénom")
      if (!formData.last_name.trim()) throw new Error("Veuillez entrer votre nom")
      if (!formData.email.includes("@")) throw new Error("Email invalide")
      if (!formData.phone.trim()) throw new Error("Veuillez entrer votre téléphone")
      if (!formData.country) throw new Error("Veuillez sélectionner un pays")

      // TODO: Appeler l'API pour créer l'inscription
      // const response = await registrationsApi.create({
      //   formation_id: formationId,
      //   ...formData,
      // })

      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  // État de succès
  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle size={48} className="mx-auto text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900">Inscription confirmée!</h3>
        <p className="text-gray-600">
          Merci de votre intérêt pour la formation <strong>{formationTitle}</strong>. Un email de confirmation a été
          envoyé à <strong>{formData.email}</strong>.
        </p>
        <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
          Fermer
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">S'inscrire à la formation</h2>
        <p className="text-gray-600 mt-1">{formationTitle}</p>
      </div>

      {/* Afficher les erreurs */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Prénom et Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
          <Input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Jean"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
          <Input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Dupont"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jean@example.com"
          required
        />
      </div>

      {/* Téléphone et Pays */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+33 6 12 34 56 78"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pays *</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un pays</option>
            <option value="france">France</option>
            <option value="benin">Bénin</option>
            <option value="cameroun">Cameroun</option>
            <option value="congo">Congo</option>
            <option value="ivory-coast">Côte d'Ivoire</option>
            <option value="senegal">Sénégal</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>

      {/* Message optionnel */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Message (Optionnel)</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Avez-vous des questions ou remarques?"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? "Inscription en cours..." : "Confirmer mon inscription"}
        </Button>
        {onClose && (
          <Button type="button" onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900">
            Annuler
          </Button>
        )}
      </div>

      {/* Note importante */}
      <p className="text-xs text-gray-500 text-center">
        En cliquant sur "Confirmer", vous acceptez notre politique de confidentialité.
      </p>
    </form>
  )
}
