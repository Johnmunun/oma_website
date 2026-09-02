'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Trophy,
  Users,
  Video,
  Gavel,
  BarChart3,
  Film,
  Radio,
  Settings,
  Lock,
  ChevronRight,
  Clock,
  UserCheck,
  XCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import { ChallengeRegistrationShareLink } from '@/components/admin/challenge-registration-share-link'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChallengeDetail {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
  structure: {
    id: string
    name: string
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
}

interface CandidateStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

interface VideoStats {
  total: number
  pending: number
  published: number
  rejected: number
}

interface JuryStats {
  memberCount: number
  activeMembers: number
  evaluationCount: number
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  ARCHIVED: 'Archivé',
}

const MODULES: Array<{
  key: string
  label: string
  icon: typeof Users
  href?: string
  soon?: boolean
}> = [
  { key: 'candidates.view', label: 'Candidats', icon: Users, href: 'candidates' },
  { key: 'videos.view', label: 'Vidéos', icon: Video, href: 'videos' },
  { key: 'jury.view', label: 'Jury', icon: Gavel, href: 'jury' },
  { key: 'challenges.view', label: 'Classement & Votes', icon: BarChart3, href: 'rankings' },
  { key: 'live.view', label: 'Live', icon: Radio, soon: true },
  { key: 'challenges.settings', label: 'Paramètres', icon: Settings, soon: true },
]

export default function ChallengeDashboardPage() {
  const params = useParams()
  const id = params.id as string
  const { can, loaded } = useAdminPermissions()
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null)
  const [stats, setStats] = useState<CandidateStats | null>(null)
  const [videoStats, setVideoStats] = useState<VideoStats | null>(null)
  const [juryStats, setJuryStats] = useState<JuryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loaded || !can('challenges.view')) {
      if (loaded) setIsLoading(false)
      return
    }

    Promise.all([
      fetch(`/api/admin/challenges/${id}`, { cache: 'no-store' }).then((r) => r.json()),
      can('candidates.view')
        ? fetch(`/api/admin/challenges/${id}/candidates/stats`, { cache: 'no-store' }).then(
            (r) => r.json()
          )
        : Promise.resolve(null),
      can('videos.view')
        ? fetch(`/api/admin/challenges/${id}/videos/stats`, { cache: 'no-store' }).then((r) =>
            r.json()
          )
        : Promise.resolve(null),
      can('jury.view')
        ? fetch(`/api/admin/challenges/${id}/jury/stats`, { cache: 'no-store' }).then((r) =>
            r.json()
          )
        : Promise.resolve(null),
    ])
      .then(([challengeRes, statsRes, videoStatsRes, juryStatsRes]) => {
        if (challengeRes.success) setChallenge(challengeRes.data)
        else toast.error(challengeRes.error)
        if (statsRes?.success) setStats(statsRes.data)
        if (videoStatsRes?.success) setVideoStats(videoStatsRes.data)
        if (juryStatsRes?.success) {
          setJuryStats({
            memberCount: juryStatsRes.data.memberCount,
            activeMembers: juryStatsRes.data.activeMembers,
            evaluationCount: juryStatsRes.data.evaluationCount,
          })
        }
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setIsLoading(false))
  }, [id, loaded, can])

  if (loaded && !can('challenges.view')) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center text-muted-foreground">
        Accès refusé — permission <code className="text-sm">challenges.view</code> requise.
      </div>
    )
  }

  if (isLoading) return <PageSkeleton />

  if (!challenge) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Challenge introuvable</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/admin/challenges">Retour aux challenges</Link>
        </Button>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Candidats inscrits',
      value: stats?.total ?? '—',
      icon: Users,
      accent: 'text-gold-text bg-gold/10',
    },
    {
      label: 'Validés',
      value: stats?.approved ?? '—',
      icon: UserCheck,
      accent: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      label: 'En attente',
      value: stats?.pending ?? '—',
      icon: Clock,
      accent: 'text-amber-600 bg-amber-500/10',
    },
    {
      label: 'Rejetés',
      value: stats?.rejected ?? '—',
      icon: XCircle,
      accent: 'text-red-600 bg-red-500/10',
    },
    {
      label: 'Vidéos reçues',
      value: videoStats?.total ?? '—',
      icon: Video,
      accent: 'text-blue-600 bg-blue-500/10',
    },
    {
      label: 'Vidéos publiées',
      value: videoStats?.published ?? '—',
      icon: Film,
      accent: 'text-indigo-600 bg-indigo-500/10',
    },
    {
      label: 'Membres jury',
      value: juryStats?.activeMembers ?? '—',
      icon: Gavel,
      accent: 'text-violet-600 bg-violet-500/10',
    },
    {
      label: 'Évaluations',
      value: juryStats?.evaluationCount ?? '—',
      icon: BarChart3,
      accent: 'text-indigo-600 bg-indigo-500/10',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-8 flex justify-center">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/challenges">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Retour aux challenges
          </Link>
        </Button>
      </div>

      <header className="mx-auto mb-10 max-w-2xl text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 ring-1 ring-gold/20 shadow-sm">
          <Trophy className="h-8 w-8 text-gold-text" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{challenge.structure.name}</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {challenge.name}
        </h1>
        {challenge.description && (
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {challenge.description}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Badge
            variant={challenge.status === 'ACTIVE' ? 'default' : 'secondary'}
            className="px-3 py-1"
          >
            {STATUS_LABELS[challenge.status] ?? challenge.status}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {challenge.slug}
          </Badge>
        </div>
      </header>

      <div className="mx-auto mb-10 max-w-2xl">
        <ChallengeRegistrationShareLink
          structure={challenge.structure}
          challengeSlug={challenge.slug}
          challengeStatus={challenge.status}
          challengeName={challenge.name}
        />
      </div>

      <section className="mb-12">
        <div className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-text">
            Statistiques
          </p>
          <h2 className="mt-1 text-lg font-semibold">Vue d&apos;ensemble</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {statCards.map(({ label, value, icon: Icon, accent }) => (
            <Card
              key={label}
              className="flex flex-col items-center justify-center border-border/60 p-5 text-center shadow-sm transition hover:shadow-md"
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

      <section>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
            <Sparkles className="h-4 w-4 text-gold-text" />
          </div>
          <h2 className="text-lg font-semibold">Modules du challenge</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accédez aux fonctionnalités selon vos permissions
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            const allowed = can(mod.key)
            const disabled = mod.soon || !allowed
            const href = mod.href ? `/admin/challenges/${id}/${mod.href}` : undefined

            const content = (
              <Card
                className={cn(
                  'group flex flex-col items-center gap-3 p-6 text-center transition-all',
                  !disabled && href && 'cursor-pointer hover:border-gold/40 hover:bg-gold/[0.03] hover:shadow-md',
                  disabled && 'opacity-55'
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                    !disabled && href ? 'bg-gold/10 group-hover:bg-gold/15' : 'bg-muted'
                  )}
                >
                  <Icon className={cn('h-6 w-6', !disabled && href ? 'text-gold-text' : 'text-muted-foreground')} />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">{mod.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {mod.soon
                      ? 'Bientôt disponible'
                      : allowed
                        ? href
                          ? 'Ouvrir le module'
                          : 'Accès autorisé'
                        : 'Permission requise'}
                  </p>
                </div>
                <div className="mt-1">
                  {disabled ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : href ? (
                    <ChevronRight className="h-4 w-4 text-gold-text transition group-hover:translate-x-0.5" />
                  ) : null}
                </div>
              </Card>
            )

            if (!disabled && href) {
              return (
                <Link key={mod.label} href={href} className="block">
                  {content}
                </Link>
              )
            }

            return <div key={mod.label}>{content}</div>
          })}
        </div>
      </section>
    </div>
  )
}
