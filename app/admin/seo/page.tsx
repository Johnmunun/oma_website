/**
 * Page Admin pour gérer le SEO
 * Permet de créer, modifier et supprimer les métadonnées SEO pour chaque page
 * 
 * @route /admin/seo
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
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { toast } from "sonner"
import { Plus, Trash2, Save, Search, Edit2, Eye, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface SeoMeta {
  id: string
  pageId: string | null
  slug: string | null
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImageUrl: string | null
  ogType: string | null
  twitterCard: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImageUrl: string | null
  noIndex: boolean
  noFollow: boolean
  canonicalUrl: string | null
  schemaJson: any
  createdAt: string
  updatedAt: string
  page?: {
    id: string
    title: string
    slug: string
  }
}

export default function AdminSeoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [seoMetas, setSeoMetas] = useState<SeoMeta[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeo, setSelectedSeo] = useState<SeoMeta | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // État du formulaire
  const [formData, setFormData] = useState({
    pageId: "",
    slug: "",
    title: "",
    description: "",
    keywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImageUrl: "",
    noIndex: false,
    noFollow: false,
    canonicalUrl: "",
    schemaJson: "",
  })

  // Charger les métadonnées SEO
  useEffect(() => {
    loadSeoMetas()
  }, [])

  const loadSeoMetas = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/seo", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load SEO metadata")
      const data = await res.json()
      if (data.success) {
        setSeoMetas(data.data || [])
      }
    } catch (err: any) {
      console.error("[Admin] Erreur chargement SEO:", err)
      toast.error(err.message || "Impossible de charger les métadonnées SEO")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    setSelectedSeo(null)
    setIsEditing(true)
    setFormData({
      pageId: "",
      slug: "",
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImageUrl: "",
      ogType: "website",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImageUrl: "",
      noIndex: false,
      noFollow: false,
      canonicalUrl: "",
      schemaJson: "",
    })
  }

  const handleEdit = (seo: SeoMeta) => {
    setSelectedSeo(seo)
    setIsEditing(true)
    setFormData({
      pageId: seo.pageId || "",
      slug: seo.slug || "",
      title: seo.title || "",
      description: seo.description || "",
      keywords: seo.keywords || "",
      ogTitle: seo.ogTitle || "",
      ogDescription: seo.ogDescription || "",
      ogImageUrl: seo.ogImageUrl || "",
      ogType: seo.ogType || "website",
      twitterCard: seo.twitterCard || "summary_large_image",
      twitterTitle: seo.twitterTitle || "",
      twitterDescription: seo.twitterDescription || "",
      twitterImageUrl: seo.twitterImageUrl || "",
      noIndex: seo.noIndex || false,
      noFollow: seo.noFollow || false,
      canonicalUrl: seo.canonicalUrl || "",
      schemaJson: seo.schemaJson ? JSON.stringify(seo.schemaJson, null, 2) : "",
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Valider que pageId ou slug est fourni
      if (!formData.pageId && !formData.slug) {
        toast.error("Page ID ou Slug requis")
        return
      }

      // Valider les longueurs
      if (formData.title && formData.title.length > 60) {
        toast.error("Le titre ne doit pas dépasser 60 caractères")
        return
      }
      if (formData.description && formData.description.length > 160) {
        toast.error("La description ne doit pas dépasser 160 caractères")
        return
      }

      // Parser le JSON-LD si fourni
      let schemaJson = null
      if (formData.schemaJson.trim()) {
        try {
          schemaJson = JSON.parse(formData.schemaJson)
        } catch (err) {
          toast.error("JSON-LD invalide")
          return
        }
      }

      const payload: any = {
        ...formData,
        pageId: formData.pageId || undefined,
        slug: formData.slug || undefined,
        schemaJson: schemaJson,
      }

      // Nettoyer les champs vides
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null) {
          payload[key] = undefined
        }
      })

      let res
      if (selectedSeo) {
        // Mise à jour
        res = await fetch("/api/admin/seo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedSeo.id, ...payload }),
        })
      } else {
        // Création
        res = await fetch("/api/admin/seo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de la sauvegarde")
      }

      toast.success(selectedSeo ? "Métadonnées SEO mises à jour" : "Métadonnées SEO créées")
      setIsEditing(false)
      setSelectedSeo(null)
      loadSeoMetas()
    } catch (err: any) {
      console.error("[Admin] Erreur sauvegarde SEO:", err)
      toast.error(err.message || "Impossible de sauvegarder")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ces métadonnées SEO ?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/seo?id=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de la suppression")
      }

      toast.success("Métadonnées SEO supprimées")
      loadSeoMetas()
    } catch (err: any) {
      console.error("[Admin] Erreur suppression SEO:", err)
      toast.error(err.message || "Impossible de supprimer")
    }
  }

  const filteredSeoMetas = seoMetas.filter((seo) => {
    const query = searchQuery.toLowerCase()
    return (
      seo.slug?.toLowerCase().includes(query) ||
      seo.title?.toLowerCase().includes(query) ||
      seo.description?.toLowerCase().includes(query) ||
      seo.page?.title.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return <PageSkeleton type="default" showHeader={true} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestion SEO"
        description="Optimisez le référencement de vos pages avec des métadonnées personnalisées"
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par slug, titre, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau SEO
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des métadonnées SEO */}
        <div className="lg:col-span-2 space-y-4">
          {filteredSeoMetas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "Aucun résultat trouvé" : "Aucune métadonnée SEO configurée"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSeoMetas.map((seo) => (
              <Card key={seo.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {seo.slug || seo.page?.slug || "Sans slug"}
                      </CardTitle>
                      {seo.page && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Page: {seo.page.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {seo.noIndex && <Badge variant="destructive">No Index</Badge>}
                      {seo.noFollow && <Badge variant="destructive">No Follow</Badge>}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(seo)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(seo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {seo.title && (
                      <div>
                        <p className="text-xs text-muted-foreground">Titre</p>
                        <p className="text-sm font-medium">{seo.title}</p>
                      </div>
                    )}
                    {seo.description && (
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="text-sm">{seo.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
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
                  <CardTitle>
                    {selectedSeo ? "Modifier SEO" : "Nouveau SEO"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedSeo(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Page ID (optionnel)</Label>
                  <Input
                    value={formData.pageId}
                    onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                    placeholder="UUID de la page"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ex: /events, /formations"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex: "home" pour la page d'accueil, "events" pour /events
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Titre SEO (max 60 caractères)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de la page"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.title.length}/60 caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Description SEO (max 160 caractères)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la page"
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/160 caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Mots-clés (séparés par des virgules)</Label>
                  <Input
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="art oratoire, communication, formation"
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL canonique</Label>
                  <Input
                    value={formData.canonicalUrl}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    placeholder="https://votre-domaine.com/page"
                    type="url"
                  />
                </div>

                {/* Open Graph */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Open Graph</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Titre OG</Label>
                      <Input
                        value={formData.ogTitle}
                        onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                        placeholder="Titre pour les réseaux sociaux"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description OG</Label>
                      <Textarea
                        value={formData.ogDescription}
                        onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                        placeholder="Description pour les réseaux sociaux"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image OG (URL)</Label>
                      <Input
                        value={formData.ogImageUrl}
                        onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                        placeholder="https://..."
                        type="url"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommandé: 1200x630px
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Type OG</Label>
                      <Select
                        value={formData.ogType}
                        onValueChange={(value) => setFormData({ ...formData, ogType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Twitter Card */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Twitter Card</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Type de carte</Label>
                      <Select
                        value={formData.twitterCard}
                        onValueChange={(value) => setFormData({ ...formData, twitterCard: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">Summary</SelectItem>
                          <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Titre Twitter</Label>
                      <Input
                        value={formData.twitterTitle}
                        onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
                        placeholder="Titre pour Twitter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description Twitter</Label>
                      <Textarea
                        value={formData.twitterDescription}
                        onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
                        placeholder="Description pour Twitter"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image Twitter (URL)</Label>
                      <Input
                        value={formData.twitterImageUrl}
                        onChange={(e) => setFormData({ ...formData, twitterImageUrl: e.target.value })}
                        placeholder="https://..."
                        type="url"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommandé: 1200x675px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contrôle d'indexation */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Contrôle d'indexation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>No Index</Label>
                      <Switch
                        checked={formData.noIndex}
                        onCheckedChange={(checked) => setFormData({ ...formData, noIndex: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>No Follow</Label>
                      <Switch
                        checked={formData.noFollow}
                        onCheckedChange={(checked) => setFormData({ ...formData, noFollow: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* JSON-LD Schema */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Schema.org JSON-LD</h3>
                  <div className="space-y-2">
                    <Label>Données structurées (JSON)</Label>
                    <Textarea
                      value={formData.schemaJson}
                      onChange={(e) => setFormData({ ...formData, schemaJson: e.target.value })}
                      placeholder='{"@context": "https://schema.org", ...}'
                      rows={6}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format JSON valide pour Schema.org
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                  >
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

