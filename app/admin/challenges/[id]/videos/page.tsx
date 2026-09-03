'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  Film,
  Plus,
  Search,
  Trash2,
  Video,
  XCircle,
} from 'lucide-react'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import {
  ChallengeVideoDrawer,
  type ChallengeVideoFormData,
} from '@/components/admin/challenge-video-drawer'
import { ChallengeVideoSubmitShareLink } from '@/components/admin/challenge-video-submit-share-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { resolveChallengeVideoPlayback } from '@/lib/videos/resolve-challenge-video-playback'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type VideoStatus = 'PENDING' | 'PUBLISHED' | 'REJECTED'

interface VideoRow {
  id: string
  title: string | null
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  source: string
  fileId?: string | null
  status: VideoStatus
  reviewNotes: string | null
  createdAt: string
  candidate: {
    id: string
    fullName: string
    email: string
    videoSubmitToken: string | null
  }
}

interface ChallengeInfo {
  id: string
  name: string
  slug: string
  structure: {
    name: string
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
}

interface ApprovedCandidate {
  id: string
  fullName: string
  email: string
  videoSubmitToken: string | null
}

const STATUS_LABELS: Record<VideoStatus, string> = {
  PENDING: 'En attente',
  PUBLISHED: 'Publiée',
  REJECTED: 'Rejetée',
}

const STATUS_VARIANT: Record<VideoStatus, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  PUBLISHED: 'default',
  REJECTED: 'destructive',
}

function VideoPreview({
  url,
  title,
  source,
  fileId,
}: {
  url: string
  title?: string | null
  source?: string | null
  fileId?: string | null
}) {
  const parsed = resolveChallengeVideoPlayback({
    videoUrl: url,
    source,
    fileId,
  })
  if (
    parsed &&
    (parsed.source === 'YOUTUBE' ||
      parsed.source === 'VIMEO' ||
      parsed.source === 'UPLOAD')
  ) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
        <iframe
          src={parsed.embedUrl}
          title={title || 'Vidéo'}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-primary underline"
    >
      Ouvrir la vidéo
    </a>
  )
}

