'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit2,
  Gavel,
  Medal,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import {
  JuryMemberDrawer,
  type JuryMemberFormData,
} from '@/components/admin/jury-member-drawer'
import { JuryPortalShareLink } from '@/components/admin/jury-portal-share-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface JuryMemberRow {
  id: string
  fullName: string
  email: string
  title: string | null
  bio: string | null
  accessToken: string
  isActive: boolean
  sortOrder: number
  _count: { evaluations: number }
}

interface RankingRow {
  candidateId: string
  averageScore: number
  evaluationCount: number
  candidate: {
    fullName: string
    age: number | null
    city: string | null
  }
}

interface ChallengeInfo {
  id: string
  name: string
  slug: string
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
}

interface JuryStats {
  memberCount: number
  activeMembers: number
  evaluationCount: number
  publishedVideos: number
  rankedCandidates: number
  rankings: RankingRow[]
  phasesEnabled?: boolean
  activePhase?: { id: string; name: string } | null
}

export default function ChallengeJuryPage() {
  const params = useParams()
  const challengeId = params.id as string
  const { can, loaded } = useAdminPermissions()

  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null)
  const [members, setMembers] = useState<JuryMemberRow[]>([])
  const [stats, setStats] = useState<JuryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<JuryMemberRow | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const [challengeRes, membersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/challenges/${challengeId}`, { cache: 'no-store' }),
        fetch(`/api/admin/challenges/${challengeId}/jury`, { cache: 'no-store' }),
        fetch(`/api/admin/challenges/${challengeId}/jury/stats`, { cache: 'no-store' }),
      ])

      const challengeData = await challengeRes.json()
      const membersData = await membersRes.json()
      const statsData = await statsRes.json()

      if (!challengeRes.ok) throw new Error(challengeData.error)
      if (!membersRes.ok) throw new Error(membersData.error)
      if (!statsRes.ok) throw new Error(statsData.error)

      setChallenge(challengeData.data)
      setMembers(membersData.data ?? [])
      setStats(statsData.data)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [challengeId])

  useEffect(() => {
    if (!loaded || !can('jury.view')) {
      if (loaded) setIsLoading(false)
      return
    }
    void load()
  }, [loaded, can, load])

  const handleCreate = async (form: JuryMemberFormData) => {
    const res = await fetch(`/api/admin/challenges/${challengeId}/jury`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        title: form.title || null,
        bio: form.bio || null,
        isActive: form.isActive,
        sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    toast.success('Juré ajouté')
    setDrawerOpen(false)
    await load()
  }

  const handleUpdate = async (form: JuryMemberFormData) => {
    if (!editing) return
    const res = await fetch(`/api/admin/challenges/${challengeId}/jury/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        title: form.title || null,
        bio: form.bio || null,
        isActive: form.isActive,
        sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    toast.success('Juré mis à jour')
    setDrawerOpen(false)
    setEditing(null)
    await load()
  }

  const handleDelete = async (member: JuryMemberRow) => {
    if (!can('jury.delete')) {
      toast.error('Permission insuffisante')
      return
    }
    if (!confirm(`Retirer « ${member.fullName} » du jury ?`)) return
    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/jury/${member.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Juré supprimé')
      await load()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  if (loaded && !can('jury.view')) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center text-muted-foreground">
        Accès refusé — permission <code>jury.view</code> requise.
      </div>
    )
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-8 flex justify-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/challenges/${challengeId}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Dashboard challenge
          </Link>
        </Button>
      </div>

      <header className="mx-auto mb-8 max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-gold/20">
          <Gavel className="h-7 w-7 text-gold-text" />
        </div>
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Jury</h1>
        {challenge && (
          <p className="mt-3 text-muted-foreground">{challenge.name}</p>
        )}
        {stats?.phasesEnabled && (
          <p className="mt-2 text-sm font-medium text-gold-text">
            {stats.activePhase
              ? `Phase active : ${stats.activePhase.name}`
              : 'Phases activées — aucune phase active'}
          </p>
        )}
      </header>

      <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Jurés', value: stats?.memberCount ?? 0, icon: Users, accent: 'text-gold-text bg-gold/10' },
          { label: 'Actifs', value: stats?.activeMembers ?? 0, icon: Gavel, accent: 'text-violet-600 bg-violet-500/10' },
          { label: 'Évaluations', value: stats?.evaluationCount ?? 0, icon: Medal, accent: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Vidéos publiées', value: stats?.publishedVideos ?? 0, icon: Users, accent: 'text-blue-600 bg-blue-500/10' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="flex flex-col items-center p-5 text-center">
            <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', accent)}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </section>

      {stats && stats.rankings.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-center text-lg font-semibold">
            Classement provisoire
            {stats.activePhase ? ` — ${stats.activePhase.name}` : ''}
          </h2>
          <div className="space-y-2">
            {stats.rankings.map((row, index) => (
              <Card key={row.candidateId} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                      index === 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{row.candidate.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.evaluationCount} juré(s)
                      {row.candidate.city ? ` · ${row.candidate.city}` : ''}
                    </p>
                  </div>
                </div>
                <Badge className="text-base tabular-nums">{row.averageScore}/10</Badge>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Membres du jury</h2>
        {can('jury.create') && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setDrawerOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <Card className="p-12 text-center">
          <Gavel className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Aucun membre du jury pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <Card key={member.id} className="p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{member.fullName}</h3>
                      <Badge variant={member.isActive ? 'default' : 'secondary'}>
                        {member.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{member.email}</p>
                    {member.title && (
                      <p className="mt-1 text-sm text-foreground/80">{member.title}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {member._count.evaluations} évaluation(s)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {can('jury.update') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(member)
                          setDrawerOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {can('jury.delete') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleDelete(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {challenge && member.isActive && (
                  <JuryPortalShareLink
                    structure={challenge.structure}
                    challengeSlug={challenge.slug}
                    challengeId={challengeId}
                    memberId={member.id}
                    memberName={member.fullName}
                    token={member.accessToken}
                    canRegenerate={can('jury.assign')}
                    onTokenRegenerated={load}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <JuryMemberDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditing(null)
        }}
        initialData={
          editing
            ? {
                id: editing.id,
                fullName: editing.fullName,
                email: editing.email,
                title: editing.title ?? '',
                bio: editing.bio ?? '',
                isActive: editing.isActive,
                sortOrder: String(editing.sortOrder),
              }
            : null
        }
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
