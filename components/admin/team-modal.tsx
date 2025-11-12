"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LogoUpload } from "@/components/admin/logo-upload"
import { toast } from "sonner"

interface TeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: TeamMemberFormData) => void
  initialData?: TeamMemberFormData | null
}

export interface TeamMemberFormData {
  name: string
  role: string
  bio: string | null
  photoUrl: string | null
  xUrl?: string | null
  linkedinUrl?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  order?: number
}

/**
 * Modal pour ajouter/modifier un membre d'équipe
 * Coulisse depuis la droite avec overlay semi-transparent
 * @param isOpen - État d'ouverture de la modal
 * @param onClose - Fonction appelée quand on ferme la modal
 * @param onSubmit - Fonction appelée avec les données du formulaire
 * @param initialData - Données initiales pour l'édition
 */
export function TeamModal({ isOpen, onClose, onSubmit, initialData }: TeamModalProps) {
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: initialData?.name || "",
    role: initialData?.role || "",
    bio: initialData?.bio || null,
    photoUrl: initialData?.photoUrl || null,
    xUrl: initialData?.xUrl || null,
    linkedinUrl: initialData?.linkedinUrl || null,
    facebookUrl: initialData?.facebookUrl || null,
    instagramUrl: initialData?.instagramUrl || null,
    order: initialData?.order || 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bioLength, setBioLength] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Limiter la bio à 250 caractères
    if (name === 'bio') {
      const limitedValue = value.length > 250 ? value.substring(0, 250) : value
      setFormData((prev) => ({ ...prev, [name]: limitedValue || null }))
      setBioLength(limitedValue.length)
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || null }))
    }
  }

  // Mettre à jour bioLength quand formData.bio change
  useEffect(() => {
    setBioLength(formData.bio?.length || 0)
  }, [formData.bio])

  const handlePhotoUpload = (url: string | null) => {
    setFormData((prev) => ({ ...prev, photoUrl: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Afficher le toast "processus en cours"
    toast.info("Processus en cours...", {
      duration: 2000,
    })

    try {
      await onSubmit?.(formData)

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        role: "",
        bio: null,
        photoUrl: null,
        xUrl: null,
        linkedinUrl: null,
        facebookUrl: null,
        instagramUrl: null,
        order: 0,
      })
      setBioLength(0)
      onClose()
    } catch (error) {
      // L'erreur sera gérée par la page admin
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mettre à jour le formulaire quand initialData change
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        role: initialData.role || "",
        bio: initialData.bio || null,
        photoUrl: initialData.photoUrl || null,
        xUrl: initialData.xUrl || null,
        linkedinUrl: initialData.linkedinUrl || null,
        facebookUrl: initialData.facebookUrl || null,
        instagramUrl: initialData.instagramUrl || null,
        order: initialData.order || 0,
      })
      setBioLength(initialData.bio?.length || 0)
    }
  }, [initialData])

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
          <h2 className="text-xl font-bold">{initialData ? 'Modifier le membre' : 'Ajouter un membre'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section Image */}
          <div>
            <Label>Photo de profil</Label>
            <div className="mt-2">
              <LogoUpload
                currentLogoUrl={formData.photoUrl || ""}
                onUploadComplete={handlePhotoUpload}
                onRemove={() => handlePhotoUpload(null)}
                folder="/team"
              />
            </div>
          </div>

          {/* Nom */}
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Coach Bin Adan"
              required
              className="w-full mt-2"
            />
          </div>

          {/* Rôle */}
          <div>
            <Label htmlFor="role">Fonction au sein de l'entreprise *</Label>
            <Input
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              placeholder="Ex: CEO International, Directeur OMA TV"
              required
              className="w-full mt-2"
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">
              Détails sur la personne * (max 250 caractères)
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio ?? ""}
              onChange={handleInputChange}
              placeholder="Décrivez les compétences et expériences de la personne..."
              required
              rows={4}
              maxLength={250}
              className="w-full mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {bioLength || formData.bio?.length || 0} / 250 caractères
            </p>
          </div>

          {/* Réseaux sociaux */}
          <div className="space-y-3">
            <Label>Réseaux sociaux (optionnel)</Label>
            
            <div>
              <Label htmlFor="linkedinUrl" className="text-xs text-muted-foreground">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={formData.linkedinUrl ?? ""}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full mt-1"
              />
            </div>

            <div>
              <Label htmlFor="facebookUrl" className="text-xs text-muted-foreground">Facebook</Label>
              <Input
                id="facebookUrl"
                name="facebookUrl"
                type="url"
                value={formData.facebookUrl ?? ""}
                onChange={handleInputChange}
                placeholder="https://facebook.com/..."
                className="w-full mt-1"
              />
            </div>

            <div>
              <Label htmlFor="instagramUrl" className="text-xs text-muted-foreground">Instagram</Label>
              <Input
                id="instagramUrl"
                name="instagramUrl"
                type="url"
                value={formData.instagramUrl ?? ""}
                onChange={handleInputChange}
                placeholder="https://instagram.com/..."
                className="w-full mt-1"
              />
            </div>

            <div>
              <Label htmlFor="xUrl" className="text-xs text-muted-foreground">X (Twitter)</Label>
              <Input
                id="xUrl"
                name="xUrl"
                type="url"
                value={formData.xUrl ?? ""}
                onChange={handleInputChange}
                placeholder="https://x.com/..."
                className="w-full mt-1"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting 
                ? (initialData ? "Modification en cours..." : "Ajout en cours...") 
                : (initialData ? "Modifier le membre" : "Ajouter le membre")}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
