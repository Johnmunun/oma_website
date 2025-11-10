/**
 * @file app/admin/media/page.tsx
 * @description Gestion de la médiathèque - Upload, organisation et suppression des images/fichiers
 * @todo Intégrer avec un service de stockage (Vercel Blob, S3, etc)
 */

"use client"

import { useState, useEffect } from "react"
import { Trash2, ImageIcon, Upload, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"

interface MediaFile {
  id: string
  name: string
  url: string
  type: "image" | "video" | "document"
  size: number
  uploadedAt: string
}

const mockMedia: MediaFile[] = [
  {
    id: "1",
    name: "Image hero",
    url: "/placeholder.svg",
    type: "image",
    size: 1024,
    uploadedAt: "2025-02-10",
  },
]

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setIsLoading(true)
        // @todo Remplacer par un appel API réel
        // const res = await fetch('/api/admin/media')
        // if (!res.ok) throw new Error('Failed to load media')
        // const data = await res.json()
        // setMedia(data)
        
        // Simulation d'un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 500))
        setMedia(mockMedia)
      } catch (err) {
        console.error('[Admin] Erreur chargement médias:', err)
        toast.error('Impossible de charger les médias')
      } finally {
        setIsLoading(false)
      }
    }
    loadMedia()
  }, [])

  const filteredMedia = media.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Supprimer ce fichier ?")) return
      
    // @todo Appeler l'API pour supprimer du stockage
      // const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
      // if (!res.ok) throw new Error('Failed to delete media')
      
      setMedia(media.filter((m) => m.id !== id))
      toast.success('Fichier supprimé avec succès')
    } catch (err) {
      console.error('[Admin] Erreur suppression média:', err)
      toast.error('Erreur lors de la suppression du fichier')
    }
  }

  if (isLoading) {
    return <PageSkeleton type="grid" showHeader={true} showFilters={true} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Médiathèque</h1>
          <p className="text-muted-foreground mt-1">{media.length} fichiers stockés</p>
        </div>
        <Button size="lg" className="gap-2">
          <Upload className="w-5 h-5" />
          Télécharger un fichier
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans la médiathèque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMedia.length > 0 ? (
          filteredMedia.map((file) => (
            <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {file.type === "image" ? (
                  <img src={file.url || "/placeholder.svg"} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(file.id)} className="w-full mt-2">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Aucun fichier trouvé</p>
          </Card>
        )}
      </div>
    </div>
  )
}
