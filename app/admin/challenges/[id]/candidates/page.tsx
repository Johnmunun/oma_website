'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit2,
  Mail,
  Phone,
  Search,
  Trash2,
  Clock,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import { CandidateRejectDialog } from '@/components/admin/candidate-reject-dialog'
import { ChallengeRegistrationShareLink } from '@/components/admin/challenge-registration-share-link'
import {
  CandidateDrawer,
  type CandidateFormData,
} from '@/components/admin/candidate-drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type CandidateStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface CandidateRow {
  id: string
  candidateCode: string | null
  fullName: string
  email: string
  phone: string | null
  age: number | null
  city: string | null
  parentName: string | null
  parentEmail: string | null
  notes: string | null
  reviewNotes: string | null
  status: CandidateStatus
  createdAt: string
}

interface ChallengeInfo {
  id: string
  name: string
  slug: string
  status: string
  structure: {
    name: string
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
}

const STATUS_LABELS: Record<CandidateStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
}

const STATUS_VARIANT: Record<CandidateStatus, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

function buildPayload(form: CandidateFormData, isEdit: boolean) {
  return {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone || null,
    birthDate: form.birthDate || null,
    age: form.age ? Number.parseInt(form.age, 10) : null,
    parentName: form.parentName || null,
    parentEmail: form.parentEmail || null,
    parentPhone: form.parentPhone || null,
    city: form.city || null,
    notes: form.notes || null,
    ...(isEdit
      ? {
          reviewNotes: form.reviewNotes || null,
          status: form.status,
        }
      : {}),
  }
}

