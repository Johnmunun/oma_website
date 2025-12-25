/**
 * @file components/admin/event-modal.tsx
 * @description Modal coulissante pour créer/modifier un événement
 * Slide depuis la droite avec formulaire complet
 * @todo Intégrer avec l'API backend pour créer/modifier
 */

"use client"

import type React from "react"
import React, { useState, useRef, useEffect } from "react"
import { X, Calendar, MapPin, Type, ArrowRight, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { TiptapEditor } from "@/components/admin/tiptap-editor"

interface EventFormData {
  id?: string
  title: string
  slug?: string
  description: string | null
  type: string | null
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED"
  imageUrl?: string | null
  location?: string | null
  startsAt?: string | null
  endsAt?: string | null
  metaTitle?: string | null
  metaDesc?: string | null
  showOnBanner?: boolean
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EventFormData) => void
  initialData?: EventFormData
}

export function EventModal({ isOpen, onClose, onSubmit, initialData }: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>(
    initialData || {
      title: "",
      description: null,
      type: null,
      status: "DRAFT",
      imageUrl: null,
      location: null,
      startsAt: null,
      endsAt: null,
      metaTitle: null,
      metaDesc: null,
      showOnBanner: false,
    },
  )

  // Réinitialiser le formulaire quand initialData change (pour l'édition)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData)
      } else {
        setFormData({
          title: "",
          description: null,
          type: null,
          status: "DRAFT",
          imageUrl: null,
          location: null,
          startsAt: null,
          endsAt: null,
          metaTitle: null,
          metaDesc: null,
          showOnBanner: false,
        })
      }
      setErrors({})
    }
  }, [initialData, isOpen])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Générer un slug automatique à partir du titre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis"
    }
    if (!formData.startsAt) {
      newErrors.startsAt = "La date de début est requise"
    }
    if (formData.startsAt && formData.endsAt && new Date(formData.endsAt) < new Date(formData.startsAt)) {
      newErrors.endsAt = "La date de fin doit être après la date de début"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Upload d'image via ImageKit
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10MB")
      return
    }

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "/events")

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de l'upload")
      }

      const data = await res.json()
      if (data.success && data.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.data.url }))
        toast.success("Image uploadée avec succès")
      } else {
        throw new Error(data.error || "Erreur inconnue")
      }
    } catch (err: any) {
      console.error("[EventModal] Erreur upload image:", err)
      toast.error(err.message || "Erreur lors de l'upload de l'image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Générer le slug si non fourni
      const slug = formData.slug || generateSlug(formData.title)
      
      // Préparer les données pour l'API
      const submitData = {
        ...formData,
        slug,
        startsAt: formData.startsAt || null,
        endsAt: formData.endsAt || null,
      }

      onSubmit(submitData as any)
      setFormData({
        title: "",
        description: null,
        type: null,
        status: "DRAFT",
        imageUrl: null,
        location: null,
        startsAt: null,
        endsAt: null,
        metaTitle: null,
        metaDesc: null,
      })
      onClose()
    }
  }

  const handleChange = (key: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }))
    }
    
    // Générer automatiquement le slug si le titre change
    if (key === "title" && !formData.slug) {
      const slug = generateSlug(value)
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />}

      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-full max-w-3xl bg-background shadow-2xl overflow-y-auto transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between h-16 px-6">
            <h2 className="text-xl font-bold">{initialData ? "Modifier l'événement" : "Créer un événement"}</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <label className="text-sm font-medium block mb-2">Titre de l'événement *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ex: MC Formation - 3ème Édition"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Slug (auto-généré, modifiable) */}
            <div>
              <label className="text-sm font-medium block mb-2">Slug (URL)</label>
              <Input
                value={formData.slug || generateSlug(formData.title)}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="exemple-evenement"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'URL de l'événement. Généré automatiquement à partir du titre.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium block mb-2">Description</label>
              <TiptapEditor
                content={formData.description}
                onChange={(html) => handleChange("description", html || null)}
                placeholder="Description complète de l'événement... Utilisez la barre d'outils pour formater le texte."
              />
              <p className="text-xs text-muted-foreground mt-2">
                Utilisez la barre d'outils pour formater votre texte (gras, italique, listes, titres, etc.)
              </p>
            </div>

            {/* Statut */}
            <div>
              <label className="text-sm font-medium block mb-2">Statut</label>
              <select
                value={formData.status || "DRAFT"}
                onChange={(e) => handleChange("status", e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de début *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startsAt ? new Date(formData.startsAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => handleChange("startsAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className={errors.startsAt ? "border-red-500" : ""}
                />
                {errors.startsAt && <p className="text-red-500 text-xs mt-1">{errors.startsAt}</p>}
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Date de fin</label>
                <Input
                  type="datetime-local"
                  value={formData.endsAt ? new Date(formData.endsAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => handleChange("endsAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className={errors.endsAt ? "border-red-500" : ""}
                />
                {errors.endsAt && <p className="text-red-500 text-xs mt-1">{errors.endsAt}</p>}
              </div>
            </div>

            {/* Type et Lieu */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Type
                </label>
                <Input
                  value={formData.type || ""}
                  onChange={(e) => handleChange("type", e.target.value || null)}
                  placeholder="Ex: Formation, Conférence, Atelier"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Lieu
                </label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value || null)}
                  placeholder="Ex: Dakar, Sénégal ou En ligne"
                />
              </div>
            </div>

            {/* Image de couverture */}
            <div>
              <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Image de couverture
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="event-image-upload"
                disabled={uploadingImage}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-gold transition-colors bg-muted/30"
              >
                {formData.imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <p className="text-sm text-muted-foreground">Cliquez pour changer l'image</p>
                  </div>
                ) : uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    <p className="text-sm text-muted-foreground">Upload en cours...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Cliquez pour télécharger une image</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WEBP (max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Afficher dans le banner */}
            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Afficher dans le banner de la page d'accueil
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Si activé, cet événement sera affiché dans le banner défilant après la section hero
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange("showOnBanner", !formData.showOnBanner)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    formData.showOnBanner ? "bg-gold" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      formData.showOnBanner ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* SEO (Meta Title & Description) */}
            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="text-sm font-semibold">SEO (Optionnel)</h3>
              <div>
                <label className="text-sm font-medium block mb-2">Meta Title</label>
                <Input
                  value={formData.metaTitle || ""}
                  onChange={(e) => handleChange("metaTitle", e.target.value || null)}
                  placeholder="Titre pour les moteurs de recherche"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Meta Description</label>
                <textarea
                  value={formData.metaDesc || ""}
                  onChange={(e) => handleChange("metaDesc", e.target.value || null)}
                  placeholder="Description pour les moteurs de recherche"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                />
              </div>
            </div>
          </div>


          {/* Boutons d'action - Toujours visible */}
          <div className="flex gap-3 pt-6 border-t border-border sticky bottom-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              {initialData ? "Modifier" : "Créer"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
