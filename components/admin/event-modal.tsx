"use client"

import React, { useState, useRef, useEffect } from "react"
import { X, Calendar, MapPin, Type, ArrowRight, Upload, Loader2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  structureId?: string | null
}

interface StructureOption {
  id: string
  name: string
  slug: string
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EventFormData) => void
  initialData?: EventFormData
}

const EMPTY_FORM: EventFormData = {
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
  structureId: null,
}

export function EventModal({ isOpen, onClose, onSubmit, initialData }: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>(EMPTY_FORM)
  const [structures, setStructures] = useState<StructureOption[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    fetch("/api/admin/structures")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setStructures(
            res.data.map((s: { id: string; name: string; slug: string }) => ({
              id: s.id,
              name: s.name,
              slug: s.slug,
            }))
          )
        }
      })
      .catch(() => {})
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...EMPTY_FORM,
          ...initialData,
          structureId: initialData.structureId ?? null,
        })
      } else {
        setFormData({ ...EMPTY_FORM })
      }
      setErrors({})
    }
  }, [initialData, isOpen])

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
      const body = new FormData()
      body.append("file", file)
      body.append("folder", "/events")

      const res = await fetch("/api/uploads", {
        method: "POST",
        body,
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
      const slug = formData.slug || generateSlug(formData.title)
      onSubmit({
        ...formData,
        slug,
        structureId: formData.structureId || null,
        startsAt: formData.startsAt || null,
        endsAt: formData.endsAt || null,
      })
      setFormData({ ...EMPTY_FORM })
      onClose()
    }
  }

  const handleChange = (key: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }))
    }

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
        <div className="sticky top-0 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between h-16 px-6">
            <h2 className="text-xl font-bold">{initialData ? "Modifier l'événement" : "Créer un événement"}</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Structure
              </label>
              <Select
                value={formData.structureId || "__none__"}
                onValueChange={(v) => handleChange("structureId", v === "__none__" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune (Réseau OMA)</SelectItem>
                  {structures.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Affecte l&apos;événement à une structure partenaire (JoyStudio, etc.).
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Titre de l&apos;événement *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ex: MC Formation - 3ème Édition"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Slug (URL)</label>
              <Input
                value={formData.slug || generateSlug(formData.title)}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="exemple-evenement"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Description</label>
              <TiptapEditor
                content={formData.description}
                onChange={(html) => handleChange("description", html || null)}
                placeholder="Description complète de l'événement..."
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de début *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startsAt ? new Date(formData.startsAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) =>
                    handleChange("startsAt", e.target.value ? new Date(e.target.value).toISOString() : null)
                  }
                  className={errors.startsAt ? "border-red-500" : ""}
                />
                {errors.startsAt && <p className="text-red-500 text-xs mt-1">{errors.startsAt}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de fin
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endsAt ? new Date(formData.endsAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) =>
                    handleChange("endsAt", e.target.value ? new Date(e.target.value).toISOString() : null)
                  }
                  className={errors.endsAt ? "border-red-500" : ""}
                />
                {errors.endsAt && <p className="text-red-500 text-xs mt-1">{errors.endsAt}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lieu
              </label>
              <Input
                value={formData.location || ""}
                onChange={(e) => handleChange("location", e.target.value || null)}
                placeholder="Ex: Kinshasa / Online"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Type
              </label>
              <Input
                value={formData.type || ""}
                onChange={(e) => handleChange("type", e.target.value || null)}
                placeholder="Formation, Conférence, Atelier…"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Image de couverture</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingImage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {formData.imageUrl ? "Changer l'image" : "Uploader une image"}
                </Button>
                {formData.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.imageUrl}
                    alt=""
                    className="h-16 w-24 rounded border object-cover"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="showOnBanner"
                type="checkbox"
                checked={Boolean(formData.showOnBanner)}
                onChange={(e) => handleChange("showOnBanner", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="showOnBanner" className="text-sm">
                Afficher dans le bandeau d&apos;accueil
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium block mb-2">Meta title SEO</label>
                <Input
                  value={formData.metaTitle || ""}
                  onChange={(e) => handleChange("metaTitle", e.target.value || null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Meta description SEO</label>
                <Input
                  value={formData.metaDesc || ""}
                  onChange={(e) => handleChange("metaDesc", e.target.value || null)}
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t bg-background px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gold text-primary hover:bg-gold-dark">
              {initialData ? "Enregistrer" : "Créer"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
