/**
 * @file app/admin/unlock/page.tsx
 * @description Page de déverrouillage après inactivité
 * Style similaire à Windows avec image de fond (coverImageUrl)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function UnlockPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update: updateSession } = useSession()

  // Récupérer l'image de couverture depuis les settings
  useEffect(() => {
    const loadCoverImage = async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.coverImageUrl) {
            setCoverImageUrl(data.data.coverImageUrl)
          }
        }
      } catch (err) {
        console.error("[Unlock] Erreur chargement cover image:", err)
      }
    }

    loadCoverImage()
  }, [])

  // Rediriger si non connecté
  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
    }
  }, [session, router])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      toast.error("Veuillez entrer votre mot de passe")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Mot de passe incorrect")
      }

      if (data.success) {
        // Mettre à jour la session pour réinitialiser le timer d'inactivité
        await updateSession()

        // Récupérer l'URL de redirection depuis les query params ou retourner au dashboard
        const redirect = searchParams.get("redirect") || "/admin"
        toast.success("Session déverrouillée")
        router.push(redirect)
      } else {
        throw new Error(data.error || "Erreur lors du déverrouillage")
      }
    } catch (err: any) {
      console.error("[Unlock] Erreur déverrouillage:", err)
      toast.error(err.message || "Mot de passe incorrect")
      setPassword("")
    } finally {
      setIsLoading(false)
    }
  }

  // Si pas de session, ne rien afficher (redirection en cours)
  if (!session?.user) {
    return null
  }

  const userEmail = session.user.email || "Utilisateur"
  const displayName = userEmail.split("@")[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Image de fond (coverImageUrl) */}
      {coverImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${coverImageUrl})`,
          }}
        >
          {/* Overlay sombre pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      {/* Fond par défaut si pas d'image */}
      {!coverImageUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Contenu de déverrouillage */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Icône de verrouillage */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Session verrouillée
          </h1>
          <p className="text-sm text-center text-gray-600 mb-6">
            Votre session a été verrouillée après une période d'inactivité
          </p>

          {/* Informations utilisateur */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Connecté en tant que
            </p>
            <p className="text-sm font-medium text-gray-900">{userEmail}</p>
          </div>

          {/* Formulaire de déverrouillage */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="pr-10"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Déverrouiller
                </>
              )}
            </Button>
          </form>

          {/* Message d'aide */}
          <p className="mt-6 text-xs text-center text-gray-500">
            Si vous avez oublié votre mot de passe, contactez un administrateur
          </p>
        </div>
      </div>
    </div>
  )
}





