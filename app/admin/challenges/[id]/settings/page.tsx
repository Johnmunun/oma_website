'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Loader2,
  Radio,
  Save,
  Settings,
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
import { Textarea } from '@/components/ui/textarea'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { slugifyStructureName } from '@/lib/structures/slug'
import {
  getChallengeHubUrl,
  getChallengeLiveUrl,
  getChallengeRankingsUrl,
  getChallengeRegistrationUrl,
} from '@/lib/structures/public-url'
import { toast } from 'sonner'

type ChallengeStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

interface ChallengeSettingsData {
  id: string
  name: string
  slug: string
  description: string | null
  status: ChallengeStatus
  startsAt: string | null
  endsAt: string | null
  structure: {
    name: string
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
}

const STATUS_OPTIONS: Array<{ value: ChallengeStatus; label: string }> = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'ACTIVE', label: 'Actif (publié)' },
  { value: 'ARCHIVED', label: 'Archivé' },
]

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

export default function ChallengeSettingsAdminPage() {
  const params = useParams()
  const challengeId = params.id as string
  const { can, loaded } = useAdminPermissions()

  const [challenge, setChallenge] = useState<ChallengeSettingsData | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ChallengeStatus>('DRAFT')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const canView = can('challenges.view') || can('challenges.settings')
  const canEdit = can('challenges.update') || can('challenges.settings')
  const canPublish = can('challenges.publish')

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/challenges/${challengeId}`, {
        cache: 'no-store',
      }).then((r) => r.json())

      if (!res.success) {
        toast.error(res.error || 'Erreur de chargement')
        return
      }

      const data = res.data as ChallengeSettingsData
      setChallenge(data)
      setName(data.name ?? '')
      setSlug(data.slug ?? '')
      setSlugTouched(true)
      setDescription(data.description ?? '')
      setStatus(data.status ?? 'DRAFT')
      setStartsAt(toDatetimeLocalValue(data.startsAt))
      setEndsAt(toDatetimeLocalValue(data.endsAt))
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

  const save = async () => {
    if (!canEdit) return
    if (status === 'ACTIVE' && !canPublish) {
      toast.error('Permission challenges.publish requise pour publier')
      return
    }

    const trimmedName = name.trim()
    const trimmedSlug = slug.trim().toLowerCase()
    if (trimmedName.length < 2) {
      toast.error('Le nom est trop court')
      return
    }
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      toast.error('Slug invalide (a-z, 0-9, tirets)')
      return
    }

    try {
      setIsSaving(true)
      const res = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          slug: trimmedSlug,
          description: description.trim() || null,
          status,
          startsAt: fromDatetimeLocalValue(startsAt),
          endsAt: fromDatetimeLocalValue(endsAt),
        }),
      }).then((r) => r.json())

      if (!res.success) {
        toast.error(res.error || 'Erreur de sauvegarde')
        return
      }

      const data = res.data as ChallengeSettingsData
      setChallenge(data)
      setName(data.name ?? '')
      setSlug(data.slug ?? '')
      setDescription(data.description ?? '')
      setStatus(data.status ?? 'DRAFT')
      setStartsAt(toDatetimeLocalValue(data.startsAt))
      setEndsAt(toDatetimeLocalValue(data.endsAt))
      toast.success('Paramètres enregistrés')
    } catch {
      toast.error('Erreur de sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  if (loaded && !canView) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center text-muted-foreground">
        Accès refusé — permission challenges.view requise.
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

  const hubUrl = getChallengeHubUrl(challenge.structure, challenge.slug)
  const registrationUrl = getChallengeRegistrationUrl(
    challenge.structure,
    challenge.slug
  )
  const rankingsUrl = getChallengeRankingsUrl(challenge.structure, challenge.slug)
  const liveUrl = getChallengeLiveUrl(challenge.structure, challenge.slug)

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
            <Settings className="h-5 w-5 text-gold-text" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">
              Paramètres
            </h1>
            <p className="text-sm text-muted-foreground">{challenge.structure.name}</p>
          </div>
        </div>
        <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
          {STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status}
        </Badge>
      </header>

      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold">Identité</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Nom public, slug d&apos;URL et description du challenge
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ch-name">Nom</Label>
            <Input
              id="ch-name"
              value={name}
              disabled={!canEdit}
              onChange={(e) => {
                const next = e.target.value
                setName(next)
                if (!slugTouched) setSlug(slugifyStructureName(next))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ch-slug">Slug</Label>
            <Input
              id="ch-slug"
              className="font-mono text-sm"
              value={slug}
              disabled={!canEdit}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ch-desc">Description</Label>
            <Textarea
              id="ch-desc"
              rows={4}
              value={description}
              disabled={!canEdit}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={status}
              disabled={!canEdit}
              onValueChange={(v) => setStatus(v as ChallengeStatus)}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === 'ACTIVE' && !canPublish && status !== 'ACTIVE'}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold">Période</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Affichée sur le hub public du challenge
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ch-starts">Début</Label>
              <Input
                id="ch-starts"
                type="datetime-local"
                value={startsAt}
                disabled={!canEdit}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-ends">Fin</Label>
              <Input
                id="ch-ends"
                type="datetime-local"
                value={endsAt}
                disabled={!canEdit}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold">Liens utiles</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: 'Hub public', href: hubUrl, external: true },
              { label: 'Inscription', href: registrationUrl, external: true },
              {
                label: 'Classement & votes',
                href: `/admin/challenges/${challengeId}/rankings`,
                icon: BarChart3,
              },
              {
                label: 'Live Cloudflare',
                href: `/admin/challenges/${challengeId}/live`,
                icon: Radio,
              },
              { label: 'Page Live publique', href: liveUrl, external: true },
              {
                label: 'Classement public',
                href: rankingsUrl,
                external: true,
              },
            ].map((item) => (
              <Button
                key={item.label}
                variant="outline"
                size="sm"
                className="justify-between"
                asChild
              >
                <a
                  href={item.href}
                  {...(item.external
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                >
                  {item.label}
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Inscription / couverture image : modifiables depuis la liste des
            challenges (tiroir d&apos;édition).
          </p>
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
