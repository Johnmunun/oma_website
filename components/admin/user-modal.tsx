"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export interface UserFormData {
  name: string
  email: string
  password?: string
  role: "ADMIN" | "EDITOR" | "VIEWER"
  isActive: boolean
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: UserFormData) => void
  initialData?: UserFormData | null
}

/**
 * Modal pour ajouter/modifier un utilisateur
 */
export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "", // Ne pas pré-remplir le mot de passe
        role: initialData.role || "EDITOR",
        isActive: initialData.isActive ?? true,
      })
      setShowPassword(false) // Masquer le champ mot de passe en mode édition
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EDITOR",
        isActive: true,
      })
      setShowPassword(true) // Afficher le champ mot de passe en mode création
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    toast.info("Processus en cours...", {
      duration: 2000,
    })

    try {
      // Si c'est une modification et qu'aucun mot de passe n'est fourni, ne pas l'envoyer
      const dataToSubmit = { ...formData }
      if (initialData && !dataToSubmit.password) {
        delete dataToSubmit.password
      }

      await onSubmit?.(dataToSubmit)
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EDITOR",
        isActive: true,
      })
      setShowPassword(true)
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
            {initialData ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
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

          {/* Email */}
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
          </div>

          {/* Mot de passe */}
          {(!initialData || showPassword) && (
            <div>
              <Label htmlFor="password">
                Mot de passe * {initialData && "(laisser vide pour ne pas changer)"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 caractères"
                required={!initialData}
                minLength={8}
                className="w-full mt-2"
              />
              {initialData && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(false)}
                  className="mt-2"
                >
                  Annuler le changement de mot de passe
                </Button>
              )}
            </div>
          )}

          {initialData && !showPassword && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPassword(true)}
                className="w-full"
              >
                Changer le mot de passe
              </Button>
            </div>
          )}

          {/* Rôle */}
          <div>
            <Label htmlFor="role">Rôle *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "ADMIN" | "EDITOR" | "VIEWER") =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrateur</SelectItem>
                <SelectItem value="EDITOR">Éditeur</SelectItem>
                <SelectItem value="VIEWER">Visualiseur</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.role === "ADMIN" && "Accès complet à toutes les fonctionnalités"}
              {formData.role === "EDITOR" && "Peut ajouter des événements et voir les messages"}
              {formData.role === "VIEWER" && "Peut seulement voir le dashboard et les messages"}
            </p>
          </div>

          {/* Statut actif */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Compte actif
            </Label>
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

