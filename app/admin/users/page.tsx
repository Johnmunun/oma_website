"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Users, Search, Shield, Eye, FileEdit, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserModal, UserFormData } from "@/components/admin/user-modal"
import { AssignRoleModal } from "@/components/admin/assign-role-modal"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { useAdminPermissions } from "@/hooks/use-admin-permissions"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface UserRbacRole {
  membershipId: string
  roleId: string
  roleName: string
  roleSlug: string
  isRoot: boolean
  structureId: string
  structureName: string
}

interface User {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "EDITOR" | "VIEWER"
  isRoot?: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  rbacRoles?: UserRbacRole[]
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const { can, loaded: permissionsLoaded } = useAdminPermissions()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assignUser, setAssignUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Vérifier que l'utilisateur est ADMIN
  useEffect(() => {
    if (session?.user && session.user.role !== "ADMIN") {
      toast.error("Accès refusé. Seuls les administrateurs peuvent gérer les utilisateurs.")
    }
  }, [session])

  useEffect(() => {
    loadUsers()
  }, [searchQuery, roleFilter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (roleFilter !== "all") {
        params.append("role", roleFilter)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Accès refusé. Seuls les administrateurs peuvent voir les utilisateurs.")
          return
        }
        throw new Error("Erreur lors du chargement")
      }

      const data = await res.json()
      if (data.success) {
        setUsers(data.data || [])
      }
    } catch (error) {
      console.error("[Admin] Erreur chargement utilisateurs:", error)
      toast.error("Impossible de charger les utilisateurs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (formData: UserFormData) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création")
      }

      if (data.success) {
        toast.success("Utilisateur créé avec succès")
        loadUsers()
        setIsModalOpen(false)
      }
    } catch (error: any) {
      console.error("[Admin] Erreur création utilisateur:", error)
      toast.error(error.message || "Erreur lors de la création de l'utilisateur")
    }
  }

  const handleUpdate = async (id: string, formData: Partial<UserFormData>) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      if (data.success) {
        toast.success("Utilisateur mis à jour avec succès")
        loadUsers()
        setIsModalOpen(false)
        setEditingUser(null)
      }
    } catch (error: any) {
      console.error("[Admin] Erreur mise à jour utilisateur:", error)
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      if (data.success) {
        toast.success("Utilisateur supprimé avec succès")
        loadUsers()
      }
    } catch (error: any) {
      console.error("[Admin] Erreur suppression utilisateur:", error)
      toast.error(error.message || "Erreur lors de la suppression")
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      if (data.success) {
        toast.success(`Utilisateur ${!isActive ? "activé" : "désactivé"} avec succès`)
        loadUsers()
      }
    } catch (error: any) {
      console.error("[Admin] Erreur changement statut:", error)
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const getLegacyRoleBadge = (role?: User["role"]) => {
    if (!role) return null
    const badges = {
      ADMIN: { label: "Legacy · Admin", icon: Shield, className: "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20" },
      EDITOR: { label: "Legacy · Éditeur", icon: FileEdit, className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20" },
      VIEWER: { label: "Legacy · Lecteur", icon: Eye, className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20" },
    } as const

    const badge = badges[role]
    if (!badge) return null
    const Icon = badge.icon

    return (
      <Badge variant="outline" className={badge.className}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    )
  }

  const renderUserRoles = (user: User) => {
    const rbacRoles = user.rbacRoles ?? []

    if (rbacRoles.length > 0) {
      return (
        <div className="flex flex-col gap-1.5">
          {rbacRoles.map((r) => (
            <div key={r.membershipId} className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={
                  r.isRoot
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30"
                    : "bg-primary/10 text-foreground border-border"
                }
              >
                <Shield className="w-3 h-3 mr-1" />
                {r.roleName}
                {r.isRoot ? " (ROOT)" : ""}
              </Badge>
              <span className="text-xs text-muted-foreground">{r.structureName}</span>
            </div>
          ))}
        </div>
      )
    }

    if (user.isRoot) {
      return (
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30">
          <Shield className="w-3 h-3 mr-1" />
          ROOT
        </Badge>
      )
    }

    return getLegacyRoleBadge(user.role) ?? (
      <span className="text-sm text-muted-foreground">Aucun rôle</span>
    )
  }

  // Vérifier les permissions
  const hasAccess =
    permissionsLoaded
      ? can('users.view')
      : session?.user?.role === 'ADMIN'

  if (permissionsLoaded && !hasAccess) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground">
            Seuls les administrateurs peuvent gérer les utilisateurs.
          </p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <PageSkeleton type="table" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs et leurs permissions d'accès au système
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null)
            setIsModalOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
            <SelectItem value="EDITOR">Éditeur</SelectItem>
            <SelectItem value="VIEWER">Visualiseur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des utilisateurs */}
      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Aucun utilisateur</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || roleFilter !== "all"
              ? "Aucun utilisateur ne correspond à vos critères."
              : "Commencez par créer un nouvel utilisateur."}
          </p>
          {!searchQuery && roleFilter === "all" && (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer un utilisateur
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted">
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Rôles</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Dernière connexion</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium">
                    {user.name || "Sans nom"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 align-top">{renderUserRoles(user)}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {user.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Jamais"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user)
                          setIsModalOpen(true)
                        }}
                        className="gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssignUser(user)}
                        className="gap-1"
                        title="Attribuer un rôle RBAC"
                      >
                        <UserCog className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={`gap-1 ${
                          user.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {user.isActive ? "Désactiver" : "Activer"}
                      </Button>
                      {user.id !== session?.user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        onSubmit={
          editingUser
            ? (data) => handleUpdate(editingUser.id, data)
            : handleCreate
        }
        initialData={
          editingUser
            ? {
                name: editingUser.name ?? "",
                email: editingUser.email,
                isActive: editingUser.isActive,
                rbacRoles: editingUser.rbacRoles?.map((r) => ({
                  roleName: r.roleName,
                  structureName: r.structureName,
                  isRoot: r.isRoot,
                })),
              }
            : null
        }
      />

      {assignUser && (
        <AssignRoleModal
          isOpen={!!assignUser}
          onClose={() => setAssignUser(null)}
          userId={assignUser.id}
          userLabel={assignUser.email}
          onAssigned={loadUsers}
        />
      )}
    </div>
  )
}
