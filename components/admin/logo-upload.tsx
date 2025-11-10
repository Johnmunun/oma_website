"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface LogoUploadProps {
  currentLogoUrl?: string
  onUploadComplete: (url: string) => void
  onRemove?: () => void
}

export function LogoUpload({ currentLogoUrl, onUploadComplete, onRemove }: LogoUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mettre à jour la preview quand currentLogoUrl change
  useEffect(() => {
    if (currentLogoUrl) {
      setPreview(currentLogoUrl)
    }
  }, [currentLogoUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Vérifier le type (images uniquement)
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

    // Créer une preview locale
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)

    // Upload automatique
    handleUpload(selectedFile)
  }

  const handleUpload = async (fileToUpload?: File) => {
    const fileToUse = fileToUpload || file
    if (!fileToUse) {
      toast.error("Veuillez sélectionner un fichier")
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", fileToUse)
      formData.append("folder", "/logos") // Dossier spécifique pour les logos

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
        setPreview(data.data.url)
        toast.success("Logo uploadé avec succès vers ImageKit")
        // Appeler le callback avec l'URL
        onUploadComplete(data.data.url)
      } else {
        throw new Error(data.error || "Erreur inconnue")
      }
    } catch (err: any) {
      console.error("[LogoUpload] Erreur:", err)
      toast.error(err.message || "Erreur lors de l'upload du logo")
      // Réinitialiser en cas d'erreur
      setFile(null)
      if (!currentLogoUrl) {
        setPreview(null)
      } else {
        setPreview(currentLogoUrl)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onRemove?.()
  }

  const handleButtonClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Zone d'aperçu du logo avec cercle blanc */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors min-h-[200px] flex items-center justify-center bg-card">
        {preview ? (
          <div className="relative inline-flex items-center justify-center">
            {/* Cercle blanc derrière le logo pour garantir la visibilité */}
            <div className="absolute w-24 h-24 bg-white rounded-full shadow-lg z-0 border-2 border-border/20" />
            {/* Logo par-dessus */}
            <img 
              src={preview} 
              alt="Logo preview" 
              className="h-20 max-w-full object-contain relative z-10" 
            />
          </div>
        ) : (
          <div className="text-muted-foreground">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm">Upload en cours...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm">Cliquez pour télécharger un logo</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, WEBP (max 10MB)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="logo-upload-input"
        disabled={uploading}
      />

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          disabled={uploading}
          onClick={handleButtonClick}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Upload en cours...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {preview ? "Changer le logo" : "Télécharger un logo"}
            </>
          )}
        </Button>
        
        {preview && !uploading && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
            Supprimer
          </Button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground">
        Formats acceptés : JPG, PNG, WEBP (max 10MB). Le logo sera uploadé vers ImageKit et l'URL sera sauvegardée automatiquement dans la base de données. Le logo sera affiché avec un cercle blanc derrière pour garantir la visibilité sur fond sombre.
      </p>
    </div>
  )
}
