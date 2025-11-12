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
  bio: string | null
  photoUrl: string | null
  xUrl: string | null
  linkedinUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/admin/team', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load team')
        
        const data = await res.json()
        if (data.success && data.data) {
          setTeam(data.data)
        }
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
      
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete member')
      }
      
      setTeam(team.filter((m) => m.id !== id))
      toast.success('Membre supprimé avec succès')
    } catch (err: any) {
      console.error('[Admin] Erreur suppression membre:', err)
      toast.error(err.message || 'Erreur lors de la suppression du membre')
    }
  }

  const handleSubmitMember = async (data: any) => {
    try {
      const url = editingMember 
        ? `/api/admin/team/${editingMember.id}`
        : '/api/admin/team'
      const method = editingMember ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save member')
      }
      
      const responseData = await res.json()
      if (responseData.success) {
        // Recharger la liste
        const loadTeam = async () => {
          const res = await fetch('/api/admin/team', { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.data) {
              setTeam(data.data)
            }
          }
        }
        await loadTeam()
        
        toast.success(editingMember ? 'Membre modifié avec succès' : 'Membre ajouté avec succès')
        setIsModalOpen(false)
        setEditingMember(null)
      }
    } catch (err: any) {
      console.error('[Admin] Erreur sauvegarde membre:', err)
      toast.error(err.message || 'Erreur lors de la sauvegarde du membre')
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingMember(null)
    setIsModalOpen(true)
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
        <Button size="lg" className="gap-2" onClick={handleAdd}>
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
              <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
                {member.photoUrl ? (
                  <img 
                    src={member.photoUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users2 className="w-16 h-16 text-muted-foreground opacity-30" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
                {member.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{member.bio}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-transparent"
                    onClick={() => handleEdit(member)}
                  >
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

      <TeamModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setEditingMember(null)
        }} 
        onSubmit={handleSubmitMember}
        initialData={editingMember}
      />
    </div>
  )
}
