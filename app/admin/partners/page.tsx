/**
 * @file app/admin/partners/page.tsx
 * @description Gestion des partenaires - Affichage, ajout, modification, suppression
 * @todo Intégrer avec l'API backend pour les opérations CRUD
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Handshake, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"

interface Partner {
  id: string
  name: string
  logo: string
  website?: string
  description: string
  category: string
}

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Partenaire 1",
    logo: "/placeholder.svg",
    website: "https://partner1.com",
    description: "Description du partenaire",
    category: "Sponsor",
  },
]

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setIsLoading(true)
        // @todo Remplacer par un appel API réel
        // const res = await fetch('/api/admin/partners')
        // if (!res.ok) throw new Error('Failed to load partners')
        // const data = await res.json()
        // setPartners(data)
        
        // Simulation d'un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 500))
        setPartners(mockPartners)
      } catch (err) {
        console.error('[Admin] Erreur chargement partenaires:', err)
        toast.error('Impossible de charger les partenaires')
      } finally {
        setIsLoading(false)
      }
    }
    loadPartners()
  }, [])

  const filteredPartners = partners.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Supprimer ce partenaire ?")) return
      
    // @todo Appeler l'API pour supprimer
      // const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' })
      // if (!res.ok) throw new Error('Failed to delete partner')
      
      setPartners(partners.filter((p) => p.id !== id))
      toast.success('Partenaire supprimé avec succès')
    } catch (err) {
      console.error('[Admin] Erreur suppression partenaire:', err)
      toast.error('Erreur lors de la suppression du partenaire')
    }
  }

  if (isLoading) {
    return <PageSkeleton type="grid" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Partenaires</h1>
          <p className="text-muted-foreground mt-1">{partners.length} partenaires gérés</p>
        </div>
        <Button size="lg" className="gap-2">
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
            <Card key={partner.id} className="p-4">
              <img src={partner.logo || "/placeholder.svg"} alt={partner.name} className="h-20 object-contain mb-4" />
              <h3 className="font-semibold">{partner.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{partner.description}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit2 className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(partner.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Aucun partenaire trouvé</p>
          </Card>
        )}
      </div>
    </div>
  )
}
