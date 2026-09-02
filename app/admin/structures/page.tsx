'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Plus, Building2, Edit2, Trash2, Trophy, ExternalLink } from 'lucide-react'
import { StructureLogo } from '@/components/structure-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PageSkeleton } from '@/components/admin/page-skeleton'
import {
  StructureDrawer,
  type StructureFormData,
  type StructureOption,
} from '@/components/admin/structure-drawer'
import { useAdminPermissions } from '@/hooks/use-admin-permissions'
import { OMA_STRUCTURE_ID } from '@/lib/authz/constants'
import { getStructurePublicUrls } from '@/lib/structures/public-url'
import { toast } from 'sonner'

interface StructureRow {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  logoUrl: string | null
  status: string
  parentId: string | null
  expertiseDomainId: string | null
  subdomain: string | null
  landingPagePath: string | null
  landingHeroTitle?: string | null
  landingHeroHighlight?: string | null
  landingHeroSubtitle?: string | null
  landingThemeColor?: string | null
  landingServicesIntro?: string | null
  landingServices?: Array<{ title: string; description: string; iconKey: string }>
  showOnLanding: boolean
  landingOrder: number
  publicUrl: string | null
  isActive: boolean
  parent?: { id: string; name: string; slug: string } | null
  expertiseDomain?: { id: string; name: string; slug: string } | null
  _count: { memberships: number; roles: number; children?: number }
}

const TYPE_LABELS: Record<string, string> = {
  OMA_INTERNAL: 'OMA Interne',
  PARTNER: 'Partenaire',
  COMPANY: 'Entreprise',
  ASSOCIATION: 'Association',
  MEDIA: 'Média',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'En attente',
}

function buildPayload(form: StructureFormData) {
  return {
    name: form.name,
    slug: form.slug,
    type: form.type,
    description: form.description || null,
    logoUrl: form.logoUrl || null,
    status: form.status,
    parentId: form.parentId || null,
    expertiseDomainId: form.expertiseDomainId || null,
    subdomain: form.subdomain || null,
    landingPagePath: form.landingPagePath || null,
    landingHeroTitle: form.landingHeroTitle || null,
    landingHeroHighlight: form.landingHeroHighlight || null,
    landingHeroSubtitle: form.landingHeroSubtitle || null,
    landingThemeColor: form.landingThemeColor || null,
    landingServicesIntro: form.landingServicesIntro || null,
    landingServices: form.landingServices.map((service) => ({
      title: service.title.trim(),
      description: service.description?.trim() || null,
      iconKey: service.iconKey || 'mic',
    })),
    showOnLanding: form.showOnLanding,
    landingOrder: form.landingOrder,
    publicUrl: form.publicUrl || null,
  }
}

