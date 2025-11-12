"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export interface TestimonialFormData {
  name: string
  email: string
  role?: string | null
}

interface TestimonialModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: TestimonialFormData) => void
  initialData?: TestimonialFormData | null
}

/**
 * Modal pour ajouter/modifier un témoignage (admin)
 * Permet de créer un témoignage et générer un token pour le formulaire public
 */
export function TestimonialModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TestimonialModalProps) {
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: "",
    email: "",
    role: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || null,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        role: null,
      })
    }
  }, [initialData, isOpen])

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
        email: "",
        role: null,
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
            {initialData ? "Modifier le témoignage" : "Nouveau témoignage"}
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
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Jean Dupont"
              required
              className="w-full mt-2"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jean.dupont@example.com"
              required
              className="w-full mt-2"
            />
            {!initialData && (
              <p className="text-xs text-muted-foreground mt-1">
                Un lien de formulaire sera généré pour cet email
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Fonction/Rôle (optionnel)</Label>
            <Input
              id="role"
              name="role"
              value={formData.role || ""}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value || null })
              }
              placeholder="Ex: Entrepreneur, Directeur Marketing"
              className="w-full mt-2"
            />
          </div>

          {!initialData && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note :</strong> Après la création, un lien de formulaire unique sera
                généré. Partagez ce lien avec le client pour qu'il puisse soumettre son
                témoignage.
              </p>
            </div>
          )}

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
                  : "Créer et générer le lien"}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

