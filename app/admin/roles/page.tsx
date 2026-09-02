'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Shield, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import { RoleModal, type RoleFormData } from '@/components/admin/role-modal'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { toast } from 'sonner'

interface RoleRow {
  id: string
  name: string
  slug: string
  description: string | null
  structureId: string | null
  structure: { id: string; name: string; slug: string } | null
  isSystem: boolean
  isRoot: boolean
  isActive: boolean
  permissionKeys: string[]
  membersCount: number
}

export default function AdminRolesPage() {
  const { can, loaded } = useAdminPermissions()
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RoleRow | null>(null)

  const loadRoles = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/roles', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setRoles(data.data ?? [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    if (!can('roles.view')) {
      setIsLoading(false)
      return
    }
    void loadRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, loadRoles])

  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (form: RoleFormData) => {
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur')
    toast.success('Rôle créé')
    loadRoles()
  }

  const handleUpdate = async (form: RoleFormData) => {
    if (!editing) return
    const res = await fetch(`/api/admin/roles/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur')
    toast.success('Rôle mis à jour')
    setEditing(null)
    loadRoles()
  }

  const handleDelete = async (role: RoleRow) => {
    if (role.isRoot) {
      toast.error('Le rôle ROOT ne peut pas être supprimé')
      return
    }
    if (!confirm(`Supprimer le rôle « ${role.name} » ?`)) return
    const res = await fetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || 'Erreur')
      return
    }
    toast.success('Rôle supprimé')
    loadRoles()
  }

  if (loaded && !can('roles.view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Accès refusé — permission <code className="text-sm">roles.view</code> requise.
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        title="Rôles"
        description="Créez et configurez les rôles métier. Seul ROOT est précréé par le système."
        action={
          can('roles.create')
            ? {
                label: 'Créer un rôle',
                icon: <Plus className="w-4 h-4" />,
                onClick: () => {
                  setEditing(null)
                  setModalOpen(true)
                },
              }
            : undefined
        }
      />

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Rechercher un rôle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="grid gap-4">
          {filtered.map((role) => (
            <Card key={role.id} className="p-4 md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Shield className="w-4 h-4 text-gold shrink-0" />
                    <h3 className="font-semibold text-foreground">{role.name}</h3>
                    {role.isRoot && (
                      <Badge variant="default" className="bg-gold text-gold-foreground">
                        ROOT
                      </Badge>
                    )}
                    {!role.isActive && (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">{role.slug}</p>
                  {role.description && (
                    <p className="text-sm text-muted-foreground mt-2">{role.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                    <span>{role.permissionKeys.length} permission(s)</span>
                    <span>·</span>
                    <span>{role.membersCount} membre(s)</span>
                    {role.structure && (
                      <>
                        <span>·</span>
                        <span>{role.structure.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {can('roles.update') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(role)
                        setModalOpen(true)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {can('roles.delete') && !role.isRoot && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(role)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Aucun rôle trouvé. Créez votre premier rôle métier.
            </p>
          )}
        </div>
      )}

      <RoleModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        isRoot={editing?.isRoot}
        initialData={
          editing
            ? {
                name: editing.name,
                description: editing.description ?? '',
                structureId: editing.structureId,
                permissionKeys: editing.permissionKeys,
                isActive: editing.isActive,
              }
            : null
        }
        onSubmit={editing ? handleUpdate : handleCreate}
      />
    </div>
  )
}
