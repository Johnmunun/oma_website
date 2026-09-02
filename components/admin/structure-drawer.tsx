'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react'
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
import { LogoUpload } from '@/components/admin/logo-upload'
import { EXPERTISE_ICON_OPTIONS } from '@/lib/expertise/domain-icons'
import { DEFAULT_LANDING_SERVICES } from '@/lib/structures/default-landing-services'
import type { LandingServiceInput } from '@/lib/structures/landing-service-schema'
import { slugifyStructureName } from '@/lib/structures/slug'
import { getStructurePublicUrls } from '@/lib/structures/public-url'
import { toast } from 'sonner'

export type StructureFormData = {
  name: string
  slug: string
  type: string
  description: string
  logoUrl: string
  status: string
  parentId: string
  expertiseDomainId: string
  subdomain: string
  landingPagePath: string
  landingHeroTitle: string
  landingHeroHighlight: string
  landingHeroSubtitle: string
  landingThemeColor: string
  landingServicesIntro: string
  landingServices: LandingServiceInput[]
  showOnLanding: boolean
  landingOrder: number
  publicUrl: string
}

export interface StructureOption {
  id: string
  name: string
  slug: string
  parentId?: string | null
}

interface StructureDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StructureFormData) => Promise<void>
  structures: StructureOption[]
  initialData?: Partial<StructureFormData> & { id?: string } | null
}

const STRUCTURE_TYPES = [
  { value: 'OMA_INTERNAL', label: 'OMA Interne' },
  { value: 'PARTNER', label: 'Partenaire' },
  { value: 'COMPANY', label: 'Entreprise' },
  { value: 'ASSOCIATION', label: 'Association' },
  { value: 'MEDIA', label: 'Média' },
] as const

const STRUCTURE_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING', label: 'En attente' },
] as const

const EMPTY_FORM: StructureFormData = {
  name: '',
  slug: '',
  type: 'PARTNER',
  description: '',
  logoUrl: '',
  status: 'ACTIVE',
  parentId: '',
  expertiseDomainId: '',
  subdomain: '',
  landingPagePath: '',
  landingHeroTitle: '',
  landingHeroHighlight: '',
  landingHeroSubtitle: '',
  landingThemeColor: '#f97316',
  landingServicesIntro: '',
  landingServices: DEFAULT_LANDING_SERVICES.map((service) => ({ ...service })),
  showOnLanding: false,
  landingOrder: 0,
  publicUrl: '',
}

