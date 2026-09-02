'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { slugifyStructureName } from '@/lib/structures/slug'
import { ChallengeRegistrationShareLink } from '@/components/admin/challenge-registration-share-link'
import { ChallengeRegistrationSettingsEditor } from '@/components/admin/challenge-registration-settings-editor'
import { toast } from 'sonner'
import {
  DEFAULT_CHALLENGE_REGISTRATION_SETTINGS,
  mergeChallengeSettings,
  parseChallengeCoverImageUrl,
  parseChallengeSettings,
  type ChallengeRegistrationSettings,
} from '@/lib/challenges/challenge-registration-settings'

export type ChallengeFormData = {
  name: string
  slug: string
  description: string
  status: string
  structureId: string
  registrationSettings: ChallengeRegistrationSettings
  coverImageUrl: string
}

const STATUSES = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'ACTIVE', label: 'Actif (publié)' },
  { value: 'ARCHIVED', label: 'Archivé' },
] as const

const EMPTY: ChallengeFormData = {
  name: '',
  slug: '',
  description: '',
  status: 'DRAFT',
  structureId: '',
  registrationSettings: DEFAULT_CHALLENGE_REGISTRATION_SETTINGS,
  coverImageUrl: '',
}

interface StructureOption {
  id: string
  name: string
  slug: string
  landingPagePath?: string | null
  subdomain?: string | null
}

interface ChallengeDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ChallengeFormData) => Promise<void>
  structures: StructureOption[]
  initialStructure?: StructureOption | null
  initialData?: Partial<ChallengeFormData> & { id?: string; settings?: unknown } | null
  defaultStructureId?: string
}

export function ChallengeDrawer({
  isOpen,
  onClose,
  onSubmit,
  structures,
  initialStructure,
  initialData,
  defaultStructureId,
}: ChallengeDrawerProps) {
  const [form, setForm] = useState<ChallengeFormData>(EMPTY)
  const [slugTouched, setSlugTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const isEdit = Boolean(initialData?.id)

  const structureOptions = useMemo(() => {
    const byId = new Map(structures.map((s) => [s.id, s]))
    if (initialStructure?.id && !byId.has(initialStructure.id)) {
      byId.set(initialStructure.id, initialStructure)
    }
    return Array.from(byId.values())
  }, [structures, initialStructure])

  useEffect(() => {
    if (!isOpen) return
    if (initialData?.id) {
      const structureId =
        initialData.structureId ?? initialStructure?.id ?? ''
      setForm({
        name: initialData.name ?? '',
        slug: initialData.slug ?? '',
        description: initialData.description ?? '',
        status: initialData.status ?? 'DRAFT',
        structureId,
        registrationSettings: initialData.registrationSettings
          ?? parseChallengeSettings(initialData.settings),
        coverImageUrl: parseChallengeCoverImageUrl(initialData.settings) ?? '',
      })
      setSlugTouched(true)
    } else {
      setForm({
        ...EMPTY,
        structureId: defaultStructureId ?? structureOptions[0]?.id ?? '',
      })
      setSlugTouched(false)
    }
  }, [isOpen, initialData, initialStructure, defaultStructureId, structureOptions])

  const selectedStructure = useMemo(() => {
    return (
      structureOptions.find((s) => s.id === form.structureId) ??
      initialStructure ??
      null
    )
  }, [structureOptions, form.structureId, initialStructure])

  const lockedStructureName = selectedStructure?.name ?? initialStructure?.name ?? ''

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo")
      return
    }

    try {
      setUploadingCover(true)
      const body = new FormData()
      body.append('file', file)
      body.append('folder', '/challenges')

      const res = await fetch('/api/uploads', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur upload')

      if (data.success && data.data?.url) {
        setForm((f) => ({ ...f, coverImageUrl: data.data.url }))
        toast.success('Image de couverture uploadée')
      } else {
        throw new Error(data.error || 'Erreur inconnue')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.structureId && !isEdit) {
      toast.error('Veuillez sélectionner une structure')
      return
    }

    const structureId = form.structureId || initialStructure?.id || ''
    if (!structureId) {
      toast.error('Structure introuvable pour ce challenge')
      return
    }

    const slug = form.slug.trim().toLowerCase()
    if (!/^[a-z0-9-]+$/.test(slug)) {
      toast.error('Slug invalide : utilisez uniquement des minuscules, chiffres et tirets')
      return
    }

    if (!form.name.trim()) {
      toast.error('Le nom du challenge est requis')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ ...form, slug, name: form.name.trim(), structureId })
    } catch {
      // Erreur déjà affichée par la page parente
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-lg flex-col border-l border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-bold">
            {isEdit ? 'Modifier le challenge' : 'Nouveau challenge'}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          <div className="space-y-2">
            <Label>Structure *</Label>
            {isEdit ? (
              <>
                <Input readOnly value={lockedStructureName} className="bg-muted font-medium" />
                <p className="text-xs text-muted-foreground">
                  La structure est fixée à la création du challenge.
                </p>
              </>
            ) : (
              <Select
                value={form.structureId}
                onValueChange={(v) => setForm((f) => ({ ...f, structureId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une structure" />
                </SelectTrigger>
                <SelectContent>
                  {structureOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Nom *</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                setForm((f) => ({
                  ...f,
                  name,
                  slug: slugTouched ? f.slug : slugifyStructureName(name),
                }))
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setForm((f) => ({ ...f, slug: e.target.value }))
              }}
              pattern="[a-z0-9-]+"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Image de fond (page inscription)
            </Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingCover}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleCoverUpload(file)
              }}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => coverInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') coverInputRef.current?.click()
              }}
              className="cursor-pointer rounded-lg border-2 border-dashed border-border bg-muted/30 p-4 text-center transition hover:border-[var(--st-primary,#9333ea)]"
            >
              {form.coverImageUrl ? (
                <div className="space-y-2">
                  <img
                    src={form.coverImageUrl}
                    alt="Couverture"
                    className="mx-auto max-h-40 w-full rounded-lg object-cover"
                  />
                  <p className="text-xs text-muted-foreground">Cliquez pour remplacer</p>
                </div>
              ) : uploadingCover ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Upload en cours…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Bannière hero (comme les événements)</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP — max 10 Mo</p>
                </div>
              )}
            </div>
            {form.coverImageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setForm((f) => ({ ...f, coverImageUrl: '' }))}
              >
                Supprimer l&apos;image
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              « Actif » nécessite la permission challenges.publish
            </p>
          </div>

          <ChallengeRegistrationShareLink
            structure={selectedStructure}
            challengeSlug={form.slug}
            challengeStatus={form.status}
            challengeName={form.name || undefined}
          />

          <ChallengeRegistrationSettingsEditor
            value={form.registrationSettings}
            onChange={(registrationSettings) =>
              setForm((f) => ({ ...f, registrationSettings }))
            }
          />

          <div className="flex gap-3 border-t border-border pt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
