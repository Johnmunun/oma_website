"use client"

import { useState, useEffect } from "react"
import { X, Youtube, Facebook, Instagram, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export interface MediaFormData {
  url: string
  type: "IMAGE" | "VIDEO" | "FILE"
  title?: string | null
  description?: string | null
  platform?: string | null
  thumbnailUrl?: string | null
  alt?: string | null
  order?: number
  isPublished?: boolean
  eventId?: string | null
}

interface MediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: MediaFormData) => void
  initialData?: MediaFormData | null
}

/**
 * Modal pour ajouter/modifier un média (lien YouTube, Facebook, etc.)
 */
export function MediaModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: MediaModalProps) {
  const [formData, setFormData] = useState<MediaFormData>({
    url: "",
    type: "VIDEO",
    title: null,
    description: null,
    platform: null,
    thumbnailUrl: null,
    alt: null,
    order: 0,
    isPublished: true,
    eventId: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null)

  // Réinitialiser le formulaire quand le modal s'ouvre ou que initialData change
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Mode édition : pré-remplir avec les données existantes
        setFormData({
          url: initialData.url || "",
          type: initialData.type || "VIDEO",
          title: initialData.title || null,
          description: initialData.description || null,
          platform: initialData.platform || null,
          thumbnailUrl: initialData.thumbnailUrl || null,
          alt: initialData.alt || null,
          order: initialData.order || 0,
          isPublished: initialData.isPublished ?? true,
          eventId: initialData.eventId || null,
        })
        setDetectedPlatform(initialData.platform || null)
      } else {
        // Mode création : formulaire vide
        setFormData({
          url: "",
          type: "VIDEO",
          title: null,
          description: null,
          platform: null,
          thumbnailUrl: null,
          alt: null,
          order: 0,
          isPublished: true,
          eventId: null,
        })
        setDetectedPlatform(null)
      }
    }
  }, [initialData, isOpen])

  // Détecter automatiquement la plateforme à partir de l'URL
  const detectPlatform = (url: string) => {
    if (!url) {
      setDetectedPlatform(null)
      return
    }

    const urlLower = url.toLowerCase()
    if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      setDetectedPlatform("youtube")
    } else if (urlLower.includes("facebook.com")) {
      setDetectedPlatform("facebook")
    } else if (urlLower.includes("instagram.com")) {
      setDetectedPlatform("instagram")
    } else if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
      setDetectedPlatform("twitter")
    } else if (urlLower.includes("linkedin.com")) {
      setDetectedPlatform("linkedin")
    } else {
      setDetectedPlatform(null)
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, url })
    detectPlatform(url)
    // Si la plateforme n'est pas encore définie, utiliser la détection
    if (!formData.platform) {
      setFormData({ ...formData, url, platform: detectedPlatform })
    }
  }

  const getPlatformIcon = (platform: string | null) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="w-5 h-5 text-red-600" />
      case "facebook":
        return <Facebook className="w-5 h-5 text-blue-600" />
      case "instagram":
        return <Instagram className="w-5 h-5 text-pink-600" />
      default:
        return <LinkIcon className="w-5 h-5" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    toast.info("Processus en cours...", {
      duration: 2000,
    })

    try {
      // S'assurer que "none" est converti en null
      const dataToSubmit = {
        ...formData,
        platform: formData.platform === "none" ? null : formData.platform,
      }
      await onSubmit?.(dataToSubmit)
      setFormData({
        url: "",
        type: "VIDEO",
        title: null,
        description: null,
        platform: null,
        thumbnailUrl: null,
        alt: null,
        order: 0,
        isPublished: true,
        eventId: null,
      })
      setDetectedPlatform(null)
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
            {initialData ? "Modifier le média" : "Nouveau média"}
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
          {/* URL du média */}
          <div>
            <Label htmlFor="url">URL du média *</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              className="w-full mt-2"
            />
            {detectedPlatform && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                {getPlatformIcon(detectedPlatform)}
                <span>Plateforme détectée : {detectedPlatform}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Lien YouTube, Facebook, Instagram, etc.
            </p>
          </div>

          {/* Type de média */}
          <div>
            <Label htmlFor="type">Type de média *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "IMAGE" | "VIDEO" | "FILE") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Vidéo</SelectItem>
                <SelectItem value="IMAGE">Image</SelectItem>
                <SelectItem value="FILE">Fichier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plateforme */}
          <div>
            <Label htmlFor="platform">Plateforme</Label>
            <Select
              value={formData.platform || detectedPlatform || "none"}
              onValueChange={(value) =>
                setFormData({ ...formData, platform: value === "none" ? null : value })
              }
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Sélectionner une plateforme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Titre */}
          <div>
            <Label htmlFor="title">Titre (max 200 caractères)</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={(e) => {
                const value = e.target.value
                // Limiter à 200 caractères
                if (value.length <= 200) {
                  setFormData({ ...formData, title: value || null })
                }
              }}
              placeholder="Ex: Émission OMA TV - Épisode 1"
              className="w-full mt-2"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(formData.title?.length || 0)} / 200 caractères
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value || null })
              }
              placeholder="Description du média..."
              rows={3}
              className="w-full mt-2"
            />
          </div>

          {/* Miniature (pour vidéos) */}
          {formData.type === "VIDEO" && (
            <div>
              <Label htmlFor="thumbnailUrl">URL de la miniature (optionnel)</Label>
              <Input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value || null })
                }
                placeholder="https://..."
                className="w-full mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Générée automatiquement pour YouTube
              </p>
            </div>
          )}

          {/* Ordre */}
          <div>
            <Label htmlFor="order">Ordre d'affichage</Label>
            <Input
              id="order"
              name="order"
              type="number"
              min="0"
              value={formData.order || 0}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
              }
              className="w-full mt-2"
            />
          </div>

          {/* Publié */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished ?? true}
              onChange={(e) =>
                setFormData({ ...formData, isPublished: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Publié (visible sur le site)
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

