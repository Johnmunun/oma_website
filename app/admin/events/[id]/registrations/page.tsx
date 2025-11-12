"use client"

/**
 * @file app/admin/events/[id]/registrations/page.tsx
 * @description Page admin pour voir et gérer toutes les inscriptions d'un événement
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Users, Mail, Phone, Calendar, Download, Search, UserPlus } from 'lucide-react'
import { ManualRegistrationModal } from '@/components/admin/manual-registration-modal'
import { toast } from 'sonner'
import { PageSkeleton } from '@/components/admin/page-skeleton'

interface Registration {
  id: string
  fullName: string
  email: string
  phone: string | null
  notes: string | null
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'
  createdAt: string
  updatedAt: string
}

interface Event {
  id: string
  title: string
  slug: string
}

export default function EventRegistrationsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Charger l'événement
        const eventRes = await fetch(`/api/admin/events/${eventId}`)
        if (eventRes.ok) {
          const eventData = await eventRes.json()
          if (eventData.success && eventData.data) {
            setEvent(eventData.data)
          }
        }

        // Charger les inscriptions
        const regRes = await fetch(`/api/admin/events/${eventId}/registrations`)
        if (regRes.ok) {
          const regData = await regRes.json()
          if (regData.success && regData.data) {
            setRegistrations(regData.data)
          }
        }
      } catch (err) {
        console.error('[EventRegistrationsPage] Erreur:', err)
        toast.error('Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      loadData()
    }
  }, [eventId])

  const filteredRegistrations = registrations.filter((reg) => {
    const search = searchTerm.toLowerCase()
    return (
      reg.fullName.toLowerCase().includes(search) ||
      reg.email.toLowerCase().includes(search) ||
      (reg.phone && reg.phone.toLowerCase().includes(search))
    )
  })

  const exportCSV = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Statut', 'Date d\'inscription', 'Notes']
    const rows = filteredRegistrations.map((reg) => [
      reg.fullName,
      reg.email,
      reg.phone || '',
      reg.status,
      new Date(reg.createdAt).toLocaleDateString('fr-FR'),
      reg.notes || '',
    ])

    const csv = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inscriptions-${event?.slug || 'event'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Export CSV réussi')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: Registration['status']) => {
    const config = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmée' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      REFUNDED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Remboursée' },
    }
    const c = config[status]
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    )
  }

  if (isLoading) {
    return <PageSkeleton type="default" showHeader={true} />
  }

  if (!event) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Événement non trouvé</p>
          <Button onClick={() => router.push('/admin/events')} className="mt-4">
            Retour aux événements
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/events')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground mt-1">
              {registrations.length} inscription{registrations.length !== 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsRegistrationModalOpen(true)}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Inscrire quelqu'un
          </Button>
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Recherche */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Liste des inscriptions */}
      <div className="space-y-3">
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((reg) => (
            <Card key={reg.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{reg.fullName}</span>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{reg.email}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  {reg.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{reg.phone}</span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  {getStatusBadge(reg.status)}
                </div>
                <div className="md:col-span-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(reg.createdAt)}</span>
                  </div>
                </div>
              </div>
              {reg.notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notes :</strong> {reg.notes}
                  </p>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">
              {searchTerm ? 'Aucune inscription trouvée' : 'Aucune inscription pour le moment'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsRegistrationModalOpen(true)}
                className="mt-4 gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Inscrire quelqu'un
              </Button>
            )}
          </Card>
        )}
      </div>

      <ManualRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        eventId={eventId}
        eventTitle={event.title}
        onSuccess={() => {
          // Recharger les inscriptions
          const loadRegistrations = async () => {
            const res = await fetch(`/api/admin/events/${eventId}/registrations`)
            if (res.ok) {
              const data = await res.json()
              if (data.success && data.data) {
                setRegistrations(data.data)
              }
            }
          }
          loadRegistrations()
        }}
      />
    </div>
  )
}