export default function AdminStructuresPage() {
  const { can, loaded } = useAdminPermissions()
  const [structures, setStructures] = useState<StructureRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StructureRow | null>(null)
  const hasLoadedOnce = useRef(false)

  const load = useCallback(async () => {
    try {
      if (!hasLoadedOnce.current) setIsLoading(true)
      const res = await fetch('/api/admin/structures', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStructures(data.data ?? [])
      hasLoadedOnce.current = true
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    if (!can('structures.view')) {
      setIsLoading(false)
      return
    }
    void load()
    // Recharger uniquement quand les permissions sont prêtes (pas à chaque changement de `can`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, load])

  const structureOptions: StructureOption[] = useMemo(
    () =>
      structures.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        parentId: s.parentId,
      })),
    [structures]
  )

  const drawerInitialData = useMemo(() => {
    if (!editing) return null
    return {
      id: editing.id,
      name: editing.name,
      slug: editing.slug,
      type: editing.type,
      description: editing.description ?? '',
      logoUrl: editing.logoUrl ?? '',
      status: editing.status,
      parentId: editing.parentId ?? '',
      expertiseDomainId: editing.expertiseDomainId ?? '',
      subdomain: editing.subdomain ?? '',
      landingPagePath: editing.landingPagePath ?? '',
      landingHeroTitle: editing.landingHeroTitle ?? '',
      landingHeroHighlight: editing.landingHeroHighlight ?? '',
      landingHeroSubtitle: editing.landingHeroSubtitle ?? '',
      landingThemeColor: editing.landingThemeColor ?? '#f97316',
      landingServicesIntro: editing.landingServicesIntro ?? '',
      landingServices: editing.landingServices ?? [],
      showOnLanding: editing.showOnLanding,
      landingOrder: editing.landingOrder,
      publicUrl: editing.publicUrl ?? '',
    }
  }, [editing])

  const handleCreate = async (form: StructureFormData) => {
    const res = await fetch('/api/admin/structures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form)),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la création')
    toast.success('Structure créée')
    setModalOpen(false)
    load()
  }

  const handleUpdate = async (form: StructureFormData) => {
    if (!editing) return
    const res = await fetch(`/api/admin/structures/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form)),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour')
    toast.success('Structure mise à jour')
    setModalOpen(false)
    setEditing(null)
    load()
  }

  const handleDelete = async (structure: StructureRow) => {
    if (structure.id === OMA_STRUCTURE_ID) {
      toast.error('La structure OMA ne peut pas être supprimée')
      return
    }
    if (!confirm(`Supprimer la structure « ${structure.name} » ?`)) return

    try {
      const res = await fetch(`/api/admin/structures/${structure.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Structure supprimée')
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = async (structure: StructureRow) => {
    setEditing(structure)
    setModalOpen(true)
    try {
      const res = await fetch(`/api/admin/structures/${structure.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEditing({
        ...structure,
        landingHeroTitle: data.data.landingHeroTitle,
        landingHeroHighlight: data.data.landingHeroHighlight,
        landingHeroSubtitle: data.data.landingHeroSubtitle,
        landingThemeColor: data.data.landingThemeColor,
        landingServicesIntro: data.data.landingServicesIntro,
        landingServices: (data.data.landingServices ?? []).map(
          (service: { title: string; description: string; iconKey: string }) => ({
            title: service.title,
            description: service.description,
            iconKey: service.iconKey,
          })
        ),
      })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Impossible de charger les détails')
      setEditing(structure)
    }
  }

  if (loaded && !can('structures.view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Accès refusé — permission <code className="text-sm">structures.view</code> requise.
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        title="Structures"
        description="Organismes du réseau OMA (JoyStudio, OMA TV, partenaires…)"
        action={
          can('structures.create')
            ? {
                label: 'Créer une structure',
                icon: <Plus className="w-4 h-4" />,
                onClick: openCreate,
              }
            : undefined
        }
      />

      {isLoading ? (
        <PageSkeleton />
      ) : structures.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">Aucune structure pour le moment.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {structures.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start gap-3">
                {s.logoUrl ? (
                  <StructureLogo src={s.logoUrl} alt={s.name} size="md" className="shrink-0" />
                ) : (
                  <Building2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-sm font-mono text-muted-foreground">{s.slug}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" asChild title="Voir la landing">
                        <a
                          href={getStructurePublicUrls(s).primaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild title="Challenges">
                        <Link href={`/admin/challenges?structureId=${s.id}`}>
                          <Trophy className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      {can('structures.update') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(s)}
                          aria-label={`Modifier ${s.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {can('structures.delete') && s.id !== OMA_STRUCTURE_ID && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(s)}
                          aria-label={`Supprimer ${s.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {s.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {s.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">{TYPE_LABELS[s.type] ?? s.type}</Badge>
                    <Badge variant={s.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </Badge>
                    {!s.isActive && <Badge variant="secondary">Désactivée</Badge>}
                    {s.expertiseDomain && (
                      <Badge variant="outline">{s.expertiseDomain.name}</Badge>
                    )}
                    {s.showOnLanding && (
                      <Badge variant="outline" className="border-gold/40 text-gold">
                        Landing
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {s.parent && <p>Parent : {s.parent.name}</p>}
                    <p>
                      {s._count.roles} rôle(s) · {s._count.memberships} membre(s)
                      {typeof s._count.children === 'number'
                        ? ` · ${s._count.children} enfant(s)`
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <StructureDrawer
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        structures={structureOptions}
        initialData={drawerInitialData}
        onSubmit={async (form) => {
          try {
            if (editing) await handleUpdate(form)
            else await handleCreate(form)
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erreur')
            throw err
          }
        }}
      />
    </div>
  )
}
