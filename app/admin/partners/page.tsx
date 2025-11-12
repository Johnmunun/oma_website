/**
 * @file app/admin/partners/page.tsx
 * @description Gestion des partenaires - Affichage, ajout, modification, suppression
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Handshake, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PartnerModal, PartnerFormData } from "@/components/admin/partner-modal"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"

interface Partner {
  id: string
  name: string
  logoUrl: string | null
  url: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/partners', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load partners')
      
      const data = await res.json()
      if (data.success && data.data) {
        setPartners(data.data)
      }
    } catch (err) {
      console.error('[Admin] Erreur chargement partenaires:', err)
      toast.error('Impossible de charger les partenaires')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPartners = partners.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (formData: PartnerFormData) => {
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      if (data.success) {
        toast.success('Partenaire créé avec succès')
        loadPartners()
        setIsModalOpen(false)
      }
    } catch (error: any) {
      console.error('[Admin] Erreur création partenaire:', error)
      toast.error(error.message || 'Erreur lors de la création du partenaire')
    }
  }

  const handleUpdate = async (id: string, formData: Partial<PartnerFormData>) => {
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      if (data.success) {
        toast.success('Partenaire mis à jour avec succès')
        loadPartners()
        setIsModalOpen(false)
        setEditingPartner(null)
      }
    } catch (error: any) {
      console.error('[Admin] Erreur mise à jour partenaire:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) return
      
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete partner')
      }
      
      const data = await res.json()
      if (data.success) {
        toast.success('Partenaire supprimé avec succès')
        loadPartners()
      }
    } catch (err: any) {
      console.error('[Admin] Erreur suppression partenaire:', err)
      toast.error(err.message || 'Erreur lors de la suppression du partenaire')
    }
  }

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPartner(null)
  }

  if (isLoading) {
    return <PageSkeleton type="grid" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Partenaires</h1>
          <p className="text-muted-foreground mt-1">
            {filteredPartners.length} partenaire{filteredPartners.length !== 1 ? 's' : ''} affiché{filteredPartners.length !== 1 ? 's' : ''} / {partners.length} au total
          </p>
        </div>
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => {
            setEditingPartner(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-5 h-5" />
          Ajouter un partenaire
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un partenaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.length > 0 ? (
          filteredPartners.map((partner) => (
            <Card key={partner.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Logo */}
                {partner.logoUrl ? (
                  <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-lg p-4">
                    <img 
                      src={partner.logoUrl} 
                      alt={partner.name} 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-lg">
                    <Handshake className="w-12 h-12 text-muted-foreground opacity-50" />
                  </div>
                )}

                {/* Nom */}
                <div>
                  <h3 className="font-semibold text-lg">{partner.name}</h3>
                  {partner.url && (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 justify-center mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visiter le site
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(partner)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(partner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Aucun partenaire</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "Aucun partenaire ne correspond à votre recherche."
                : "Commencez par ajouter un partenaire."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un partenaire
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Modal */}
      <PartnerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={
          editingPartner
            ? (data) => handleUpdate(editingPartner.id, data)
            : handleCreate
        }
        initialData={editingPartner}
      />
    </div>
  )
}
