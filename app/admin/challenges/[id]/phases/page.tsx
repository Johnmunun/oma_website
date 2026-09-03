'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Layers,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import type {
  ChallengePhaseItem,
  ChallengePhasesSettings,
} from '@/lib/challenges/challenge-phase-settings'
import { toast } from 'sonner'

type CandidateRow = {
  id: string
  fullName: string
  email: string
  candidateCode: string | null
  phaseId: string | null
  video: { status: string } | null
}

const EMPTY_PHASES: ChallengePhasesSettings = {
  enabled: false,
  activePhaseId: null,
  items: [],
}

function newLocalPhase(order: number): ChallengePhaseItem {
  return {
    id: `local-${Date.now()}-${order}`,
    name: `Tour ${order + 1}`,
    order,
    status: 'DRAFT',
  }
}

export default function ChallengePhasesAdminPage() {
  const params = useParams()
  const challengeId = params.id as string
  const { can, loaded } = useAdminPermissions()

  const [challengeName, setChallengeName] = useState('')
  const [phases, setPhases] = useState<ChallengePhasesSettings>(EMPTY_PHASES)
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [assignments, setAssignments] = useState<Record<string, string | null>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const canView = can('challenges.view') || can('challenges.settings')
  const canEdit = can('challenges.settings') || can('challenges.update')

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/challenges/${challengeId}/phases`, {
        cache: 'no-store',
      }).then((r) => r.json())
      if (!res.success) {
        toast.error(res.error || 'Erreur de chargement')
        return
      }
      setChallengeName(res.data.challenge.name)
      setPhases(res.data.phases)
      setCandidates(res.data.candidates)
      const map: Record<string, string | null> = {}
      for (const c of res.data.candidates as CandidateRow[]) {
        map[c.id] = c.phaseId
      }
      setAssignments(map)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [challengeId])

  useEffect(() => {
    if (!loaded || !canView) {
      if (loaded) setIsLoading(false)
      return
    }
    void load()
  }, [loaded, canView, load])

  const phaseOptions = useMemo(() => phases.items, [phases.items])

  const save = async () => {
    if (!canEdit) return
    try {
      setIsSaving(true)
      const assignmentPayload = candidates.map((c) => ({
        candidateId: c.id,
        phaseId: assignments[c.id] ?? null,
      }))

      const res = await fetch(`/api/admin/challenges/${challengeId}/phases`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phases: {
            enabled: phases.enabled,
            activePhaseId: phases.activePhaseId,
            items: phases.items.map((p, index) => ({
              id: p.id.startsWith('local-') ? undefined : p.id,
              name: p.name,
              order: index,
              status: p.status,
            })),
          },
          assignments: assignmentPayload,
        }),
      }).then((r) => r.json())

      if (!res.success) {
        toast.error(res.error || 'Erreur de sauvegarde')
        return
      }

      setPhases(res.data.phases)
      setCandidates(res.data.candidates)
      const map: Record<string, string | null> = {}
      for (const c of res.data.candidates as CandidateRow[]) {
        map[c.id] = c.phaseId
      }
      setAssignments(map)
      toast.success('Phases enregistrées')
    } catch {
      toast.error('Erreur de sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  if (loaded && !canView) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-muted-foreground">
        Accès refusé
      </div>
    )
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href={`/admin/challenges/${challengeId}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Retour au challenge
          </Link>
        </Button>
      </div>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
            <Layers className="h-5 w-5 text-gold-text" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">
              Phases / Tours
            </h1>
            <p className="text-sm text-muted-foreground">{challengeName}</p>
          </div>
        </div>
        <Badge variant={phases.enabled ? 'default' : 'secondary'}>
          {phases.enabled ? 'Mode multi-tours actif' : 'Mode simple (sans tours)'}
        </Badge>
      </header>

      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="phases-enabled">Activer les phases</Label>
              <p className="text-xs text-muted-foreground">
                Votes et classement filtrés sur la phase active
              </p>
            </div>
            <Switch
              id="phases-enabled"
              checked={phases.enabled}
              disabled={!canEdit}
              onCheckedChange={(enabled) => setPhases((p) => ({ ...p, enabled }))}
            />
          </div>

          {phases.enabled && (
            <div className="space-y-2">
              <Label>Phase active (vote / hub)</Label>
              <Select
                value={phases.activePhaseId ?? '__none__'}
                disabled={!canEdit}
                onValueChange={(v) =>
                  setPhases((p) => ({
                    ...p,
                    activePhaseId: v === '__none__' ? null : v,
                  }))
                }
              >
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Choisir une phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune</SelectItem>
                  {phaseOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Liste des tours</h2>
            {canEdit && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setPhases((p) => ({
                    ...p,
                    items: [...p.items, newLocalPhase(p.items.length)],
                  }))
                }
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Ajouter
              </Button>
            )}
          </div>

          {phases.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun tour. Ajoutez par ex. « Auditions », « Demi-finale », « Finale ».
            </p>
          ) : (
            <div className="space-y-3">
              {phases.items.map((phase, index) => (
                <div
                  key={phase.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center"
                >
                  <Input
                    value={phase.name}
                    disabled={!canEdit}
                    className="flex-1"
                    onChange={(e) =>
                      setPhases((p) => ({
                        ...p,
                        items: p.items.map((it, i) =>
                          i === index ? { ...it, name: e.target.value } : it
                        ),
                      }))
                    }
                  />
                  <Select
                    value={phase.status}
                    disabled={!canEdit}
                    onValueChange={(status) =>
                      setPhases((p) => ({
                        ...p,
                        items: p.items.map((it, i) =>
                          i === index
                            ? {
                                ...it,
                                status: status as ChallengePhaseItem['status'],
                              }
                            : it
                        ),
                      }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Brouillon</SelectItem>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="CLOSED">Clos</SelectItem>
                    </SelectContent>
                  </Select>
                  {canEdit && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        setPhases((p) => ({
                          ...p,
                          items: p.items.filter((_, i) => i !== index),
                          activePhaseId:
                            p.activePhaseId === phase.id ? null : p.activePhaseId,
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold">Assignation des candidats</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Seuls les candidats de la phase active apparaissent aux votes publics
            </p>
          </div>

          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun candidat approuvé</p>
          ) : (
            <div className="space-y-2">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.candidateCode || c.email}
                      {c.video?.status === 'PUBLISHED' ? ' · vidéo OK' : ''}
                    </p>
                  </div>
                  <Select
                    value={assignments[c.id] ?? '__none__'}
                    disabled={!canEdit || !phases.enabled}
                    onValueChange={(v) =>
                      setAssignments((a) => ({
                        ...a,
                        [c.id]: v === '__none__' ? null : v,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Non assigné</SelectItem>
                      {phaseOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </Card>

        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={() => void save()} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
