"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, ImageIcon, Video, File, Search, Youtube, Facebook, Instagram, ExternalLink, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MediaModal, MediaFormData } from "@/components/admin/media-modal"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"

interface Media {
  id: string
  url: string
  type: "IMAGE" | "VIDEO" | "FILE"
  title: string | null
  description: string | null
  platform: string | null
  thumbnailUrl: string | null
  alt: string | null
  order: number
  isPublished: boolean
  eventId: string | null
  createdAt: string
  updatedAt: string
  event?: {
    id: string
    title: string
    slug: string
  } | null
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<Media | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")

  useEffect(() => {
    loadMedia()
  }, [typeFilter, platformFilter, searchQuery])

  const loadMedia = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (typeFilter !== "all") {
        params.append("type", typeFilter)
      }
      if (platformFilter !== "all") {
        params.append("platform", platformFilter)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const res = await fetch(`/api/admin/media?${params.toString()}`)
      if (!res.ok) throw new Error("Erreur lors du chargement")

      const data = await res.json()
      if (data.success) {
        setMedia(data.data || [])
      }
    } catch (error) {
      console.error("[Admin] Erreur chargement médias:", error)
      toast.error("Impossible de charger les médias")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (formData: MediaFormData) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création")
      }

      if (data.success) {
        toast.success("Média créé avec succès")
        loadMedia()
        setIsModalOpen(false)
      }
    } catch (error: any) {
      console.error("[Admin] Erreur création média:", error)
      toast.error(error.message || "Erreur lors de la création du média")
    }
  }

  const handleUpdate = async (id: string, formData: Partial<MediaFormData>) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      if (data.success) {
        toast.success("Média mis à jour avec succès")
        loadMedia()
        setIsModalOpen(false)
        setEditingMedia(null)
      }
    } catch (error: any) {
      console.error("[Admin] Erreur mise à jour média:", error)
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      if (data.success) {
        toast.success("Média supprimé avec succès")
        loadMedia()
      }
    } catch (error: any) {
      console.error("[Admin] Erreur suppression média:", error)
      toast.error(error.message || "Erreur lors de la suppression")
    }
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      if (data.success) {
        toast.success(`Média ${!isPublished ? "publié" : "masqué"} avec succès`)
        loadMedia()
      }
    } catch (error: any) {
      console.error("[Admin] Erreur changement statut:", error)
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const getPlatformIcon = (platform: string | null) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-600" />
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-600" />
      default:
        return <ExternalLink className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-4 h-4" />
      case "IMAGE":
        return <ImageIcon className="w-4 h-4" />
      case "FILE":
        return <File className="w-4 h-4" />
      default:
        return <File className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return <PageSkeleton type="grid" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Médiathèque</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les médias (liens YouTube, Facebook, Instagram, etc.)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMedia(null)
            setIsModalOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau média
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par titre, description ou URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="VIDEO">Vidéo</SelectItem>
            <SelectItem value="IMAGE">Image</SelectItem>
            <SelectItem value="FILE">Fichier</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Plateforme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les plateformes</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="twitter">Twitter/X</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des médias */}
      {media.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Aucun média</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || typeFilter !== "all" || platformFilter !== "all"
              ? "Aucun média ne correspond à vos critères."
              : "Commencez par ajouter un nouveau média (lien YouTube, Facebook, etc.)"}
          </p>
          {!searchQuery && typeFilter === "all" && platformFilter === "all" && (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un média
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Miniature ou aperçu */}
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title || item.alt || "Média"}
                    className="w-full h-full object-cover"
                  />
                ) : item.type === "VIDEO" ? (
                  <Video className="w-16 h-16 text-muted-foreground" />
                ) : item.type === "IMAGE" ? (
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                ) : (
                  <File className="w-16 h-16 text-muted-foreground" />
                )}
                {/* Badge plateforme */}
                {item.platform && (
                  <div className="absolute top-2 right-2">
                    {getPlatformIcon(item.platform)}
                  </div>
                )}
                {/* Badge statut */}
                <div className="absolute top-2 left-2">
                  <Badge
                    variant={item.isPublished ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {item.isPublished ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Publié
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Masqué
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {item.title || "Sans titre"}
                    </h3>
                    {item.platform && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.platform}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(item.type)}
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(item.url, "_blank")}
                    className="gap-1 flex-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ouvrir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingMedia(item)
                      setIsModalOpen(true)
                    }}
                    className="gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublish(item.id, item.isPublished)}
                    className="gap-1"
                  >
                    {item.isPublished ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMedia(null)
        }}
        onSubmit={
          editingMedia
            ? (data) => handleUpdate(editingMedia.id, data)
            : handleCreate
        }
        initialData={editingMedia}
      />
    </div>
  )
}
