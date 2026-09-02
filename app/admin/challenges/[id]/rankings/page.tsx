'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  BarChart3,
  Heart,
  Loader2,
  Medal,
  Save,
  Star,
} from 'lucide-react'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import { ChallengeRankingsPublicLinks } from '@/components/admin/challenge-rankings-public-links'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import type {
  ChallengeRankingSettings,
  ChallengeVotesSettings,
} from '@/lib/challenges/challenge-feature-settings'
import type { RankingEntry } from '@/lib/rankings/build-challenge-rankings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChallengeInfo {
  id: string
  name: string
  slug: string
  status: string
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
}

export default function ChallengeRankingsAdminPage() {
  const params = useParams()
  const challengeId = params.id as string
  const { can, loaded } = useAdminPermissions()

  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null)
  const [ranking, setRanking] = useState<ChallengeRankingSettings | null>(null)
  const [votes, setVotes] = useState<ChallengeVotesSettings | null>(null)
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [stats, setStats] = useState<{ totalVotes: number; rankedCandidates: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const [challengeRes, rankingsRes] = await Promise.all([
        fetch(`/api/admin/challenges/${challengeId}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/admin/challenges/${challengeId}/rankings`, { cache: 'no-store' }).then((r) =>
          r.json(),
        ),
      ])

      if (challengeRes.success) setChallenge(challengeRes.data)
      else toast.error(challengeRes.error)

      if (rankingsRes.success) {
        setRanking(rankingsRes.data.features.ranking)
        setVotes(rankingsRes.data.features.votes)
        setRankings(rankingsRes.data.rankings)
        setStats(rankingsRes.data.stats)
      } else toast.error(rankingsRes.error)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [challengeId])

  useEffect(() => {
    if (!loaded || !can('challenges.view')) {
      if (loaded) setIsLoading(false)
      return
    }
    void load()
  }, [loaded, can, load])

  const saveSettings = async () => {
    if (!ranking || !votes) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/rankings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ranking, votes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Paramètres enregistrés')
      setRanking(data.data.features.ranking)
      setVotes(data.data.features.votes)
      void load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsSaving(false)
    }
  }

  if (loaded && !can('challenges.view')) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-muted-foreground">
        Accès refusé
      </div>
    )
  }

  if (isLoading) return <PageSkeleton />

  if (!challenge || !ranking || !votes) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Challenge introuvable</p>
        <Button variant="link" asChild>
          <Link href="/admin/challenges">Retour</Link>
        </Button>
      </div>
    )
  }

  const canEdit = can('challenges.settings')

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

      <header className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
          <BarChart3 className="h-7 w-7 text-gold-text" />
        </div>
        <h1 className="font-serif text-3xl font-bold">Classement & Votes</h1>
        <p className="mt-2 text-muted-foreground">{challenge.name}</p>
      </header>

      <section className="mb-10 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-text">
          Liens publics
        </h2>
        <ChallengeRankingsPublicLinks
          structure={challenge.structure}
          challengeSlug={challenge.slug}
          challengeStatus={challenge.status}
          rankingPublished={ranking.published}
          votesPublished={votes.enabled && votes.published}
        />
      </section>

      <Card className="mb-10 p-6 space-y-6">
        <h2 className="font-semibold">Publication</h2>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <Label className="text-base">Publier le classement</Label>
            <p className="text-xs text-muted-foreground">
              Affiche la page /classement avec le score combiné jury + votes
            </p>
          </div>
          <Switch
            checked={ranking.published}
            disabled={!canEdit}
            onCheckedChange={(v) => setRanking((r) => (r ? { ...r, published: v } : r))}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <Label className="text-base">Activer les votes publics</Label>
            <p className="text-xs text-muted-foreground">Permet aux visiteurs de voter (1 vote / email)</p>
          </div>
          <Switch
            checked={votes.enabled}
            disabled={!canEdit}
            onCheckedChange={(v) => setVotes((s) => (s ? { ...s, enabled: v } : s))}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <Label className="text-base">Publier la page de vote</Label>
            <p className="text-xs text-muted-foreground">Ouvre /votes aux visiteurs</p>
          </div>
          <Switch
            checked={votes.published}
            disabled={!canEdit || !votes.enabled}
            onCheckedChange={(v) => setVotes((s) => (s ? { ...s, published: v } : s))}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <Label className="text-base">Afficher le détail jury</Label>
            <p className="text-xs text-muted-foreground">Notes moyennes du jury sur le classement public</p>
          </div>
          <Switch
            checked={ranking.showJuryDetails}
            disabled={!canEdit}
            onCheckedChange={(v) => setRanking((r) => (r ? { ...r, showJuryDetails: v } : r))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Poids jury (0–1)</Label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              disabled={!canEdit}
              value={ranking.juryWeight}
              onChange={(e) =>
                setRanking((r) =>
                  r ? { ...r, juryWeight: Number.parseFloat(e.target.value) || 0 } : r,
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Poids votes (0–1)</Label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              disabled={!canEdit}
              value={ranking.voteWeight}
              onChange={(e) =>
                setRanking((r) =>
                  r ? { ...r, voteWeight: Number.parseFloat(e.target.value) || 0 } : r,
                )
              }
            />
          </div>
        </div>

        {canEdit && (
          <Button onClick={saveSettings} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer les paramètres
          </Button>
        )}
      </Card>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Aperçu du classement</h2>
          <div className="flex gap-2">
            {stats && (
              <>
                <Badge variant="secondary">{stats.rankedCandidates} candidat(s)</Badge>
                <Badge variant="outline">
                  <Heart className="mr-1 h-3 w-3" />
                  {stats.totalVotes} vote(s)
                </Badge>
              </>
            )}
          </div>
        </div>

        {rankings.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Medal className="mx-auto h-10 w-10 opacity-40" />
            <p className="mt-3">Aucun candidat avec vidéo publiée pour l&apos;instant.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y">
              {rankings.map((row) => (
                <li
                  key={row.candidateId}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3',
                    row.rank <= 3 && 'bg-gold/[0.04]',
                  )}
                >
                  <span className="w-8 text-center font-bold text-gold-text">{row.rank}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{row.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.juryEvaluationCount} éval. jury · {row.voteCount} vote(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">{row.combinedScore.toFixed(2)}</p>
                    {row.juryAverage != null && (
                      <p className="flex items-center justify-end gap-0.5 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {row.juryAverage.toFixed(1)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  )
}
