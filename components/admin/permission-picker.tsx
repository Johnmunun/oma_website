'use client'

import { useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type PermissionItem = {
  key: string
  module: string
  description: string
}

interface PermissionPickerProps {
  permissionsByModule: Record<string, PermissionItem[]>
  selected: string[]
  onChange: (keys: string[]) => void
  disabled?: boolean
  className?: string
}

const MODULE_LABELS: Record<string, string> = {
  roles: 'Rôles',
  permissions: 'Permissions',
  structures: 'Structures',
  users: 'Utilisateurs',
  settings: 'Paramètres',
  analytics: 'Analytics',
  events: 'Événements',
  media: 'Médias',
  messages: 'Messages',
  content: 'Contenu',
  expertise: 'Expertise',
  team: 'Équipe',
  testimonials: 'Témoignages',
  partners: 'Partenaires',
  seo: 'SEO',
  pixels: 'Pixels',
  newsletter: 'Newsletter',
  challenges: 'Challenges',
  candidates: 'Candidats',
  videos: 'Vidéos',
  votes: 'Votes',
  jury: 'Jury',
  live: 'Live',
}

export function PermissionPicker({
  permissionsByModule,
  selected,
  onChange,
  disabled,
  className,
}: PermissionPickerProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const toggle = (key: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, key])
    } else {
      onChange(selected.filter((k) => k !== key))
    }
  }

  const toggleModule = (module: string, selectAll: boolean) => {
    const keys = permissionsByModule[module]?.map((p) => p.key) ?? []
    if (selectAll) {
      onChange(Array.from(new Set([...selected, ...keys])))
    } else {
      onChange(selected.filter((k) => !keys.includes(k)))
    }
  }

  const modules = Object.keys(permissionsByModule).sort()

  return (
    <div className={cn('space-y-4 max-h-[50vh] overflow-y-auto pr-1', className)}>
      {modules.map((module) => {
        const perms = permissionsByModule[module] ?? []
        const allSelected = perms.every((p) => selectedSet.has(p.key))
        const label = MODULE_LABELS[module] ?? module.toUpperCase()

        return (
          <div
            key={module}
            className="rounded-xl border border-border/60 bg-muted/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-semibold tracking-wide text-foreground">
                {label}
              </h4>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={disabled || allSelected}
                  onClick={() => toggleModule(module, true)}
                >
                  Tout sélectionner
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={disabled}
                  onClick={() => toggleModule(module, false)}
                >
                  Tout désélectionner
                </Button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {perms.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-start gap-2 rounded-lg p-2 hover:bg-muted/40 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSet.has(perm.key)}
                    disabled={disabled}
                    onCheckedChange={(v) => toggle(perm.key, v === true)}
                    className="mt-0.5"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-mono text-foreground">
                      {perm.key}
                    </span>
                    {perm.description && (
                      <span className="block text-xs text-muted-foreground">
                        {perm.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
