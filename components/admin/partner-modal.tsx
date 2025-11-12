"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogoUpload } from "@/components/admin/logo-upload"
import { toast } from "sonner"

interface PartnerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: PartnerFormData) => void
  initialData?: PartnerFormData | null
}

export interface PartnerFormData {
  name: string
  logoUrl: string | null
  url: string | null
  order: number
}

/**
 * Modal pour ajouter/modifier un partenaire
 */
export function PartnerModal({ isOpen, onClose, onSubmit, initialData }: PartnerModalProps) {
  const [formData, setFormData] = useState<PartnerFormData>({
    name: initialData?.name || "",
    logoUrl: initialData?.logoUrl || null,
    url: initialData?.url || null,
    order: initialData?.order || 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        logoUrl: initialData.logoUrl || null,
        url: initialData.url || null,
        order: initialData.order || 0,
      })
    } else {
      setFormData({
        name: "",
        logoUrl: null,
        url: null,
        order: 0,
      })
    }
  }, [initialData, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value || null,
    }))
  }

  const handleLogoUpload = (url: string | null) => {
    setFormData((prev) => ({ ...prev, logoUrl: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    toast.info("Processus en cours...", {
      duration: 2000,
    })

    try {
      await onSubmit?.(formData)
      setFormData({
        name: "",
        logoUrl: null,
        url: null,
        order: 0,
      })
      onClose()
    } catch (error) {
      // L'erreur sera gérée par la page admin
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal coulissante depuis la droite */}
      <div
        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-background border-l border-border shadow-xl z-50 overflow-y-auto transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* En-tête modal */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {initialData ? "Modifier le partenaire" : "Nouveau partenaire"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <Label htmlFor="name">Nom du partenaire *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Entreprise XYZ"
              required
              className="w-full mt-2"
            />
          </div>

          {/* Logo */}
          <div>
            <Label>Logo du partenaire</Label>
            <LogoUpload
              folder="/partners"
              currentImageUrl={formData.logoUrl || undefined}
              onUploadComplete={handleLogoUpload}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Téléchargez le logo du partenaire (format recommandé: PNG, SVG)
            </p>
          </div>

          {/* URL */}
          <div>
            <Label htmlFor="url">Site web</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url || ""}
              onChange={handleInputChange}
              placeholder="https://www.example.com"
              className="w-full mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL du site web du partenaire (optionnel)
            </p>
          </div>

          {/* Ordre */}
          <div>
            <Label htmlFor="order">Ordre d'affichage</Label>
            <Input
              id="order"
              name="order"
              type="number"
              min="0"
              value={formData.order}
              onChange={handleInputChange}
              className="w-full mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Plus le nombre est petit, plus le partenaire apparaîtra en premier
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? initialData
                  ? "Modification en cours..."
                  : "Création en cours..."
                : initialData
                  ? "Modifier"
                  : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}








