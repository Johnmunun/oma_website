/**
 * Page Admin pour gérer les pixels de tracking
 * Permet de créer, modifier et supprimer les pixels de tracking
 * 
 * @route /admin/pixels
 * @author OMA Team
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { toast } from "sonner"
import { Plus, Trash2, Save, Search, Edit2, X, CheckCircle2, XCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TrackingPixel {
  id: string
  name: string
  type: string
  pixelId: string
  isActive: boolean
  position: "head" | "body"
  config: any
  description: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

const PIXEL_TYPES = [
  { value: "FACEBOOK_PIXEL", label: "Facebook Pixel (Meta)" },
  { value: "GOOGLE_ANALYTICS", label: "Google Analytics (GA4)" },
  { value: "GOOGLE_TAG_MANAGER", label: "Google Tag Manager" },
  { value: "TIKTOK_PIXEL", label: "TikTok Pixel" },
  { value: "LINKEDIN_INSIGHT", label: "LinkedIn Insight Tag" },
  { value: "TWITTER_PIXEL", label: "Twitter Pixel (X)" },
  { value: "PINTEREST_PIXEL", label: "Pinterest Pixel" },
  { value: "SNAPCHAT_PIXEL", label: "Snapchat Pixel" },
  { value: "CUSTOM", label: "Script personnalisé" },
]

export default function AdminPixelsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [pixels, setPixels] = useState<TrackingPixel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPixel, setSelectedPixel] = useState<TrackingPixel | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    type: "FACEBOOK_PIXEL",
    pixelId: "",
    isActive: true,
    position: "head" as "head" | "body",
    description: "",
    website: "",
    customScript: "",
  })

  // Charger les pixels
  useEffect(() => {
    loadPixels()
  }, [])

  const loadPixels = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/pixels", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load pixels")
      const data = await res.json()
      if (data.success) {
        setPixels(data.data || [])
      }
    } catch (err: any) {
      console.error("[Admin] Erreur chargement pixels:", err)
      toast.error(err.message || "Impossible de charger les pixels")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    setSelectedPixel(null)
    setIsEditing(true)
    setFormData({
      name: "",
      type: "FACEBOOK_PIXEL",
      pixelId: "",
      isActive: true,
      position: "head",
      description: "",
      website: "",
      customScript: "",
    })
  }

  const handleEdit = (pixel: TrackingPixel) => {
    setSelectedPixel(pixel)
    setIsEditing(true)
    setFormData({
      name: pixel.name,
      type: pixel.type,
      pixelId: pixel.pixelId,
      isActive: pixel.isActive,
      position: pixel.position,
      description: pixel.description || "",
      website: pixel.website || "",
      customScript: pixel.config?.script || "",
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      if (!formData.name || !formData.pixelId) {
        toast.error("Le nom et l'ID du pixel sont requis")
        return
      }

      const payload: any = {
        name: formData.name,
        type: formData.type,
        pixelId: formData.pixelId,
        isActive: formData.isActive,
        position: formData.position,
        description: formData.description || null,
        website: formData.website || null,
      }

      // Pour les scripts personnalisés, ajouter le script dans config
      if (formData.type === "CUSTOM" && formData.customScript) {
        payload.config = { script: formData.customScript }
      }

      let res
      if (selectedPixel) {
        // Mise à jour
        res = await fetch("/api/admin/pixels", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedPixel.id, ...payload }),
        })
      } else {
        // Création
        res = await fetch("/api/admin/pixels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de la sauvegarde")
      }

      toast.success(selectedPixel ? "Pixel mis à jour" : "Pixel créé")
      setIsEditing(false)
      setSelectedPixel(null)
      loadPixels()
    } catch (err: any) {
      console.error("[Admin] Erreur sauvegarde pixel:", err)
      toast.error(err.message || "Impossible de sauvegarder")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce pixel ?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/pixels?id=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de la suppression")
      }

      toast.success("Pixel supprimé")
      loadPixels()
    } catch (err: any) {
      console.error("[Admin] Erreur suppression pixel:", err)
      toast.error(err.message || "Impossible de supprimer")
    }
  }

  const handleToggleActive = async (pixel: TrackingPixel) => {
    try {
      const res = await fetch("/api/admin/pixels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pixel.id, isActive: !pixel.isActive }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      toast.success(pixel.isActive ? "Pixel désactivé" : "Pixel activé")
      loadPixels()
    } catch (err: any) {
      console.error("[Admin] Erreur toggle pixel:", err)
      toast.error(err.message || "Impossible de mettre à jour")
    }
  }

  const filteredPixels = pixels.filter((pixel) => {
    const query = searchQuery.toLowerCase()
    return (
      pixel.name.toLowerCase().includes(query) ||
      pixel.type.toLowerCase().includes(query) ||
      pixel.pixelId.toLowerCase().includes(query) ||
      pixel.description?.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return <PageSkeleton type="default" showHeader={true} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pixels de Tracking"
        description="Gérez les pixels de tracking (Facebook, Google Analytics, TikTok, etc.) pour suivre les conversions et analyser le trafic"
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un pixel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau Pixel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des pixels */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPixels.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "Aucun résultat trouvé" : "Aucun pixel configuré"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPixels.map((pixel) => (
              <Card key={pixel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{pixel.name}</CardTitle>
                        {pixel.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{pixel.type.replace(/_/g, " ")}</Badge>
                        <span>•</span>
                        <span>ID: {pixel.pixelId}</span>
                        <span>•</span>
                        <span>{pixel.position === "head" ? "Head" : "Body"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(pixel)}
                        title={pixel.isActive ? "Désactiver" : "Activer"}
                      >
                        {pixel.isActive ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pixel)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pixel.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {pixel.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{pixel.description}</p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Formulaire d'édition */}
        {isEditing && (
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedPixel ? "Modifier Pixel" : "Nouveau Pixel"}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedPixel(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Nom du pixel *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Facebook Pixel Principal"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de pixel *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIXEL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ID du pixel *</Label>
                  <Input
                    value={formData.pixelId}
                    onChange={(e) => setFormData({ ...formData, pixelId: e.target.value })}
                    placeholder={
                      formData.type === "FACEBOOK_PIXEL"
                        ? "Ex: 123456789012345"
                        : formData.type === "GOOGLE_ANALYTICS"
                        ? "Ex: G-XXXXXXXXXX"
                        : formData.type === "GOOGLE_TAG_MANAGER"
                        ? "Ex: GTM-XXXXXXX"
                        : "Ex: Votre ID de pixel"
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.type === "FACEBOOK_PIXEL" &&
                      "Trouvez votre ID dans les Paramètres de votre Pixel Facebook"}
                    {formData.type === "GOOGLE_ANALYTICS" &&
                      "Format: G-XXXXXXXXXX (trouvé dans Admin > Paramètres de flux de données)"}
                    {formData.type === "GOOGLE_TAG_MANAGER" &&
                      "Format: GTM-XXXXXXX (trouvé dans l'onglet Conteneur)"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Position du script</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value: "head" | "body") =>
                      setFormData({ ...formData, position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head">Head (recommandé)</SelectItem>
                      <SelectItem value="body">Body</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === "CUSTOM" && (
                  <div className="space-y-2">
                    <Label>Script personnalisé *</Label>
                    <Textarea
                      value={formData.customScript}
                      onChange={(e) => setFormData({ ...formData, customScript: e.target.value })}
                      placeholder='<script>...</script>'
                      rows={8}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Collez votre script de tracking personnalisé ici
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Description (optionnel)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du pixel..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Site web (optionnel)</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Label>Activer le pixel</Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}


