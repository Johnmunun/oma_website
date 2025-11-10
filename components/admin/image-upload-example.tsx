/**
 * @file components/admin/image-upload-example.tsx
 * @description Exemple de composant React pour upload d'images vers ImageKit
 * Utilise l'endpoint /api/uploads protégé
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, Check } from "lucide-react"
import { toast } from "sonner"
import { getImageKitUrl } from "@/lib/imagekit"

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void
  folder?: string
  label?: string
}

export function ImageUploadExample({ onUploadComplete, folder = "/uploads", label = "Uploader une image" }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Vérifier le type
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image")
      return
    }

    // Vérifier la taille (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10MB")
      return
    }

    setFile(selectedFile)
    setUploadedUrl(null)

    // Créer une preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier")
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de l'upload")
      }

      const data = await res.json()
      if (data.success) {
        setUploadedUrl(data.data.url)
        toast.success("Image uploadée avec succès")
        onUploadComplete?.(data.data.url)
      } else {
        throw new Error(data.error || "Erreur inconnue")
      }
    } catch (err: any) {
      console.error("[ImageUpload] Erreur:", err)
      toast.error(err.message || "Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    setUploadedUrl(null)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>

      {!preview ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Cliquez pour sélectionner une image
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, WEBP (max 10MB)
            </span>
          </label>
        </div>
      ) : (
        <div className="relative">
          <div className="border border-border rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
          </div>
          {uploadedUrl && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">Image uploadée avec succès</span>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !!uploadedUrl}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Upload en cours...
                </>
              ) : uploadedUrl ? (
                "Uploadé ✓"
              ) : (
                "Uploader"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {uploadedUrl && (
            <div className="mt-2">
              <Input
                type="text"
                value={uploadedUrl}
                readOnly
                className="text-xs font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL copiée - Utilisez cette URL dans vos paramètres
              </p>
            </div>
          )}
        </div>
      )}

      {/* Exemple d'utilisation avec transformations ImageKit */}
      {uploadedUrl && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">Exemples de transformations :</p>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Thumbnail (200x200) :</strong>
              <code className="block mt-1 p-2 bg-background rounded font-mono text-xs">
                {getImageKitUrl(uploadedUrl, { width: 200, height: 200, quality: 80 })}
              </code>
            </div>
            <div>
              <strong>Large (800x600) :</strong>
              <code className="block mt-1 p-2 bg-background rounded font-mono text-xs">
                {getImageKitUrl(uploadedUrl, { width: 800, height: 600, quality: 90, format: 'webp' })}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


