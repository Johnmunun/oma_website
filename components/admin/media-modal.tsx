"use client"

import { useState, useEffect, useRef } from "react"
import {
  X,
  Youtube,
  Facebook,
  Instagram,
  Link as LinkIcon,
  Loader2,
  Play,
  Upload,
  ImagePlus,
} from "lucide-react"
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
import { TikTokIcon } from "@/components/icons/tiktok-icon"

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
  const [isUploadingThumb, setIsUploadingThumb] = useState(false)
  /** true = miniature choisie manuellement (upload / URL), ne pas écraser par l’auto */
  const [thumbManual, setThumbManual] = useState(false)
  const thumbManualRef = useRef(false)
  const previewTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thumbInputRef = useRef<HTMLInputElement | null>(null)
  const isEdit = mode === "edit" || Boolean(initialData?.url)

  const markThumbManual = (value: boolean) => {
    thumbManualRef.current = value
    setThumbManual(value)
  }

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
      markThumbManual(Boolean(initialData.thumbnailUrl))
    } else {
      setFormData(EMPTY_FORM)
      setDetectedPlatform(null)
      markThumbManual(false)
    }
    setIsResolvingThumb(false)
    setIsUploadingThumb(false)
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
      thumbnailUrl: thumbManualRef.current ? prev.thumbnailUrl : syncThumb || prev.thumbnailUrl,
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
          thumbnailUrl: thumbManualRef.current
            ? prev.thumbnailUrl
            : data.data.thumbnailUrl || prev.thumbnailUrl || syncThumb,
          title: prev.title || data.data.title || null,
        }))
      }
    } catch (err) {
      console.warn("[MediaModal] Preview échoué:", err)
    } finally {
      setIsResolvingThumb(false)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image (JPG, PNG, WEBP…)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo")
      return
    }

    try {
      setIsUploadingThumb(true)
      const body = new FormData()
      body.append("file", file)
      body.append("folder", "/media/thumbnails")

      const res = await fetch("/api/uploads", {
        method: "POST",
        body,
        credentials: "include",
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || "Erreur lors de l'upload")
      }

      const data = await res.json()
      if (data.success && data.data?.url) {
        markThumbManual(true)
        setFormData((prev) => ({ ...prev, thumbnailUrl: data.data.url }))
        toast.success("Miniature uploadée")
      } else {
        throw new Error(data.error || "Erreur inconnue")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'upload"
      console.error("[MediaModal] Upload miniature:", err)
      toast.error(message)
    } finally {
      setIsUploadingThumb(false)
      if (thumbInputRef.current) thumbInputRef.current.value = ""
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
        return <TikTokIcon className="w-5 h-5 text-foreground" />
      default:
        return <LinkIcon className="w-5 h-5" />
    }
  }

  const previewPlatform = formData.platform || detectedPlatform

  const PlayBadge = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const outer = size === "sm" ? "w-12 h-12" : "w-16 h-16"
    const play = size === "sm" ? "h-5 w-5" : "h-7 w-7"
    const logo = size === "sm" ? "w-6 h-6" : "w-7 h-7"

    if (previewPlatform === "tiktok") {
      return (
        <div
          className={`${outer} rounded-full bg-black/80 ring-2 ring-white/90 shadow-lg flex items-center justify-center`}
          aria-hidden
        >
          <TikTokIcon className={`${logo} text-white`} />
        </div>
      )
    }

    return (
      <div
        className={`${outer} rounded-full bg-black/75 ring-2 ring-white/90 shadow-lg flex items-center justify-center relative`}
        aria-hidden
      >
        <Play className={`${play} text-white ml-0.5`} fill="currentColor" />
        {previewPlatform === "youtube" && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-red-600 shadow">
            <Youtube className="w-3.5 h-3.5" />
          </span>
        )}
        {previewPlatform === "instagram" && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-pink-600 shadow">
            <Instagram className="w-3.5 h-3.5" />
          </span>
        )}
        {previewPlatform === "facebook" && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600 shadow">
            <Facebook className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    )
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
              Miniature auto pour YouTube / TikTok / Instagram — ou upload manuel ci-dessous
            </p>
          </div>

          {/* Aperçu miniature (style lecteur vidéo) */}
          {(formData.thumbnailUrl || isResolvingThumb || isUploadingThumb) && (
            <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video relative group">
              {formData.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.thumbnailUrl}
                  alt="Aperçu miniature"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {formData.thumbnailUrl && formData.type === "VIDEO" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
                  <PlayBadge />
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
            <div className="space-y-3">
              <Label>Miniature</Label>

              <input
                ref={thumbInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                id="media-thumb-upload"
                disabled={isUploadingThumb}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleThumbnailUpload(file)
                }}
              />

              <div
                role="button"
                tabIndex={0}
                onClick={() => !isUploadingThumb && thumbInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    thumbInputRef.current?.click()
                  }
                }}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-gold/60 transition-colors bg-muted/30"
              >
                {isUploadingThumb ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="w-7 h-7 animate-spin text-gold" />
                    <p className="text-sm text-muted-foreground">Upload en cours…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-1">
                    {formData.thumbnailUrl ? (
                      <ImagePlus className="w-7 h-7 text-muted-foreground" />
                    ) : (
                      <Upload className="w-7 h-7 text-muted-foreground" />
                    )}
                    <p className="text-sm font-medium">
                      {formData.thumbnailUrl
                        ? "Changer la miniature (image)"
                        : "Uploader une miniature (image)"}
                    </p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WEBP — max 10 Mo</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnailUrl" className="text-muted-foreground font-normal">
                  Ou coller une URL de miniature
                </Label>
                <Input
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  type="url"
                  value={formData.thumbnailUrl || ""}
                  onChange={(e) => {
                    const value = e.target.value || null
                    markThumbManual(Boolean(value))
                    setFormData((prev) => ({
                      ...prev,
                      thumbnailUrl: value,
                    }))
                  }}
                  placeholder="https://… ou générée automatiquement"
                  className="w-full mt-2"
                />
              </div>

              {thumbManual && formData.url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    markThumbManual(false)
                    void resolvePreview(formData.url, formData.platform)
                  }}
                >
                  Régénérer automatiquement depuis l’URL
                </Button>
              )}
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
            <Button type="submit" disabled={isSubmitting || isResolvingThumb || isUploadingThumb} className="flex-1">
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
