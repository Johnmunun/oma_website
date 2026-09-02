'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { EXPERTISE_ICON_OPTIONS, resolveExpertiseIcon } from '@/lib/expertise/domain-icons'
import { slugifyStructureName } from '@/lib/structures/slug'
import { toast } from 'sonner'

interface DomainRow {
  id: string
  name: string
  slug: string
  description: string | null
  iconKey: string
  sortOrder: number
  isActive: boolean
  _count: { structures: number }
}

type FormState = {
  name: string
  slug: string
  description: string
  iconKey: string
  sortOrder: number
  isActive: boolean
}

const EMPTY: FormState = {
  name: '',
  slug: '',
  description: '',
  iconKey: 'mic',
  sortOrder: 0,
  isActive: true,
}

export default function AdminExpertiseDomainsPage() {
  const { can, loaded } = useAdminPermissions()
  const [domains, setDomains] = useState<DomainRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DomainRow | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [slugTouched, setSlugTouched] = useState(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/expertise-domains', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDomains(data.data ?? [])
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    if (!can('expertise.view')) {
      setIsLoading(false)
      return
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, load])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setSlugTouched(false)
    setOpen(true)
  }

  const openEdit = (d: DomainRow) => {
    setEditing(d)
    setForm({
      name: d.name,
      slug: d.slug,
      description: d.description ?? '',
      iconKey: d.iconKey,
      sortOrder: d.sortOrder,
      isActive: d.isActive,
    })
    setSlugTouched(true)
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      description: form.description || null,
    }
    try {
      const res = await fetch(
        editing ? `/api/admin/expertise-domains/${editing.id}` : '/api/admin/expertise-domains',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(editing ? 'Domaine mis à jour' : 'Domaine créé')
      setOpen(false)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  const handleDelete = async (d: DomainRow) => {
    if (!confirm(`Supprimer « ${d.name} » ?`)) return
    try {
      const res = await fetch(`/api/admin/expertise-domains/${d.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Domaine supprimé')
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  if (loaded && !can('expertise.view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Accès refusé — permission <code>expertise.view</code> requise.
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        title="Domaines d'expertise"
        description="Catégories affichées sur la landing — assignez-y vos structures partenaires"
        action={
          can('expertise.create')
            ? { label: 'Ajouter un domaine', icon: <Plus className="w-4 h-4" />, onClick: openCreate }
            : undefined
        }
      />

      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="grid gap-4">
          {domains.map((d) => {
            const Icon = resolveExpertiseIcon(d.iconKey)
            return (
              <Card key={d.id} className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                  <Icon className="h-5 w-5 text-gold-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{d.slug}</p>
                  {d.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {d._count.structures} structure(s) · ordre {d.sortOrder}
                    {!d.isActive && ' · inactif'}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {can('expertise.update') && (
                    <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {can('expertise.delete') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(d)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le domaine' : 'Nouveau domaine'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm((f) => ({
                    ...f,
                    name,
                    slug: slugTouched ? f.slug : slugifyStructureName(name),
                  }))
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }}
                pattern="[a-z0-9-]+"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Icône</Label>
              <Select value={form.iconKey} onValueChange={(v) => setForm((f) => ({ ...f, iconKey: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERTISE_ICON_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Ordre</Label>
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">{editing ? 'Enregistrer' : 'Créer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
