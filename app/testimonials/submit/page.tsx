"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Loader2, CheckCircle2, MessageSquare } from "lucide-react"
import { LogoUpload } from "@/components/admin/logo-upload"
import { toast } from "sonner"
import { Avatar } from "@/components/ui/avatar"

export default function TestimonialSubmitPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    content: "",
    rating: 5,
    photoUrl: null as string | null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [testimonialInfo, setTestimonialInfo] = useState<{
    name: string
    email: string
    role: string | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError("Token manquant. Veuillez utiliser le lien fourni par email.")
      setIsLoading(false)
      return
    }

    // Vérifier que le token est valide (on pourrait faire un appel API ici)
    // Pour l'instant, on accepte n'importe quel token et on vérifie côté serveur
    setIsLoading(false)
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Token manquant")
      return
    }

    if (formData.content.length < 10) {
      toast.error("Le témoignage doit contenir au moins 10 caractères")
      return
    }

    setIsSubmitting(true)
    toast.info("Processus en cours...", {
      duration: 2000,
    })

    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          content: formData.content,
          rating: formData.rating,
          photoUrl: formData.photoUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la soumission")
      }

      if (data.success) {
        setIsSuccess(true)
        toast.success("Témoignage soumis avec succès !")
      }
    } catch (error: any) {
      console.error("[TestimonialSubmit] Erreur:", error)
      toast.error(error.message || "Erreur lors de la soumission du témoignage")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h1 className="text-2xl font-bold mb-4">Lien invalide</h1>
            <p className="text-muted-foreground">{error}</p>
          </Card>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Merci pour votre témoignage !</h1>
            <p className="text-muted-foreground mb-6">
              Votre témoignage a été soumis avec succès. Il sera examiné par notre équipe
              avant publication sur le site.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Partagez votre témoignage</h1>
              <p className="text-muted-foreground">
                Votre avis compte ! Partagez votre expérience avec Réseau OMA
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Note */}
              <div>
                <Label htmlFor="rating">Note *</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          rating <= formData.rating
                            ? "text-gold fill-gold"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              {/* Photo (optionnelle) */}
              <div>
                <Label>Photo de profil (optionnel)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Si vous ne fournissez pas de photo, un avatar par défaut sera utilisé
                </p>
                <LogoUpload
                  currentLogoUrl={formData.photoUrl || ""}
                  onUploadComplete={(url) => setFormData({ ...formData, photoUrl: url })}
                  onRemove={() => setFormData({ ...formData, photoUrl: null })}
                  folder="/testimonials"
                  publicToken={token}
                />
                {formData.photoUrl && (
                  <div className="mt-4">
                    <Avatar src={formData.photoUrl} size="lg" />
                  </div>
                )}
              </div>

              {/* Contenu du témoignage */}
              <div>
                <Label htmlFor="content">Votre témoignage *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Partagez votre expérience avec Réseau OMA..."
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={6}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.content.length}/1000 caractères (minimum 10)
                </p>
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || formData.content.length < 10}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Soumission en cours...
                  </>
                ) : (
                  "Soumettre mon témoignage"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                En soumettant ce formulaire, vous acceptez que votre témoignage soit publié
                sur notre site après validation.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

