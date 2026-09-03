'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Radio,
  Save,
} from 'lucide-react'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import { ChallengePublicLink } from '@/components/admin/challenge-rankings-public-links'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import {
  resolveLiveEmbedUrl,
  resolveReplayEmbedUrl,
  type ChallengeLiveSettings,
} from '@/lib/challenges/challenge-live-settings'
import { toast } from 'sonner'

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

const EMPTY_LIVE: ChallengeLiveSettings = {
  enabled: false,
  isLive: false,
  showOnHub: true,
  title: null,
  description: null,
  customerCode: null,
  liveInputId: null,
  embedUrl: null,
  dvrEnabled: false,
  scheduledAt: null,
  replayEnabled: false,
  vodVideoId: null,
  replayEmbedUrl: null,
}

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export default function ChallengeLiveAdminPage() {
  const params = useParams()
  const challengeId = params.id as string
  const { can, loaded } = useAdminPermissions()

  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null)
  const [live, setLive] = useState<ChallengeLiveSettings>(EMPTY_LIVE)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const canEdit = can('live.update') || can('challenges.settings')
  const canView = can('live.view') || can('challenges.view')

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/challenges/${challengeId}/live`, {
        cache: 'no-store',
      }).then((r) => r.json())

      if (!res.success) {
        toast.error(res.error || 'Erreur de chargement')
        return
      }

      setChallenge(res.data.challenge)
      setLive({ ...EMPTY_LIVE, ...res.data.live })
      setPublicUrl(res.data.publicUrl ?? null)
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

  const previewEmbed = useMemo(() => resolveLiveEmbedUrl(live), [live])
  const previewReplay = useMemo(() => resolveReplayEmbedUrl(live), [live])

  const save = async () => {
    if (!canEdit) return
    try {
      setIsSaving(true)
      const res = await fetch(`/api/admin/challenges/${challengeId}/live`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ live }),
      }).then((r) => r.json())

      if (!res.success) {
        toast.error(res.error || 'Erreur de sauvegarde')
        return
      }

      setLive({ ...EMPTY_LIVE, ...res.data.live })
      setPublicUrl(res.data.publicUrl ?? publicUrl)
      toast.success('Live enregistré')
    } catch {
      toast.error('Erreur de sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  if (loaded && !canView) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center text-muted-foreground">
        Accès refusé — permission Live ou challenges.view requise.
      </div>
    )
  }

  if (isLoading) return <PageSkeleton />

  if (!challenge) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Challenge introuvable</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/admin/challenges">Retour</Link>
        </Button>
      </div>
    )
  }

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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
            <Radio className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">
              Live Cloudflare
            </h1>
            <p className="text-sm text-muted-foreground">{challenge.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={live.enabled ? 'default' : 'secondary'}>
            {live.enabled ? 'Page publique active' : 'Page publique désactivée'}
          </Badge>
          {live.isLive && (
            <Badge className="bg-red-600 hover:bg-red-600">En direct</Badge>
          )}
        </div>
      </header>

      <div className="space-y-6">
        <Card className="space-y-5 p-5">
          <div>
            <h2 className="text-sm font-semibold">Diffusion</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Créez un Live Input dans Cloudflare Stream, puis collez l&apos;URL iframe
              ou le customer code + Live Input ID.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="live-enabled">Activer la page Live</Label>
              <p className="text-xs text-muted-foreground">
                Rend `/live` accessible aux spectateurs
              </p>
            </div>
            <Switch
              id="live-enabled"
              checked={live.enabled}
              disabled={!canEdit}
              onCheckedChange={(enabled) => setLive((s) => ({ ...s, enabled }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="live-onair">En direct maintenant</Label>
              <p className="text-xs text-muted-foreground">
                Affiche le badge Live et le lecteur Cloudflare
              </p>
            </div>
            <Switch
              id="live-onair"
              checked={live.isLive}
              disabled={!canEdit}
              onCheckedChange={(isLive) => setLive((s) => ({ ...s, isLive }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="live-hub">Afficher sur le hub</Label>
              <p className="text-xs text-muted-foreground">
                Bouton Live sur la page publique du challenge
              </p>
            </div>
            <Switch
              id="live-hub"
              checked={live.showOnHub}
              disabled={!canEdit}
              onCheckedChange={(showOnHub) => setLive((s) => ({ ...s, showOnHub }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="live-dvr">DVR (reculer dans le live)</Label>
              <p className="text-xs text-muted-foreground">
                Ajoute `dvrEnabled=true` à l&apos;iframe Cloudflare
              </p>
            </div>
            <Switch
              id="live-dvr"
              checked={live.dvrEnabled}
              disabled={!canEdit}
              onCheckedChange={(dvrEnabled) => setLive((s) => ({ ...s, dvrEnabled }))}
            />
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">Textes affichés</h2>
          <div className="space-y-2">
            <Label htmlFor="live-title">Titre</Label>
            <Input
              id="live-title"
              value={live.title ?? ''}
              disabled={!canEdit}
              placeholder="Soirée de sélection — en direct"
              onChange={(e) =>
                setLive((s) => ({ ...s, title: e.target.value || null }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="live-desc">Description</Label>
            <Textarea
              id="live-desc"
              rows={3}
              value={live.description ?? ''}
              disabled={!canEdit}
              placeholder="Suivez la soirée en direct avec le jury et les talents."
              onChange={(e) =>
                setLive((s) => ({ ...s, description: e.target.value || null }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="live-scheduled">Horaire annoncé</Label>
            <Input
              id="live-scheduled"
              type="datetime-local"
              value={toDatetimeLocalValue(live.scheduledAt)}
              disabled={!canEdit}
              onChange={(e) =>
                setLive((s) => ({
                  ...s,
                  scheduledAt: fromDatetimeLocalValue(e.target.value),
                }))
              }
            />
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold">Cloudflare Stream</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Dashboard Cloudflare → Stream → Live inputs → Embed. Collez l&apos;URL
              iframe, ou renseignez customer + Live Input ID.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="live-embed">URL iframe (recommandé)</Label>
            <Input
              id="live-embed"
              className="font-mono text-xs"
              value={live.embedUrl ?? ''}
              disabled={!canEdit}
              placeholder="https://customer-xxxx.cloudflarestream.com/INPUT_ID/iframe"
              onChange={(e) =>
                setLive((s) => ({ ...s, embedUrl: e.target.value || null }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="live-customer">Customer code</Label>
              <Input
                id="live-customer"
                className="font-mono text-xs"
                value={live.customerCode ?? ''}
                disabled={!canEdit}
                placeholder="customer-xxxx ou xxxx"
                onChange={(e) =>
                  setLive((s) => ({ ...s, customerCode: e.target.value || null }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="live-input">Live Input ID</Label>
              <Input
                id="live-input"
                className="font-mono text-xs"
                value={live.liveInputId ?? ''}
                disabled={!canEdit}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                onChange={(e) =>
                  setLive((s) => ({ ...s, liveInputId: e.target.value || null }))
                }
              />
            </div>
          </div>

          {previewEmbed && (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Aperçu lecteur live
              </p>
              <div className="relative aspect-video overflow-hidden rounded-md bg-black">
                <iframe
                  src={previewEmbed}
                  title="Aperçu Live Cloudflare"
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
              <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">
                {previewEmbed}
              </p>
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold">Replay VOD</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Après le live, Cloudflare génère une vidéo. Collez le Video ID ou
              l&apos;URL iframe pour proposer le replay sur la même page publique.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="live-replay">Activer le replay</Label>
              <p className="text-xs text-muted-foreground">
                Affiché quand « En direct » est désactivé
              </p>
            </div>
            <Switch
              id="live-replay"
              checked={live.replayEnabled}
              disabled={!canEdit}
              onCheckedChange={(replayEnabled) =>
                setLive((s) => ({ ...s, replayEnabled }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live-replay-embed">URL iframe replay</Label>
            <Input
              id="live-replay-embed"
              className="font-mono text-xs"
              value={live.replayEmbedUrl ?? ''}
              disabled={!canEdit}
              placeholder="https://customer-xxxx.cloudflarestream.com/VIDEO_ID/iframe"
              onChange={(e) =>
                setLive((s) => ({
                  ...s,
                  replayEmbedUrl: e.target.value || null,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live-vod">Video ID VOD</Label>
            <Input
              id="live-vod"
              className="font-mono text-xs"
              value={live.vodVideoId ?? ''}
              disabled={!canEdit}
              placeholder="Utilise le customer code ci-dessus"
              onChange={(e) =>
                setLive((s) => ({ ...s, vodVideoId: e.target.value || null }))
              }
            />
          </div>

          {previewReplay && (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Aperçu replay
              </p>
              <div className="relative aspect-video overflow-hidden rounded-md bg-black">
                <iframe
                  src={previewReplay}
                  title="Aperçu Replay Cloudflare"
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </Card>

        <ChallengePublicLink
          title="Lien public Live"
          description="Partagez ce lien pendant la diffusion"
          url={live.enabled ? publicUrl : null}
          disabled={!live.enabled}
          disabledHint="Activez d’abord la page Live"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://dash.cloudflare.com/?to=/:account/stream/inputs"
              target="_blank"
              rel="noreferrer"
            >
              Cloudflare Live inputs
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>

          {canEdit && (
            <Button onClick={() => void save()} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Enregistrer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
