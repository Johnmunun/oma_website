'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, Edit2, Trash2, Trophy, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import {
  ChallengeDrawer,
  type ChallengeFormData,
} from '@/components/admin/challenge-drawer'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { toast } from 'sonner'
import {
  buildChallengeSettingsPayload,
  mergeChallengeSettings,
} from '@/lib/challenges/challenge-registration-settings'

interface ChallengeRow {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
  structureId: string
  settings?: unknown
  structure: { id: string; name: string; slug: string; landingPagePath?: string | null; subdomain?: string | null }
}

interface StructureOption {
  id: string
  name: string
  slug: string
  landingPagePath?: string | null
  subdomain?: string | null
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  ARCHIVED: 'Archivé',
}

export default function AdminChallengesPageWrapper() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminChallengesPage />
    </Suspense>
  )
}

function AdminChallengesPage() {
  const searchParams = useSearchParams()
  const { can, loaded } = useAdminPermissions()
  const [challenges, setChallenges] = useState<ChallengeRow[]>([])
  const [structures, setStructures] = useState<StructureOption[]>([])
  const [structureFilter, setStructureFilter] = useState<string>(
    searchParams.get('structureId') ?? 'all'
  )
  const [isLoading, setIsLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<ChallengeRow | null>(null)

  const loadStructures = useCallback(async () => {
    const res = await fetch('/api/admin/structures', { cache: 'no-store' })
    const data = await res.json()
    if (data.success) {
      setStructures(
        (data.data ?? []).map(
          (s: {
            id: string
            name: string
            slug: string
            landingPagePath?: string | null
            subdomain?: string | null
          }) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            landingPagePath: s.landingPagePath,
            subdomain: s.subdomain,
          })
        )
      )
    }
  }, [])

  const loadChallenges = useCallback(async () => {
    try {
      setIsLoading(true)
      const qs =
        structureFilter !== 'all' ? `?structureId=${structureFilter}` : ''
      const res = await fetch(`/api/admin/challenges${qs}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setChallenges(data.data ?? [])
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }, [structureFilter])

  useEffect(() => {
    if (!loaded) return
    if (!can('challenges.view')) {
      setIsLoading(false)
      return
    }
    void loadStructures()
    void loadChallenges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, loadStructures, loadChallenges])

  const saveChallenge = async (form: ChallengeFormData) => {
    const settings = editing
      ? mergeChallengeSettings(editing.settings, {
          registration: form.registrationSettings,
          coverImageUrl: form.coverImageUrl || null,
        })
      : buildChallengeSettingsPayload(form.registrationSettings, form.coverImageUrl || null)

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      status: form.status,
      settings,
    }

    if (editing) {
      const res = await fetch(`/api/admin/challenges/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.details?.[0]?.message || 'Erreur lors de la mise à jour')
      }
      toast.success('Challenge mis à jour')
    } else {
      const res = await fetch(`/api/admin/structures/${form.structureId}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.details?.[0]?.message || 'Erreur lors de la création')
      }
      toast.success('Challenge créé')
    }

    setDrawerOpen(false)
    setEditing(null)
    loadChallenges()
  }

  const handleDelete = async (c: ChallengeRow) => {
    if (!confirm(`Supprimer « ${c.name} » ?`)) return
    try {
      const res = await fetch(`/api/admin/challenges/${c.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Challenge supprimé')
      loadChallenges()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  if (loaded && !can('challenges.view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Accès refusé — permission <code>challenges.view</code> requise.
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        title="Challenges"
        description="Projets métier par structure (ex. Challenge Talents Enfants · JoyStudio)"
        action={
          can('challenges.create')
            ? {
                label: 'Nouveau challenge',
                icon: <Plus className="w-4 h-4" />,
                onClick: () => {
                  setEditing(null)
                  setDrawerOpen(true)
                },
              }
            : undefined
        }
      />

      <div className="mb-6 max-w-xs">
        <Select value={structureFilter} onValueChange={setStructureFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par structure" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les structures</SelectItem>
            {structures.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : challenges.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Aucun challenge pour le moment.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {challenges.map((c) => (
            <Card key={c.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <Badge variant={c.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {STATUS_LABELS[c.status] ?? c.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {c.structure.name} · <span className="font-mono">{c.slug}</span>
                </p>
                {c.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/challenges/${c.id}`}>
                    <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
                    Dashboard
                  </Link>
                </Button>
                {can('challenges.update') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(c)
                      setDrawerOpen(true)
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                {can('challenges.delete') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDelete(c)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ChallengeDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditing(null)
        }}
        structures={structures}
        defaultStructureId={
          structureFilter !== 'all' ? structureFilter : undefined
        }
        initialData={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                slug: editing.slug,
                description: editing.description ?? '',
                status: editing.status,
                structureId: editing.structureId,
                settings: editing.settings,
              }
            : null
        }
        onSubmit={async (form) => {
          try {
            await saveChallenge(form)
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erreur')
            throw err
          }
        }}
      />
    </div>
  )
}
