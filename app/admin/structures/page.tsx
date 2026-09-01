'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { toast } from 'sonner'

interface StructureRow {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  isActive: boolean
  _count: { memberships: number; roles: number }
}

export default function AdminStructuresPage() {
  const { can, loaded } = useAdminPermissions()
  const [structures, setStructures] = useState<StructureRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/structures', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStructures(data.data ?? [])
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loaded && can('structures.view')) load()
    else if (loaded) setIsLoading(false)
  }, [loaded, can, load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description: description || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Structure créée')
      setModalOpen(false)
      setName('')
      setSlug('')
      setDescription('')
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loaded && !can('structures.view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Accès refusé — permission <code className="text-sm">structures.view</code> requise.
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        title="Structures"
        description="Organismes du réseau OMA (JoyStudio, OMA TV, partenaires…)"
        action={
          can('structures.create')
            ? {
                label: 'Créer une structure',
                icon: <Plus className="w-4 h-4" />,
                onClick: () => setModalOpen(true),
              }
            : undefined
        }
      />

      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {structures.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{s.slug}</p>
                  {s.description && (
                    <p className="text-sm text-muted-foreground mt-2">{s.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">{s.type}</Badge>
                    {!s.isActive && <Badge variant="secondary">Inactive</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {s._count.roles} rôle(s) · {s._count.memberships} membre(s)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle structure</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slug) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                    )
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                pattern="[a-z0-9-]+"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
