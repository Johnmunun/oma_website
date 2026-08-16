"use client"

import { useState, useEffect, useRef } from "react"
import { X, Youtube, Facebook, Instagram, Link as LinkIcon, Loader2 } from "lucide-react"
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
import { detectPlatformFromUrl, getSyncThumbnail } from "@/lib/media-thumbnails"

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
  onSubmit?: (data: MediaFormData) => Promise<void> | void
  initialData?: MediaFormData | null
  mode?: "create" | "edit"
}

const EMPTY_FORM: MediaFormData = {
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
}

/**
 * Modal pour ajouter/modifier un média (lien YouTube, TikTok, Instagram, etc.)
 */
export function MediaModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: MediaModalProps) {
  const [formData, setFormData] = useState<MediaFormData>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null)
  const [isResolvingThumb, setIsResolvingThumb] = useState(false)
  const previewTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isEdit = mode === "edit" || Boolean(initialData?.url)

  // Préremplir / reset à chaque ouverture
  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      const platform = initialData.platform || detectPlatformFromUrl(initialData.url || "")
      setFormData({
        url: initialData.url || "",
        type: initialData.type || "VIDEO",
        title: initialData.title || null,
        description: initialData.description || null,
        platform: platform || null,
        thumbnailUrl: initialData.thumbnailUrl || getSyncThumbnail(initialData.url || "") || null,
        alt: initialData.alt || null,
        order: initialData.order ?? 0,
        isPublished: initialData.isPublished ?? true,
        eventId: initialData.eventId || null,
      })
      setDetectedPlatform(platform)
    } else {
      setFormData(EMPTY_FORM)
      setDetectedPlatform(null)
    }
    setIsResolvingThumb(false)
  }, [initialData, isOpen])

  useEffect(() => {
    return () => {
      if (previewTimeout.current) clearTimeout(previewTimeout.current)
    }
  }, [])

  const resolvePreview = async (url: string, keepPlatform?: string | null) => {
    const platform = detectPlatformFromUrl(url)
    const syncThumb = getSyncThumbnail(url)

    setDetectedPlatform(platform)
    setFormData((prev) => ({
      ...prev,
      url,
      platform: keepPlatform || platform || prev.platform,
      thumbnailUrl: syncThumb || prev.thumbnailUrl,
      type: platform === "youtube" || platform === "tiktok" || platform === "instagram" || platform === "facebook"
        ? "VIDEO"
        : prev.type,
    }))

    // Enrichissement réseau (TikTok oEmbed, Microlink, etc.)
    if (!url || url.length < 12) return
    setIsResolvingThumb(true)
    try {
      const res = await fetch(`/api/admin/media/preview?url=${encodeURIComponent(url)}`, {
        cache: "no-store",
        credentials: "include",
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.success && data.data) {
        setDetectedPlatform(data.data.platform || platform)
        setFormData((prev) => ({
          ...prev,
          platform: keepPlatform || data.data.platform || prev.platform,
          thumbnailUrl: data.data.thumbnailUrl || prev.thumbnailUrl || syncThumb,
          title: prev.title || data.data.title || null,
        }))
      }
    } catch (err) {
      console.warn("[MediaModal] Preview échoué:", err)
    } finally {
      setIsResolvingThumb(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, url }))
    if (previewTimeout.current) clearTimeout(previewTimeout.current)
    previewTimeout.current = setTimeout(() => {
      void resolvePreview(url)
    }, 450)
  }

  const getPlatformIcon = (platform: string | null) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="w-5 h-5 text-red-600" />
      case "facebook":
        return <Facebook className="w-5 h-5 text-blue-600" />
      case "instagram":
        return <Instagram className="w-5 h-5 text-pink-600" />
      case "tiktok":
        return (
          <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
          </svg>
        )
      default:
        return <LinkIcon className="w-5 h-5" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url?.trim()) {
      toast.error("L'URL est obligatoire")
      return
    }

    setIsSubmitting(true)
    try {
      const dataToSubmit: MediaFormData = {
        ...formData,
        url: formData.url.trim(),
        platform: formData.platform === "none" ? null : formData.platform || detectedPlatform,
        thumbnailUrl: formData.thumbnailUrl || getSyncThumbnail(formData.url) || null,
        title: formData.title || null,
        description: formData.description || null,
      }
      await onSubmit?.(dataToSubmit)
      onClose()
    } catch {
      // Erreur déjà toastée par la page parent
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed right-0 top-0 h-screen w-full sm:w-[28rem] bg-background border-l border-border shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">
            {isEdit ? "Modifier le média" : "Nouveau média"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Fermer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label htmlFor="url">URL du média *</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou TikTok / Instagram"
              required
              className="w-full mt-2"
            />
            {(detectedPlatform || isResolvingThumb) && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                {isResolvingThumb ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  getPlatformIcon(detectedPlatform)
                )}
                <span>
                  {isResolvingThumb
                    ? "Génération de la miniature…"
                    : `Plateforme détectée : ${detectedPlatform}`}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Miniature auto pour YouTube, TikTok et Instagram
            </p>
          </div>

          {/* Aperçu miniature */}
          {(formData.thumbnailUrl || isResolvingThumb) && (
            <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video relative">
              {formData.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.thumbnailUrl}
                  alt="Aperçu miniature"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="type">Type de média *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "IMAGE" | "VIDEO" | "FILE") =>
                setFormData((prev) => ({ ...prev, type: value }))
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

          <div>
            <Label htmlFor="platform">Plateforme</Label>
            <Select
              value={formData.platform || detectedPlatform || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  platform: value === "none" ? null : value,
                }))
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
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Titre (max 200 caractères)</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 200) {
                  setFormData((prev) => ({ ...prev, title: value || null }))
                }
              }}
              placeholder="Ex: Émission OMA TV - Épisode 1"
              className="w-full mt-2"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.title?.length || 0} / 200 caractères
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value || null,
                }))
              }
              placeholder="Description du média..."
              rows={3}
              className="w-full mt-2"
            />
          </div>

          {formData.type === "VIDEO" && (
            <div>
              <Label htmlFor="thumbnailUrl">URL de la miniature</Label>
              <Input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    thumbnailUrl: e.target.value || null,
                  }))
                }
                placeholder="Générée automatiquement…"
                className="w-full mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Remplie auto pour YouTube / TikTok / Instagram (modifiable)
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="order">Ordre d&apos;affichage</Label>
            <Input
              id="order"
              name="order"
              type="number"
              min="0"
              value={formData.order ?? 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  order: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full mt-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished ?? true}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPublished: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Publié (visible sur le site)
            </Label>
          </div>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || isResolvingThumb} className="flex-1">
              {isSubmitting
                ? isEdit
                  ? "Modification…"
                  : "Création…"
                : isEdit
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
