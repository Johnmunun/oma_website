/**
 * @file app/admin/team/page.tsx
 * @description Gestion de l'équipe et des membres - Affichage, ajout, modification
 * @todo Intégrer avec l'API backend pour la gestion des membres
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Users2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TeamModal } from "@/components/admin/team-modal"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string
  email?: string
  phone?: string
}

const mockTeam: TeamMember[] = [
  {
    id: "1",
    name: "Coach Bin Adan",
    role: "CEO International",
    bio: "Expert en communication et leadership",
    image: "/placeholder.svg",
    email: "coach@oma.com",
  },
]

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setIsLoading(true)
        // @todo Remplacer par un appel API réel
        // const res = await fetch('/api/admin/team')
        // if (!res.ok) throw new Error('Failed to load team')
        // const data = await res.json()
        // setTeam(data)
        
        // Simulation d'un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 500))
        setTeam(mockTeam)
      } catch (err) {
        console.error('[Admin] Erreur chargement équipe:', err)
        toast.error('Impossible de charger l\'équipe')
      } finally {
        setIsLoading(false)
      }
    }
    loadTeam()
  }, [])

  const filteredTeam = team.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Supprimer ce membre ?")) return
      
    // @todo Appeler l'API pour supprimer
      // const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' })
      // if (!res.ok) throw new Error('Failed to delete member')
      
      setTeam(team.filter((m) => m.id !== id))
      toast.success('Membre supprimé avec succès')
    } catch (err) {
      console.error('[Admin] Erreur suppression membre:', err)
      toast.error('Erreur lors de la suppression du membre')
    }
  }

  const handleAddMember = async (data: any) => {
    try {
      // @todo Appeler l'API backend pour créer le membre
      // const res = await fetch('/api/admin/team', {
      //   method: 'POST',
      //   body: JSON.stringify(data)
      // })
      // if (!res.ok) throw new Error('Failed to create member')
      
    const newMember: TeamMember = {
      id: String(team.length + 1),
      ...data,
      image: data.image ? URL.createObjectURL(data.image) : "/placeholder.svg",
    }
    setTeam([...team, newMember])
      toast.success('Membre ajouté avec succès')
      setIsModalOpen(false)
    } catch (err) {
      console.error('[Admin] Erreur ajout membre:', err)
      toast.error('Erreur lors de l\'ajout du membre')
    }
  }

  if (isLoading) {
    return <PageSkeleton type="grid" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Équipe</h1>
          <p className="text-muted-foreground mt-1">{team.length} membres d'équipe</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Ajouter un membre
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un membre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeam.length > 0 ? (
          filteredTeam.map((member) => (
            <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <img src={member.image || "/placeholder.svg"} alt={member.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{member.bio}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(member.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <Users2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Aucun membre trouvé</p>
          </Card>
        )}
      </div>

      <TeamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddMember} />
    </div>
  )
}