export default function ChallengeVideosPage() {
  const params = useParams()
  const challengeId = params.id as string
  const { can, loaded } = useAdminPermissions()

  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null)
  const [videos, setVideos] = useState<VideoRow[]>([])
  const [approvedCandidates, setApprovedCandidates] = useState<ApprovedCandidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<VideoRow | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const query = new URLSearchParams()
      if (statusFilter !== 'all') query.set('status', statusFilter)
      if (search.trim()) query.set('search', search.trim())

      const [challengeRes, videosRes, candidatesRes] = await Promise.all([
        fetch(`/api/admin/challenges/${challengeId}`, { cache: 'no-store' }),
        fetch(`/api/admin/challenges/${challengeId}/videos?${query}`, { cache: 'no-store' }),
        fetch(`/api/admin/challenges/${challengeId}/candidates?status=APPROVED`, {
          cache: 'no-store',
        }),
      ])

      const challengeData = await challengeRes.json()
      const videosData = await videosRes.json()
      const candidatesData = await candidatesRes.json()

      if (!challengeRes.ok) throw new Error(challengeData.error)
      if (!videosRes.ok) throw new Error(videosData.error)

      setChallenge(challengeData.data)
      setVideos(videosData.data ?? [])
      setApprovedCandidates(
        (candidatesData.data ?? []).map(
          (c: ApprovedCandidate & { videoSubmitToken?: string | null }) => ({
            id: c.id,
            fullName: c.fullName,
            email: c.email,
            videoSubmitToken: c.videoSubmitToken ?? null,
          })
        )
      )
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [challengeId, search, statusFilter])

  useEffect(() => {
    if (!loaded || !can('videos.view')) {
      if (loaded) setIsLoading(false)
      return
    }
    void load()
  }, [loaded, can, load])

  const stats = useMemo(
    () => ({
      total: videos.length,
      pending: videos.filter((v) => v.status === 'PENDING').length,
      published: videos.filter((v) => v.status === 'PUBLISHED').length,
      rejected: videos.filter((v) => v.status === 'REJECTED').length,
    }),
    [videos]
  )

  const candidatesWithoutVideo = useMemo(() => {
    const withVideo = new Set(videos.map((v) => v.candidate.id))
    return approvedCandidates.filter((c) => !withVideo.has(c.id))
  }, [approvedCandidates, videos])

  const handleCreate = async (form: ChallengeVideoFormData) => {
    const res = await fetch(`/api/admin/challenges/${challengeId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: form.candidateId,
        title: form.title || null,
        description: form.description || null,
        videoUrl: form.videoUrl || null,
        fileId: form.fileId || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    toast.success('Vidéo enregistrée')
    setDrawerOpen(false)
    await load()
  }

  const handleUpdate = async (form: ChallengeVideoFormData) => {
    if (!editing) return
    const res = await fetch(`/api/admin/challenges/${challengeId}/videos/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title || null,
        description: form.description || null,
        videoUrl: form.videoUrl || null,
        fileId: form.fileId || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    toast.success('Vidéo mise à jour')
    setDrawerOpen(false)
    setEditing(null)
    await load()
  }

  const handleAction = async (video: VideoRow, action: 'publish' | 'reject' | 'unpublish') => {
    const permission =
      action === 'publish' ? 'videos.publish' : action === 'unpublish' ? 'videos.unpublish' : 'videos.update'
    if (!can(permission)) {
      toast.error('Permission insuffisante')
      return
    }
    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message)
      await load()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const handleDelete = async (video: VideoRow) => {
    if (!can('videos.delete')) {
      toast.error('Permission insuffisante')
      return
    }
    if (!confirm(`Supprimer la vidéo de « ${video.candidate.fullName} » ?`)) return
    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/videos/${video.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Vidéo supprimée')
      await load()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  if (loaded && !can('videos.view')) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center text-muted-foreground">
        Accès refusé — permission <code>videos.view</code> requise.
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
          <Video className="h-7 w-7 text-gold-text" />
        </div>
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Vidéos</h1>
        {challenge && (
          <p className="mt-3 text-muted-foreground">
            {challenge.name} · {challenge.structure.name}
          </p>
        )}
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, icon: Film, accent: 'text-gold-text bg-gold/10' },
          { label: 'En attente', value: stats.pending, icon: Clock, accent: 'text-amber-600 bg-amber-500/10' },
          { label: 'Publiées', value: stats.published, icon: CheckCircle2, accent: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Rejetées', value: stats.rejected, icon: XCircle, accent: 'text-red-600 bg-red-500/10' },
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

      {candidatesWithoutVideo.length > 0 && challenge && (
        <Card className="mb-6 border-amber-200/60 bg-amber-50/50 p-4">
          <p className="mb-3 text-sm font-medium text-amber-900">
            {candidatesWithoutVideo.length} candidat(s) approuvé(s) sans vidéo
          </p>
          <div className="space-y-3">
            {candidatesWithoutVideo.slice(0, 3).map((c) => (
              <ChallengeVideoSubmitShareLink
                key={c.id}
                structure={challenge.structure}
                challengeSlug={challenge.slug}
                candidateName={c.fullName}
                token={c.videoSubmitToken}
              />
            ))}
          </div>
        </Card>
      )}

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher candidat, titre…"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="PUBLISHED">Publiées</SelectItem>
              <SelectItem value="REJECTED">Rejetées</SelectItem>
            </SelectContent>
          </Select>
          {can('videos.upload') && (
            <Button
              onClick={() => {
                setEditing(null)
                setDrawerOpen(true)
              }}
              disabled={approvedCandidates.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          )}
        </div>
      </Card>

      {videos.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Aucune vidéo pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <Card key={video.id} className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row">
                <VideoPreview
                  url={video.videoUrl}
                  title={video.title}
                  source={video.source}
                  fileId={video.fileId}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{video.title || 'Sans titre'}</h3>
                    <Badge variant={STATUS_VARIANT[video.status]}>
                      {STATUS_LABELS[video.status]}
                    </Badge>
                    <Badge variant="outline">{video.source}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {video.candidate.fullName} · {video.candidate.email}
                  </p>
                  {video.description && (
                    <p className="mt-2 line-clamp-2 text-sm">{video.description}</p>
                  )}
                  {challenge && (
                    <div className="mt-3">
                      <ChallengeVideoSubmitShareLink
                        structure={challenge.structure}
                        challengeSlug={challenge.slug}
                        candidateName={video.candidate.fullName}
                        token={video.candidate.videoSubmitToken}
                      />
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {video.status === 'PENDING' && can('videos.publish') && (
                      <Button size="sm" onClick={() => handleAction(video, 'publish')}>
                        Publier
                      </Button>
                    )}
                    {video.status === 'PUBLISHED' && can('videos.unpublish') && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(video, 'unpublish')}>
                        Dépublier
                      </Button>
                    )}
                    {video.status === 'PENDING' && can('videos.update') && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(video, 'reject')}>
                        Rejeter
                      </Button>
                    )}
                    {can('videos.update') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(video)
                          setDrawerOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {can('videos.delete') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleDelete(video)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ChallengeVideoDrawer
        isOpen={drawerOpen}
        challengeId={challengeId}
        onClose={() => {
          setDrawerOpen(false)
          setEditing(null)
        }}
        candidates={approvedCandidates}
        initialData={
          editing
            ? {
                id: editing.id,
                candidateId: editing.candidate.id,
                title: editing.title ?? '',
                description: editing.description ?? '',
                videoUrl: editing.videoUrl,
                fileId: editing.fileId,
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
