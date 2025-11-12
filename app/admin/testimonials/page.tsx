"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, MessageSquare, Send, CheckCircle2, XCircle, Clock, Search, Star, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TestimonialModal, TestimonialFormData } from "@/components/admin/testimonial-modal"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"
import { Avatar } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Testimonial {
  id: string
  name: string
  email: string
  role: string | null
  content: string
  photoUrl: string | null
  rating: number
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "PUBLISHED" | "REJECTED"
  token: string | null
  tokenExpiresAt: string | null
  submittedAt: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    loadTestimonials()
  }, [statusFilter, searchQuery])

  const loadTestimonials = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const res = await fetch(`/api/admin/testimonials?${params.toString()}`)
      if (!res.ok) throw new Error("Erreur lors du chargement")

      const data = await res.json()
      if (data.success) {
        setTestimonials(data.data || [])
      }
    } catch (error) {
      console.error("[Admin] Erreur chargement témoignages:", error)
      toast.error("Impossible de charger les témoignages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (formData: TestimonialFormData) => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création")
      }

      if (data.success) {
        toast.success("Témoignage créé avec succès")
        
        // Afficher le lien du formulaire
        const formUrl = `${window.location.origin}/testimonials/submit?token=${data.data.token}`
        toast.info(
          <div className="space-y-2">
            <p className="font-semibold">Lien du formulaire généré :</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted p-2 rounded flex-1 break-all">{formUrl}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(formUrl)
                  toast.success("Lien copié !")
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>,
          { duration: 10000 }
        )

        loadTestimonials()
        setIsModalOpen(false)
      }
    } catch (error: any) {
      console.error("[Admin] Erreur création témoignage:", error)
      toast.error(error.message || "Erreur lors de la création du témoignage")
    }
  }

  const handleUpdate = async (id: string, formData: Partial<TestimonialFormData>) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      if (data.success) {
        toast.success("Témoignage mis à jour avec succès")
        loadTestimonials()
        setIsModalOpen(false)
        setEditingTestimonial(null)
      }
    } catch (error: any) {
      console.error("[Admin] Erreur mise à jour témoignage:", error)
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      if (data.success) {
        toast.success("Témoignage supprimé avec succès")
        loadTestimonials()
      }
    } catch (error: any) {
      console.error("[Admin] Erreur suppression témoignage:", error)
      toast.error(error.message || "Erreur lors de la suppression")
    }
  }

  const handleStatusChange = async (id: string, newStatus: Testimonial["status"]) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      if (data.success) {
        toast.success("Statut mis à jour avec succès")
        loadTestimonials()
      }
    } catch (error: any) {
      console.error("[Admin] Erreur changement statut:", error)
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const copyFormLink = (token: string | null) => {
    if (!token) {
      toast.error("Aucun token disponible")
      return
    }

    const formUrl = `${window.location.origin}/testimonials/submit?token=${token}`
    navigator.clipboard.writeText(formUrl)
    setCopiedToken(token)
    toast.success("Lien copié dans le presse-papiers !")
    
    setTimeout(() => {
      setCopiedToken(null)
    }, 2000)
  }

  const getStatusBadge = (status: Testimonial["status"]) => {
    const badges = {
      PENDING: { label: "En attente", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
      SUBMITTED: { label: "Soumis", icon: MessageSquare, className: "bg-blue-100 text-blue-800" },
      APPROVED: { label: "Approuvé", icon: CheckCircle2, className: "bg-green-100 text-green-800" },
      PUBLISHED: { label: "Publié", icon: CheckCircle2, className: "bg-green-600 text-white" },
      REJECTED: { label: "Rejeté", icon: XCircle, className: "bg-red-100 text-red-800" },
    }

    const badge = badges[status]
    const Icon = badge.icon

    return (
      <Badge className={badge.className}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    )
  }

  if (isLoading) {
    return <PageSkeleton type="default" showHeader={true} />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des témoignages</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les témoignages clients et envoyez des formulaires de témoignage
          </p>
          <p className="text-sm text-blue-600 mt-2 font-medium">
            💡 Rappel : Seuls les témoignages avec le statut "Publié" apparaissent sur le site public
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTestimonial(null)
            setIsModalOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau témoignage
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, email ou contenu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="SUBMITTED">Soumis</SelectItem>
            <SelectItem value="APPROVED">Approuvé</SelectItem>
            <SelectItem value="PUBLISHED">Publié</SelectItem>
            <SelectItem value="REJECTED">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des témoignages */}
      {testimonials.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Aucun témoignage</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== "all"
              ? "Aucun témoignage ne correspond à vos critères."
              : "Commencez par créer un nouveau témoignage et envoyez le formulaire à un client."}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer un témoignage
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar
                  src={testimonial.photoUrl}
                  name={testimonial.name}
                  size="lg"
                  className="flex-shrink-0"
                />

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                      {testimonial.role && (
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{testimonial.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(testimonial.status)}
                    </div>
                  </div>

                  {/* Note */}
                  {testimonial.rating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? "text-gold fill-gold"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {testimonial.rating}/5
                      </span>
                    </div>
                  )}

                  {/* Contenu du témoignage */}
                  {testimonial.content ? (
                    <p className="text-foreground mb-4 line-clamp-3">{testimonial.content}</p>
                  ) : (
                    <p className="text-muted-foreground italic mb-4">
                      Témoignage en attente de soumission
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {testimonial.status === "PENDING" && testimonial.token && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyFormLink(testimonial.token)}
                        className="gap-2"
                      >
                        {copiedToken === testimonial.token ? (
                          <>
                            <Check className="w-4 h-4" />
                            Lien copié
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Copier le lien du formulaire
                          </>
                        )}
                      </Button>
                    )}

                    {testimonial.status === "SUBMITTED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(testimonial.id, "APPROVED")}
                          className="gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(testimonial.id, "REJECTED")}
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeter
                        </Button>
                      </>
                    )}

                    {testimonial.status === "APPROVED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(testimonial.id, "PUBLISHED")}
                        className="gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Publier
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTestimonial(testimonial)
                        setIsModalOpen(true)
                      }}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(testimonial.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTestimonial(null)
        }}
        onSubmit={editingTestimonial ? (data) => handleUpdate(editingTestimonial.id, data) : handleCreate}
        initialData={editingTestimonial}
      />
    </div>
  )
}

