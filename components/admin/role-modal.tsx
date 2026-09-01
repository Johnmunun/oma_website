'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { PermissionPicker, type PermissionItem } from '@/components/admin/permission-picker'
import { toast } from 'sonner'

export interface RoleFormData {
  name: string
  description: string
  structureId: string | null
  permissionKeys: string[]
  isActive: boolean
}

interface StructureOption {
  id: string
  name: string
  slug: string
}

interface RoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RoleFormData) => Promise<void>
  initialData?: RoleFormData | null
  isRoot?: boolean
}

const emptyForm: RoleFormData = {
  name: '',
  description: '',
  structureId: null,
  permissionKeys: [],
  isActive: true,
}

export function RoleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isRoot,
}: RoleModalProps) {
  const [form, setForm] = useState<RoleFormData>(emptyForm)
  const [structures, setStructures] = useState<StructureOption[]>([])
  const [permissionsByModule, setPermissionsByModule] = useState<
    Record<string, PermissionItem[]>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    setForm(initialData ?? emptyForm)

    Promise.all([
      fetch('/api/admin/structures').then((r) => r.json()),
      fetch('/api/admin/permissions').then((r) => r.json()),
    ])
      .then(([structRes, permRes]) => {
        if (structRes.success) setStructures(structRes.data ?? [])
        if (permRes.success) setPermissionsByModule(permRes.data?.byModule ?? {})
      })
      .catch(() => toast.error('Impossible de charger les données du formulaire'))
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Le nom du rôle est requis')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(96vw,72rem)] sm:max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-y-auto p-6 md:p-8">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">
            {initialData ? 'Modifier le rôle' : 'Créer un rôle'}
            {isRoot && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (ROOT — lecture seule)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Nom du rôle</Label>
              <Input
                id="role-name"
                value={form.name}
                disabled={isRoot}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex. Gestionnaire Challenge"
              />
            </div>

            <div className="space-y-2">
              <Label>Structure concernée</Label>
              <Select
                value={form.structureId ?? 'global'}
                disabled={isRoot}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    structureId: v === 'global' ? null : v,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Globale (toutes structures)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Globale (toutes structures)</SelectItem>
                  {structures.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="role-desc">Description</Label>
              <Textarea
                id="role-desc"
                value={form.description}
                disabled={isRoot}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4 md:p-5">
            <Label className="text-base">Permissions</Label>
            <PermissionPicker
              permissionsByModule={permissionsByModule}
              selected={form.permissionKeys}
              disabled={isRoot}
              onChange={(permissionKeys) =>
                setForm((f) => ({ ...f, permissionKeys }))
              }
              className="max-h-[55vh]"
            />
          </div>

          <DialogFooter className="pt-2 sm:pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || isRoot}>
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