export default function ChallengeCandidatesPage() {
  const params = useParams()
  const challengeId = params.id as string
  const { can, loaded } = useAdminPermissions()

  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null)
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<CandidateRow | null>(null)
  const [rejectTarget, setRejectTarget] = useState<CandidateRow | null>(null)
  const [isRejecting, setIsRejecting] = useState(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const query = new URLSearchParams()
      if (statusFilter !== 'all') query.set('status', statusFilter)
      if (search.trim()) query.set('search', search.trim())

      const [challengeRes, candidatesRes] = await Promise.all([
        fetch(`/api/admin/challenges/${challengeId}`, { cache: 'no-store' }),
        fetch(`/api/admin/challenges/${challengeId}/candidates?${query.toString()}`, {
          cache: 'no-store',
        }),
      ])

      const challengeData = await challengeRes.json()
      const candidatesData = await candidatesRes.json()

      if (!challengeRes.ok) throw new Error(challengeData.error)
      if (!candidatesRes.ok) throw new Error(candidatesData.error)

      setChallenge(challengeData.data)
      setCandidates(candidatesData.data ?? [])
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [challengeId, search, statusFilter])

  useEffect(() => {
    if (!loaded || !can('candidates.view')) {
      if (loaded) setIsLoading(false)
      return
    }
    void load()
  }, [loaded, can, load])

  const stats = useMemo(() => {
    return {
      total: candidates.length,
      pending: candidates.filter((c) => c.status === 'PENDING').length,
      approved: candidates.filter((c) => c.status === 'APPROVED').length,
      rejected: candidates.filter((c) => c.status === 'REJECTED').length,
    }
  }, [candidates])

  const handleCreate = async (form: CandidateFormData) => {
    const res = await fetch(`/api/admin/challenges/${challengeId}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form, false)),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la création')
    toast.success('Candidat ajouté')
    setDrawerOpen(false)
    await load()
  }

  const handleUpdate = async (form: CandidateFormData) => {
    if (!editing) return
    const res = await fetch(
      `/api/admin/challenges/${challengeId}/candidates/${editing.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(form, true)),
      }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour')
    toast.success('Candidat mis à jour')
    setDrawerOpen(false)
    setEditing(null)
    await load()
  }

  const handleStatusAction = async (
    candidate: CandidateRow,
    action: 'approve' | 'reject',
    reviewNotes?: string
  ) => {
    const permission = action === 'approve' ? 'candidates.approve' : 'candidates.reject'
    if (!can(permission)) {
      toast.error('Permission insuffisante')
      return
    }

    try {
      const res = await fetch(
        `/api/admin/challenges/${challengeId}/candidates/${candidate.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            ...(reviewNotes ? { reviewNotes } : {}),
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(
        action === 'approve'
          ? 'Candidat approuvé — email envoyé au candidat'
          : 'Candidat rejeté — email envoyé au candidat'
      )
      setRejectTarget(null)
      await load()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
      throw error
    }
  }

  const handleRejectConfirm = async (reviewNotes: string) => {
    if (!rejectTarget) return
    setIsRejecting(true)
    try {
      await handleStatusAction(rejectTarget, 'reject', reviewNotes || undefined)
    } catch {
      // toast déjà affiché
    } finally {
      setIsRejecting(false)
    }
  }

  const handleDelete = async (candidate: CandidateRow) => {
    if (!can('candidates.delete')) {
      toast.error('Permission insuffisante')
      return
    }
    if (!confirm(`Supprimer le candidat « ${candidate.fullName} » ?`)) return

    try {
      const res = await fetch(
        `/api/admin/challenges/${challengeId}/candidates/${candidate.id}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Candidat supprimé')
      await load()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const exportCsv = () => {
    const headers = [
      'Code',
      'Nom',
      'Email',
      'Téléphone',
      'Âge',
      'Ville',
      'Parent',
      'Statut',
      'Date inscription',
    ]
    const rows = candidates.map((candidate) => [
      candidate.candidateCode || '',
      candidate.fullName,
      candidate.email,
      candidate.phone || '',
      candidate.age?.toString() || '',
      candidate.city || '',
      candidate.parentName || '',
      STATUS_LABELS[candidate.status],
      new Date(candidate.createdAt).toLocaleDateString('fr-FR'),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `candidats-${challenge?.slug || 'challenge'}-${new Date().toISOString().split('T')[0]}.csv`
    anchor.click()
    window.URL.revokeObjectURL(url)
    toast.success('Export CSV réussi')
  }

  const drawerInitialData = editing
    ? {
        id: editing.id,
        fullName: editing.fullName,
        email: editing.email,
        phone: editing.phone ?? '',
        age: editing.age?.toString() ?? '',
        birthDate: '',
        parentName: editing.parentName ?? '',
        parentEmail: editing.parentEmail ?? '',
        parentPhone: '',
        city: editing.city ?? '',
        notes: editing.notes ?? '',
        reviewNotes: editing.reviewNotes ?? '',
        status: editing.status,
      }
    : null

  if (loaded && !can('candidates.view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Accès refusé — permission <code>candidates.view</code> requise.
      </div>
    )
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-8 flex justify-center">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href={`/admin/challenges/${challengeId}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Dashboard challenge
          </Link>
        </Button>
      </div>

      <header className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-gold/20">
          <Users className="h-7 w-7 text-gold-text" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">Candidats</h1>
        {challenge && (
          <p className="mt-3 text-muted-foreground">
            {challenge.name} · {challenge.structure.name}
          </p>
        )}
      </header>

      {challenge && (
        <div className="mx-auto mb-8 max-w-3xl">
          <ChallengeRegistrationShareLink
            structure={challenge.structure}
            challengeSlug={challenge.slug}
            challengeStatus={challenge.status}
            challengeName={challenge.name}
          />
        </div>
      )}

      <section className="mb-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Users, accent: 'text-gold-text bg-gold/10' },
            { label: 'En attente', value: stats.pending, icon: Clock, accent: 'text-amber-600 bg-amber-500/10' },
            { label: 'Approuvés', value: stats.approved, icon: UserCheck, accent: 'text-emerald-600 bg-emerald-500/10' },
            { label: 'Rejetés', value: stats.rejected, icon: XCircle, accent: 'text-red-600 bg-red-500/10' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <Card
              key={label}
              className="flex flex-col items-center justify-center border-border/60 p-5 text-center shadow-sm"
            >
              <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', accent)}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mb-6 border-border/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par code, nom, email, ville..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="APPROVED">Approuvés</SelectItem>
              <SelectItem value="REJECTED">Rejetés</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2">
            {can('candidates.create') && (
              <Button
                onClick={() => {
                  setEditing(null)
                  setDrawerOpen(true)
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            )}
            <Button variant="outline" onClick={exportCsv} disabled={candidates.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {candidates.length === 0 ? (
        <Card className="border-border/60 p-12 text-center shadow-sm">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Aucun candidat pour le moment.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[100px] font-semibold">Code</TableHead>
                  <TableHead className="min-w-[160px] font-semibold">Candidat</TableHead>
                  <TableHead className="min-w-[200px] font-semibold">Contact</TableHead>
                  <TableHead className="min-w-[140px] font-semibold">Infos</TableHead>
                  <TableHead className="w-[120px] font-semibold">Statut</TableHead>
                  <TableHead className="min-w-[130px] font-semibold">Inscription</TableHead>
                  <TableHead className="w-[180px] text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="group">
                    <TableCell>
                      {candidate.candidateCode ? (
                        <span className="inline-flex rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold tracking-wide">
                          {candidate.candidateCode}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{candidate.fullName}</p>
                      {candidate.notes && (
                        <p className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground">
                          {candidate.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1.5 text-foreground/90">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="max-w-[200px] truncate">{candidate.email}</span>
                        </p>
                        {candidate.phone && (
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {candidate.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="space-y-0.5">
                        {candidate.age != null && <p>{candidate.age} ans</p>}
                        {candidate.city && <p>{candidate.city}</p>}
                        {candidate.parentName && (
                          <p className="truncate max-w-[160px]" title={candidate.parentName}>
                            Parent : {candidate.parentName}
                          </p>
                        )}
                        {!candidate.age && !candidate.city && !candidate.parentName && (
                          <span>—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[candidate.status]}>
                        {STATUS_LABELS[candidate.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(candidate.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {candidate.status === 'PENDING' && can('candidates.approve') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            onClick={() => handleStatusAction(candidate, 'approve')}
                            title="Approuver"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {candidate.status === 'PENDING' && can('candidates.reject') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-red-600 hover:bg-red-50"
                            onClick={() => setRejectTarget(candidate)}
                            title="Rejeter"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {can('candidates.update') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setEditing(candidate)
                              setDrawerOpen(true)
                            }}
                            title="Modifier"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {can('candidates.delete') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(candidate)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
            {candidates.length} candidat{candidates.length > 1 ? 's' : ''} au total
          </div>
        </Card>
      )}

      <CandidateRejectDialog
        open={Boolean(rejectTarget)}
        candidateName={rejectTarget?.fullName}
        isSubmitting={isRejecting}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />

      <CandidateDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditing(null)
        }}
        initialData={drawerInitialData}
        onSubmit={async (form) => {
          try {
            if (editing) await handleUpdate(form)
            else await handleCreate(form)
          } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Erreur')
            throw error
          }
        }}
      />
    </div>
  )
}
