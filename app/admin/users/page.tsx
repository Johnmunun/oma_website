/**
 * @file app/admin/users/page.tsx
 * @description Gestion des utilisateurs - Voir les inscrits, gérer les rôles
 * @todo Intégrer avec l'API pour l'authentification et les rôles
 */

"use client"

import { useState, useEffect } from "react"
import { Edit2, Trash2, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "moderator"
  joinedAt: string
  status: "active" | "inactive" | "banned"
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin OMA",
    email: "admin@oma.com",
    role: "admin",
    joinedAt: "2025-01-01",
    status: "active",
  },
  {
    id: "2",
    name: "Utilisateur Test",
    email: "user@example.com",
    role: "user",
    joinedAt: "2025-02-01",
    status: "active",
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        // @todo Remplacer par un appel API réel
        // const res = await fetch('/api/admin/users')
        // if (!res.ok) throw new Error('Failed to load users')
        // const data = await res.json()
        // setUsers(data)
        
        // Simulation d'un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 500))
        setUsers(mockUsers)
      } catch (err) {
        console.error('[Admin] Erreur chargement utilisateurs:', err)
        toast.error('Impossible de charger les utilisateurs')
      } finally {
        setIsLoading(false)
      }
    }
    loadUsers()
  }, [])

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Supprimer cet utilisateur ?")) return
      
    // @todo Appeler l'API pour supprimer l'utilisateur
      // const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      // if (!res.ok) throw new Error('Failed to delete user')
      
      setUsers(users.filter((u) => u.id !== id))
      toast.success('Utilisateur supprimé avec succès')
    } catch (err) {
      console.error('[Admin] Erreur suppression utilisateur:', err)
      toast.error('Erreur lors de la suppression de l\'utilisateur')
    }
  }

  if (isLoading) {
    return <PageSkeleton type="table" showHeader={true} showFilters={true} />
  }

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    moderator: "bg-yellow-100 text-yellow-800",
    user: "bg-blue-100 text-blue-800",
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    banned: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">{users.length} utilisateurs totaux</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-medium">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Rôle</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Inscrit le</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.joinedAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