export function StructureDrawer({
  isOpen,
  onClose,
  onSubmit,
  structures,
  initialData,
}: StructureDrawerProps) {
  const [form, setForm] = useState<StructureFormData>(EMPTY_FORM)
  const [slugTouched, setSlugTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expertiseDomains, setExpertiseDomains] = useState<{ id: string; name: string }[]>([])
  const formInitializedFor = useRef<string | null>(null)

  const isEditMode = Boolean(initialData?.id)

  const parentOptions = useMemo(() => {
    if (!isEditMode || !initialData?.id) return structures
    return structures.filter((s) => s.id !== initialData.id)
  }, [structures, isEditMode, initialData?.id])

  const publicUrls = useMemo(
    () =>
      getStructurePublicUrls({
        slug: form.slug || slugifyStructureName(form.name) || 'structure',
        landingPagePath: form.landingPagePath,
        subdomain: form.subdomain,
      }),
    [form.slug, form.name, form.landingPagePath, form.subdomain]
  )

  useEffect(() => {
    if (!isOpen) {
      formInitializedFor.current = null
      return
    }

    fetch('/api/admin/expertise-domains')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setExpertiseDomains(res.data ?? [])
      })
      .catch(() => {})
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const sessionKey = initialData?.id ?? '__create__'
    if (formInitializedFor.current === sessionKey) return
    formInitializedFor.current = sessionKey

    if (initialData?.id) {
      setForm({
        name: initialData.name ?? '',
        slug: initialData.slug ?? '',
        type: initialData.type ?? 'PARTNER',
        description: initialData.description ?? '',
        logoUrl: initialData.logoUrl ?? '',
        status: initialData.status ?? 'ACTIVE',
        parentId: initialData.parentId ?? '',
        expertiseDomainId: initialData.expertiseDomainId ?? '',
        subdomain: initialData.subdomain ?? '',
        landingPagePath: initialData.landingPagePath ?? '',
        landingHeroTitle: initialData.landingHeroTitle ?? '',
        landingHeroHighlight: initialData.landingHeroHighlight ?? '',
        landingHeroSubtitle: initialData.landingHeroSubtitle ?? '',
        landingThemeColor: initialData.landingThemeColor ?? '#f97316',
        landingServicesIntro: initialData.landingServicesIntro ?? '',
        landingServices:
          initialData.landingServices && initialData.landingServices.length > 0
            ? initialData.landingServices.map((service) => ({ ...service }))
            : DEFAULT_LANDING_SERVICES.map((service) => ({ ...service })),
        showOnLanding: initialData.showOnLanding ?? false,
        landingOrder: initialData.landingOrder ?? 0,
        publicUrl: initialData.publicUrl ?? '',
      })
      setSlugTouched(true)
    } else {
      const defaultParent =
        structures.find((s) => s.slug === 'oma')?.id ?? structures[0]?.id ?? ''
      setForm({ ...EMPTY_FORM, parentId: defaultParent })
      setSlugTouched(false)
    }
  }, [isOpen, initialData, structures])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const invalidService = form.landingServices.find((service) => !service.title.trim())
    if (invalidService) {
      toast.error('Chaque service doit avoir un titre')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateService = (index: number, patch: Partial<LandingServiceInput>) => {
    setForm((prev) => ({
      ...prev,
      landingServices: prev.landingServices.map((service, i) =>
        i === index ? { ...service, ...patch } : service
      ),
    }))
  }

  const moveService = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.landingServices.length) return prev
      const services = [...prev.landingServices]
      const [item] = services.splice(index, 1)
      services.splice(nextIndex, 0, item)
      return { ...prev, landingServices: services }
    })
  }

  const removeService = (index: number) => {
    setForm((prev) => ({
      ...prev,
      landingServices: prev.landingServices.filter((_, i) => i !== index),
    }))
  }

  const addService = () => {
    if (form.landingServices.length >= 12) {
      toast.error('Maximum 12 services')
      return
    }
    setForm((prev) => ({
      ...prev,
      landingServices: [
        ...prev.landingServices,
        { title: '', description: '', iconKey: 'mic' },
      ],
    }))
  }

  const resetServicesToDefaults = () => {
    setForm((prev) => ({
      ...prev,
      landingServices: DEFAULT_LANDING_SERVICES.map((service) => ({ ...service })),
    }))
  }

  const persistLogoUrl = async (url: string) => {
    if (!isEditMode || !initialData?.id) return
    try {
      const res = await fetch(`/api/admin/structures/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: url || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde du logo')
      toast.success('Logo enregistré')
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Logo uploadé — cliquez Enregistrer pour confirmer'
      )
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed right-0 top-0 h-screen w-full sm:max-w-xl bg-background border-l border-border shadow-xl z-50 overflow-y-auto transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditMode ? 'Modifier la structure' : 'Créer une structure'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Logo</Label>
            <LogoUpload
              currentLogoUrl={form.logoUrl || null}
              folder="/structures/logos"
              onUploadComplete={(url) => {
                setForm((prev) => ({ ...prev, logoUrl: url }))
                void persistLogoUrl(url)
              }}
              onRemove={() => {
                setForm((prev) => ({ ...prev, logoUrl: '' }))
                void persistLogoUrl('')
              }}
            />
            {isEditMode && (
              <p className="text-xs text-muted-foreground">
                Le logo est enregistré automatiquement après l&apos;upload.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="structure-name">Nom *</Label>
            <Input
              id="structure-name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                setForm((prev) => ({
                  ...prev,
                  name,
                  slug: slugTouched ? prev.slug : slugifyStructureName(name),
                }))
              }}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="structure-slug">Slug *</Label>
              <Input
                id="structure-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }}
                pattern="[a-z0-9-]+"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRUCTURE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut *</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRUCTURE_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parent / Réseau</Label>
              <Select
                value={form.parentId || 'none'}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    parentId: value === 'none' ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun parent</SelectItem>
                  {parentOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Domaine d&apos;expertise</Label>
              <Select
                value={form.expertiseDomainId || 'none'}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    expertiseDomainId: value === 'none' ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un domaine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun domaine</SelectItem>
                  {expertiseDomains.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-4">
            <p className="text-sm font-medium">Landing page & sous-domaine</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="structure-landing-path">Chemin landing</Label>
                <Input
                  id="structure-landing-path"
                  value={form.landingPagePath}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, landingPagePath: e.target.value }))
                  }
                  placeholder={form.slug || 'joystudio'}
                  pattern="[a-z0-9-]*"
                />
                <p className="text-xs text-muted-foreground">
                  Chemin : {publicUrls.pathUrl}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="structure-subdomain">Sous-domaine</Label>
                <Input
                  id="structure-subdomain"
                  value={form.subdomain}
                  onChange={(e) => setForm((prev) => ({ ...prev, subdomain: e.target.value }))}
                  placeholder="joystudio"
                  pattern="[a-z0-9-]*"
                />
                <p className="text-xs text-muted-foreground">
                  {publicUrls.subdomainUrl ? (
                    <>
                      Wildcard DNS :{' '}
                      <code className="text-[11px]">*.{process.env.NEXT_PUBLIC_SITE_DOMAIN || 'votredomaine.com'}</code>
                      <br />
                      Lien : {publicUrls.subdomainUrl}
                    </>
                  ) : (
                    'Définissez NEXT_PUBLIC_SITE_DOMAIN + enregistrez un wildcard DNS (*.)'
                  )}
                </p>
              </div>
            </div>
            {(form.subdomain || form.landingPagePath || form.slug) && (
              <div className="rounded-md border border-gold/25 bg-gold/5 px-3 py-2.5">
                <p className="text-xs font-medium text-gold-text">Lien à partager</p>
                <p className="mt-1 break-all font-mono text-sm text-foreground">
                  {publicUrls.primaryUrl}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-4">
            <p className="text-sm font-medium">Personnalisation landing</p>
            <div className="space-y-2">
              <Label htmlFor="structure-hero-title">Titre hero (ligne 1)</Label>
              <Input
                id="structure-hero-title"
                value={form.landingHeroTitle}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, landingHeroTitle: e.target.value }))
                }
                placeholder="Vous avez des talents,"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-hero-highlight">Accroche hero (ligne 2, colorée)</Label>
              <Input
                id="structure-hero-highlight"
                value={form.landingHeroHighlight}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, landingHeroHighlight: e.target.value }))
                }
                placeholder="nous les valorisons."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-hero-subtitle">Sous-titre hero</Label>
              <Textarea
                id="structure-hero-subtitle"
                value={form.landingHeroSubtitle}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, landingHeroSubtitle: e.target.value }))
                }
                rows={2}
                placeholder="Texte d'introduction sous le titre principal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-theme-color">Couleur du thème</Label>
              <div className="flex items-center gap-3">
                <input
                  id="structure-theme-color"
                  type="color"
                  value={form.landingThemeColor || '#f97316'}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, landingThemeColor: e.target.value }))
                  }
                  className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                />
                <Input
                  value={form.landingThemeColor}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, landingThemeColor: e.target.value }))
                  }
                  placeholder="#f97316"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Couleur principale du site partenaire (boutons, accents, dégradés).
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Services landing</p>
              <Button type="button" variant="outline" size="sm" onClick={resetServicesToDefaults}>
                Réinitialiser
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-services-intro">Introduction de la section</Label>
              <Textarea
                id="structure-services-intro"
                value={form.landingServicesIntro}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, landingServicesIntro: e.target.value }))
                }
                rows={2}
                placeholder={`${form.name || 'Cette structure'} propose des programmes concrets pour progresser…`}
              />
            </div>

            <div className="space-y-3">
              {form.landingServices.map((service, index) => (
                <div
                  key={`service-${index}`}
                  className="rounded-md border border-border bg-background p-3 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Service {index + 1}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveService(index, -1)}
                        disabled={index === 0}
                        aria-label="Monter"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveService(index, 1)}
                        disabled={index === form.landingServices.length - 1}
                        aria-label="Descendre"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => removeService(index)}
                        disabled={form.landingServices.length <= 1}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Titre *</Label>
                      <Input
                        value={service.title}
                        onChange={(e) => updateService(index, { title: e.target.value })}
                        placeholder="Art oratoire"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={service.description ?? ''}
                        onChange={(e) => updateService(index, { description: e.target.value })}
                        rows={2}
                        placeholder="Courte description du service"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Icône</Label>
                      <Select
                        value={service.iconKey || 'mic'}
                        onValueChange={(value) => updateService(index, { iconKey: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERTISE_ICON_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addService}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un service
            </Button>
            <p className="text-xs text-muted-foreground">
              Ces cartes apparaissent dans la section « Nos services » de la landing partenaire.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="structure-description">Description</Label>
            <Textarea
              id="structure-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="structure-public-url">URL publique (optionnel)</Label>
            <Input
              id="structure-public-url"
              type="url"
              value={form.publicUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, publicUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="structure-landing-order">Ordre sur la landing</Label>
            <Input
              id="structure-landing-order"
              type="number"
              min={0}
              value={form.landingOrder}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  landingOrder: Number.parseInt(e.target.value, 10) || 0,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="structure-show-landing"
              type="checkbox"
              checked={form.showOnLanding}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, showOnLanding: e.target.checked }))
              }
              className="h-4 w-4"
            />
            <Label htmlFor="structure-show-landing" className="cursor-pointer">
              Afficher dans la section Expertise du site
            </Label>
          </div>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? isEditMode
                  ? 'Enregistrement...'
                  : 'Création...'
                : isEditMode
                  ? 'Enregistrer'
                  : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
