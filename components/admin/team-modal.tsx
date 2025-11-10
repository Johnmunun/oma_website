"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: TeamMemberFormData) => void
}

export interface TeamMemberFormData {
  name: string
  role: string
  bio: string
  email: string
  phone: string
  image?: File
}

/**
 * Modal pour ajouter/modifier un membre d'équipe
 * Coulisse depuis la droite avec overlay semi-transparent
 * @param isOpen - État d'ouverture de la modal
 * @param onClose - Fonction appelée quand on ferme la modal
 * @param onSubmit - Fonction appelée avec les données du formulaire
 * @todo Intégrer upload d'image avec Vercel Blob
 */
export function TeamModal({ isOpen, onClose, onSubmit }: TeamModalProps) {
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: "",
    role: "",
    bio: "",
    email: "",
    phone: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      // Créer une preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // @todo Appeler l'API backend pour créer/modifier le membre
      // const response = await fetch('/api/team', { method: 'POST', body: formData })
      console.log("[Admin] Données du formulaire:", formData)

      onSubmit?.(formData)

      // Réinitialiser le formulaire
      setFormData({ name: "", role: "", bio: "", email: "", phone: "" })
      setImagePreview(null)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} aria-hidden="true" />

      {/* Modal coulissante depuis la droite */}
      <div
        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-background border-l border-border shadow-xl z-50 overflow-y-auto transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* En-tête modal */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Ajouter un membre</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section Image */}
          <div>
            <label className="block text-sm font-semibold mb-3">Photo de profil</label>
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Aperçu"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer rounded-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Cliquez pour ajouter une photo</p>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold mb-2">Nom complet *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Coach Bin Adan"
              required
              className="w-full"
            />
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-semibold mb-2">Rôle *</label>
            <Input
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              placeholder="Ex: CEO International"
              required
              className="w-full"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2">Biographie *</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Décrivez les compétences et expériences..."
              required
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@oma.com"
              className="w-full"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-semibold mb-2">Téléphone</label>
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+243 123 456 789"
              className="w-full"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Ajout en cours..." : "Ajouter le membre"}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
