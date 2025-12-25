/**
 * @file app/admin/events/page.tsx
 * @description Gestion complète des événements avec filtres, recherche et actions
 * Fonctionnalités: Créer, modifier, supprimer, filtrer par statut et type
 * @todo Intégrer avec l'API backend (app/api/events)
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Calendar, MapPin, Users, Search, UserPlus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EventModal } from "@/components/admin/event-modal"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { ShareButtons } from "@/components/admin/share-buttons"
import { ManualRegistrationModal } from "@/components/admin/manual-registration-modal"
import { ShareRegistrationForm } from "@/components/admin/share-registration-form"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

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
 * Fonction pour déterminer si un événement est à venir ou passé
 */
function getEventTimeStatus(startsAt: string | null): "upcoming" | "past" | "unknown" {
  if (!startsAt) return "unknown"
  const now = new Date()
  const eventDate = new Date(startsAt)
  return eventDate >= now ? "upcoming" : "past"
}

/**
 * Composant StatutBadge - Affiche l'état d'un événement avec couleur
 */
function StatutBadge({
  status,
  type,
  startsAt,
}: {
  status: AdminEvent["status"]
  type: AdminEvent["type"]
  startsAt: string | null
}) {
  const statusConfig = {
    DRAFT: { bg: "bg-gray-100", text: "text-gray-800", label: "Brouillon" },
    PUBLISHED: { bg: "bg-green-100", text: "text-green-800", label: "Publié" },
    CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Annulé" },
  }

  const timeStatus = getEventTimeStatus(startsAt)
  const config = statusConfig[status]

  return (
    <div className="flex gap-2 flex-wrap">
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
      {/* Badge "À venir" uniquement pour les événements à venir avec dégradé jaune */}
      {timeStatus === "upcoming" && (
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-sm">
          À venir
        </span>
      )}
      {type && (
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
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
  onRegister,
  onOpenForm,
  canEdit,
}: {
  event: AdminEvent
  onEdit: (event: AdminEvent) => void
  onDelete: (id: string) => void
  onRegister: (event: AdminEvent) => void
  onOpenForm: (event: AdminEvent) => void
  canEdit: boolean
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

  // Vérifier si l'événement est passé
  const isPast = event.startsAt ? new Date(event.startsAt) < new Date() : false

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/admin/events/${event.id}/registrations`}
              className="h-auto p-0 text-sm font-medium hover:underline"
            >
              {event.registrations} inscription{event.registrations !== 1 ? 's' : ''}
            </Button>
          </div>
          <StatutBadge status={event.status} type={event.type} startsAt={event.startsAt} />
        </div>

        {/* Actions */}
        <div className="md:col-span-3 flex gap-2 justify-end flex-wrap">
          {/* Boutons Inscription et Partager uniquement pour les événements à venir */}
          {!isPast && (
            <>
              <ShareButtons
                url={eventUrl}
                title={event.title}
                description={event.description || undefined}
                imageUrl={event.imageUrl || undefined}
                className="hidden md:inline-flex"
              />
              {/* Actions d'inscription - seulement pour ADMIN et EDITOR */}
              {canEdit && event.status === "PUBLISHED" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRegister(event)}
                    className="gap-2"
                    title="Inscrire quelqu'un manuellement (par téléphone, etc.)"
                  >
                    <UserPlus className="w-4 h-4" />
                    Inscrire manuellement
                  </Button>
                  <ShareRegistrationForm
                    eventSlug={event.slug}
                    eventTitle={event.title}
                    className="hidden md:inline-flex"
                  />
                </>
              )}
            </>
          )}
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={() => onEdit(event)} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function AdminEventsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const isAdmin = userRole === "ADMIN"
  const isEditor = userRole === "EDITOR"
  const isViewer = userRole === "VIEWER"
  const canEdit = isAdmin || isEditor // Les EDITOR peuvent créer/modifier, les VIEWER seulement voir
  
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | AdminEvent["status"]>("all")
  const [filterType, setFilterType] = useState<"all" | AdminEvent["type"]>("all")
  const [filterTime, setFilterTime] = useState<"all" | "upcoming" | "past">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminEvent | undefined>()
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<AdminEvent | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const itemsPerPage = 5

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        })
        
        if (filterStatus !== "all") {
          params.append("status", filterStatus)
        }
        
        if (searchTerm) {
          params.append("search", searchTerm)
        }
        
        const res = await fetch(`/api/admin/events?${params.toString()}`)
        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.error || `Erreur ${res.status}: Failed to load events`)
        }
        
        if (data.success && data.data) {
          setEvents(data.data)
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages)
            setTotalEvents(data.pagination.total)
          }
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
  }, [currentPage, filterStatus, searchTerm, itemsPerPage])

  /**
   * Filtrer les événements selon les critères sélectionnés (filtres côté client)
   */
  const filteredEvents = events.filter((event) => {
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    const matchesType = filterType === "all" || 
      (filterType === "online" && event.location?.toLowerCase().includes("online")) ||
      (filterType === "inperson" && event.location && !event.location.toLowerCase().includes("online"))
    const matchesTime = filterTime === "all" || getEventTimeStatus(event.startsAt) === filterTime
    return matchesStatus && matchesType && matchesTime
  })
  
  // Réinitialiser la page quand on change les filtres
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, filterType, filterTime, searchTerm])

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
          <p className="text-muted-foreground mt-1 text-sm">
            {filteredEvents.length} événement(s) affiché(s) / {totalEvents} au total
          </p>
        </div>
        {canEdit && (
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="gap-2 shadow-lg hover:shadow-xl transition-all animate-pulse"
          >
            <Plus className="w-5 h-5" />
            Nouvel événement
          </Button>
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEvent}
        initialData={editingEvent}
      />

      <ManualRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false)
          setSelectedEventForRegistration(undefined)
        }}
        eventId={selectedEventForRegistration?.id || ''}
        eventTitle={selectedEventForRegistration?.title || ''}
        onSuccess={() => {
          // Recharger les événements pour mettre à jour le compteur d'inscriptions
          const loadEvents = async () => {
            try {
              const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
              })
              if (filterStatus !== "all") {
                params.append("status", filterStatus)
              }
              if (searchTerm) {
                params.append("search", searchTerm)
              }
              const res = await fetch(`/api/admin/events?${params.toString()}`)
              if (res.ok) {
                const data = await res.json()
                if (data.success && data.data) {
                  setEvents(data.data)
                }
              }
            } catch (err) {
              console.error('[Admin] Erreur rechargement:', err)
            }
          }
          loadEvents()
        }}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Filtre temps (À venir / Passé) */}
            <div>
              <label className="text-sm font-medium block mb-2">Période</label>
              <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="all">Tous</option>
                <option value="upcoming">À venir</option>
                <option value="past">Passé</option>
              </select>
            </div>

          </div>
        </div>
      </Card>

      {/* Liste des événements */}
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          <>
            {filteredEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDelete}
                onRegister={(event) => {
                  setSelectedEventForRegistration(event)
                  setIsRegistrationModalOpen(true)
                }}
                onOpenForm={(event) => {
                  const registerUrl = `/events/${event.slug}/register`
                  window.open(registerUrl, '_blank')
                }}
                canEdit={canEdit}
              />
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({totalEvents} événement(s) au total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
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
