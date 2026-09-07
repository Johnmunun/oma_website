"use client"

import { useEffect, useState } from "react"
import { Star, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface PublishedReview {
  id: string
  name: string
  rating: number
  content: string
  createdAt: string
}

function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: {
  value: number
  onChange?: (n: number) => void
  size?: "sm" | "md"
  readOnly?: boolean
}) {
  const cls = size === "sm" ? "w-4 h-4" : "w-6 h-6"
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${cls} ${
              n <= value ? "fill-gold text-gold" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function EventReviewsSection({ eventId }: { eventId: string }) {
  const [reviews, setReviews] = useState<PublishedReview[]>([])
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/events/${eventId}/reviews`)
      const data = await res.json()
      if (res.ok && data.success) {
        setReviews(data.data.reviews || [])
        setAverageRating(data.data.averageRating)
        setCount(data.data.count || 0)
      }
    } catch (err) {
      console.error("[EventReviews] Erreur chargement:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [eventId])

  const validate = () => {
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = "Nom requis"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Email invalide"
    if (rating < 1 || rating > 5) next.rating = "Note requise"
    if (content.trim().length < 10) next.content = "Minimum 10 caractères"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/events/${eventId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          rating,
          content: content.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi")
      }
      toast.success(data.message || "Critique envoyée — en attente de modération")
      setName("")
      setEmail("")
      setRating(5)
      setContent("")
      setErrors({})
    } catch (err: any) {
      console.error("[EventReviews] Erreur soumission:", err)
      toast.error(err.message || "Impossible d'envoyer la critique")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-3xl text-foreground">Appréciations</h2>
          <p className="text-muted-foreground mt-1">
            Partagez votre retour d&apos;expérience sur cet événement
          </p>
        </div>
        {!isLoading && count > 0 && averageRating !== null && (
          <div className="flex items-center gap-3">
            <StarRating value={Math.round(averageRating)} readOnly size="sm" />
            <span className="text-sm font-medium">
              {averageRating}/5 · {count} avis
            </span>
          </div>
        )}
      </div>

      <Card className="p-6 md:p-8">
        <h3 className="font-semibold text-lg mb-4">Laisser une critique</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Note</label>
            <StarRating value={rating} onChange={setRating} />
            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Nom *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Email *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Votre critique *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Ce que vous avez apprécié, les points à améliorer…"
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-background ${
                errors.content ? "border-red-500" : "border-border"
              }`}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gold text-primary hover:bg-gold-dark gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Envoyer
          </Button>
          <p className="text-xs text-muted-foreground">
            Votre avis sera publié après validation par l&apos;équipe.
          </p>
        </form>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune critique publiée pour le moment. Soyez le premier !
          </p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StarRating value={review.rating} readOnly size="sm" />
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.content}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
