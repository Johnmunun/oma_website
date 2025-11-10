/**
 * @file app/admin/events/page.tsx
 * @description Gestion complète des événements avec filtres, recherche et actions
 * Fonctionnalités: Créer, modifier, supprimer, filtrer par statut et type
 * @todo Intégrer avec l'API backend (app/api/events)
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Calendar, MapPin, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EventModal } from "@/components/admin/event-modal"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { ShareButtons } from "@/components/admin/share-buttons"
import { toast } from "sonner"

/**
 * Interface pour les événements (basée sur le schéma Prisma)
 */
interface AdminEvent {
  id: string
  title: string
  slug: string
  description: string | null
  type: string | null
  status: "DRAFT" | "PUBLISHED" | "CANCELLED"
  imageUrl: string | null
  location: string | null
  startsAt: string | null
  endsAt: string | null
  metaTitle: string | null
  metaDesc: string | null
  showOnBanner: boolean
  registrations: number
  createdAt: string
  updatedAt: string
}


/**
 * Composant StatutBadge - Affiche l'état d'un événement avec couleur
 */
function StatutBadge({
  status,
  type,
}: {
  status: AdminEvent["status"]
  type: AdminEvent["type"]
}) {
  const statusConfig = {
    DRAFT: { bg: "bg-gray-100", text: "text-gray-800", label: "Brouillon" },
    PUBLISHED: { bg: "bg-green-100", text: "text-green-800", label: "Publié" },
    CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Annulé" },
  }

  const typeLabel = type || "Non défini"
  const config = statusConfig[status]

  return (
    <div className="flex gap-2 flex-wrap">
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
      {type && (
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
          {type}
        </span>
      )}
    </div>
  )
}

/**
 * Composant CarteLigne - Affiche un événement en format ligne enrichi
 */
function EventRow({
  event,
  onEdit,
  onDelete,
}: {
  event: AdminEvent
  onEdit: (event: AdminEvent) => void
  onDelete: (id: string) => void
}) {
  // Générer l'URL de l'événement
  const eventUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/events/${event.slug}`
    : ""

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date non définie"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Image (si disponible) */}
        {event.imageUrl && (
          <div className="md:col-span-2">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-24 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Titre et info principale */}
        <div className={`${event.imageUrl ? "md:col-span-3" : "md:col-span-4"}`}>
          <h3 className="font-semibold text-base">{event.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description || "Aucune description"}</p>
        </div>

        {/* Date et type */}
        <div className="md:col-span-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startsAt)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {/* Registrations et statut */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{event.registrations} inscriptions</span>
          </div>
          <StatutBadge status={event.status} type={event.type} />
        </div>

        {/* Actions */}
        <div className="md:col-span-3 flex gap-2 justify-end flex-wrap">
          <ShareButtons
            url={eventUrl}
            title={event.title}
            description={event.description || undefined}
            imageUrl={event.imageUrl || undefined}
            className="hidden md:inline-flex"
          />
          <Button variant="outline" size="sm" onClick={() => onEdit(event)} className="gap-2">
            <Edit2 className="w-4 h-4" />
            Modifier
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | AdminEvent["status"]>("all")
  const [filterType, setFilterType] = useState<"all" | AdminEvent["type"]>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminEvent | undefined>()

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/admin/events')
        if (!res.ok) throw new Error('Failed to load events')
        const data = await res.json()
        if (data.success && data.data) {
          setEvents(data.data)
        } else {
          throw new Error(data.error || 'Erreur inconnue')
        }
      } catch (err: any) {
        console.error('[Admin] Erreur chargement événements:', err)
        toast.error(err.message || 'Impossible de charger les événements')
      } finally {
        setIsLoading(false)
      }
    }
    loadEvents()
  }, [])

  /**
   * Filtrer les événements selon les critères sélectionnés
   */
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    const matchesType = filterType === "all" || 
      (filterType === "online" && event.location?.toLowerCase().includes("online")) ||
      (filterType === "inperson" && event.location && !event.location.toLowerCase().includes("online"))
    return matchesSearch && matchesStatus && matchesType
  })

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return
      
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete event')
      }
      
      setEvents(events.filter((e) => e.id !== id))
      toast.success('Événement supprimé avec succès')
    } catch (err: any) {
      console.error('[Admin] Erreur suppression événement:', err)
      toast.error(err.message || 'Erreur lors de la suppression de l\'événement')
    }
  }

  const handleEditEvent = (event: AdminEvent) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEvent(undefined)
  }

  const handleSubmitEvent = async (formData: any) => {
    try {
      let res
      if (editingEvent) {
        // Modification
        res = await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        const responseData = await res.json()
        
        if (!res.ok) {
          const errorMessage = responseData.error || responseData.message || 'Erreur lors de la mise à jour de l\'événement'
          throw new Error(errorMessage)
        }
        
        if (responseData.success && responseData.data) {
          setEvents(events.map((e) => (e.id === editingEvent.id ? responseData.data : e)))
          toast.success('Événement modifié avec succès')
        }
      } else {
        // Création
        res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        const responseData = await res.json()
        
        if (!res.ok) {
          const errorMessage = responseData.error || responseData.message || 'Erreur lors de la création de l\'événement'
          throw new Error(errorMessage)
        }
        
        if (responseData.success && responseData.data) {
          setEvents([responseData.data, ...events])
          toast.success('Événement créé avec succès')
        }
      }
      setIsModalOpen(false)
      setEditingEvent(undefined)
    } catch (err: any) {
      console.error('[Admin] Erreur sauvegarde événement:', err)
      toast.error(err.message || 'Erreur lors de la sauvegarde de l\'événement')
    }
  }

  if (isLoading) {
    return <PageSkeleton type="default" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout en évidence */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Événements</h1>
          <p className="text-muted-foreground mt-1">{events.length} événements au total</p>
        </div>
        <Button
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 shadow-lg hover:shadow-xl transition-all animate-pulse"
        >
          <Plus className="w-5 h-5" />
          Nouvel événement
        </Button>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEvent}
        initialData={editingEvent}
      />

      {/* Section de recherche et filtres */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre statut */}
            <div>
              <label className="text-sm font-medium block mb-2">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>

            {/* Filtre type */}
            <div>
              <label className="text-sm font-medium block mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="online">En ligne</option>
                <option value="inperson">Présentiel</option>
              </select>
            </div>

            {/* Compteur */}
            <div className="flex items-end">
              <span className="text-sm text-muted-foreground">{filteredEvents.length} événement(s) trouvé(s)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des événements */}
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventRow key={event.id} event={event} onEdit={handleEditEvent} onDelete={handleDelete} />
          ))
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">Aucun événement trouvé</p>
            <p className="text-sm text-muted-foreground mt-2">Créez un nouvel événement pour commencer</p>
          </Card>
        )}
      </div>
    </div>
  )
}
