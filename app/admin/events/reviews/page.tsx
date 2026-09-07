"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Star,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"

interface EventReviewRow {
  id: string
  eventId: string
  name: string
  email: string
  rating: number
  content: string
  status: "PENDING" | "PUBLISHED" | "REJECTED"
  createdAt: string
  event: { id: string; title: string; slug: string }
}

const statusConfig = {
  PENDING: { label: "En attente", className: "bg-amber-100 text-amber-800" },
  PUBLISHED: { label: "Publié", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejeté", className: "bg-red-100 text-red-800" },
}

export default function AdminEventReviewsPage() {
  const [reviews, setReviews] = useState<EventReviewRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [searchQuery, setSearchQuery] = useState("")

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchQuery.trim()) params.append("search", searchQuery.trim())

      const res = await fetch(`/api/admin/event-reviews?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur de chargement")
      setReviews(data.data || [])
    } catch (err: any) {
      console.error("[Admin] Erreur critiques:", err)
      toast.error(err.message || "Impossible de charger les critiques")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [statusFilter])

  const handleStatus = async (id: string, status: "PUBLISHED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/event-reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur")
      toast.success(status === "PUBLISHED" ? "Critique publiée" : "Critique rejetée")
      loadReviews()
    } catch (err: any) {
      toast.error(err.message || "Action impossible")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cette critique ?")) return
    try {
      const res = await fetch(`/api/admin/event-reviews/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur")
      toast.success("Critique supprimée")
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      toast.error(err.message || "Suppression impossible")
    }
  }

  if (isLoading && reviews.length === 0) {
    return <PageSkeleton type="default" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux événements
          </Link>
          <h1 className="text-3xl font-bold">Critiques d&apos;événements</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Modération des appréciations publiques (note + commentaire)
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher (nom, email, événement…)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadReviews()}
              className="pl-10"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm h-10"
            >
              <option value="PENDING">En attente</option>
              <option value="PUBLISHED">Publiés</option>
              <option value="REJECTED">Rejetés</option>
              <option value="all">Tous</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={loadReviews}>
            Actualiser
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">Aucune critique</p>
          </Card>
        ) : (
          reviews.map((review) => {
            const cfg = statusConfig[review.status]
            return (
              <Card key={review.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{review.name}</span>
                      <span className="text-sm text-muted-foreground">{review.email}</span>
                      <Badge className={cfg.className}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{review.content}</p>
                    <p className="text-xs text-muted-foreground">
                      Événement :{" "}
                      <Link
                        href={`/events/${review.event.slug}`}
                        target="_blank"
                        className="underline hover:text-foreground"
                      >
                        {review.event.title}
                      </Link>
                      {" · "}
                      {new Date(review.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {review.status !== "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-green-700"
                        onClick={() => handleStatus(review.id, "PUBLISHED")}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approuver
                      </Button>
                    )}
                    {review.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-amber-700"
                        onClick={() => handleStatus(review.id, "REJECTED")}
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
