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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AssignRoleModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userLabel: string
  onAssigned: () => void
}

export function AssignRoleModal({
  isOpen,
  onClose,
  userId,
  userLabel,
  onAssigned,
}: AssignRoleModalProps) {
  const [structures, setStructures] = useState<{ id: string; name: string }[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string; isRoot: boolean }[]>([])
  const [structureId, setStructureId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    Promise.all([
      fetch('/api/admin/structures').then((r) => r.json()),
      fetch('/api/admin/roles').then((r) => r.json()),
    ]).then(([sRes, rRes]) => {
      if (sRes.success) {
        setStructures(sRes.data ?? [])
        if (sRes.data?.[0]) setStructureId(sRes.data[0].id)
      }
      if (rRes.success) {
        const list = (rRes.data ?? []).filter(
          (r: { isActive: boolean }) => r.isActive
        )
        setRoles(list)
        if (list[0]) setRoleId(list[0].id)
      }
    })
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!structureId || !roleId) {
      toast.error('Structure et rôle requis')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, structureId, roleId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Rôle attribué')
      onAssigned()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attribuer un rôle</DialogTitle>
          <p className="text-sm text-muted-foreground">{userLabel}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Structure</Label>
            <Select value={structureId} onValueChange={setStructureId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir une structure" />
              </SelectTrigger>
              <SelectContent>
                {structures.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                    {r.isRoot ? ' (ROOT)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Attribuer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
