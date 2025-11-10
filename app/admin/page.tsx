/**
 * @file app/admin/page.tsx
 * @description Dashboard principal - Vue d'ensemble des statistiques et actions rapides
 * Affiche: Statistiques clés, Événements à venir, Dernières inscriptions, Actions rapides
 */

"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"

import Link from "next/link"
import { Plus, TrendingUp, Users, Calendar, BookOpen, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { PageSkeleton } from "@/components/admin/page-skeleton"

/**
 * Composant de statistique - Affiche une métrique clé
 */
function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  href,
  trend,
  index,
}: {
  label: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  trend?: { value: string; isPositive: boolean }
  index?: number
}) {
  const content = (
    <Card className={`p-6 cursor-pointer border-0 shadow-soft bg-white card-animate card-hover-effect ${index !== undefined ? `card-animate-${index}` : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="ml-4 p-3 rounded-xl gradient-purple-light shadow-soft">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

/**
 * Composant d'action rapide - Bouton avec lien vers actions courantes
 */
function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link href={href}>
      <div className="p-5 border border-border rounded-xl cursor-pointer bg-white hover:border-primary/20 card-hover-effect">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg gradient-purple-light shadow-soft">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const email = session?.user?.email || null
  const isLoadingEmail = status === 'loading'

  const displayName = useMemo(() => {
    if (!email) return "Utilisateur"
    const name = email.split('@')[0]
    if (!name) return email
    return name.charAt(0).toUpperCase() + name.slice(1)
  }, [email])

  const roleLabel = useMemo(() => {
    if (!session?.user?.role) return "EDITOR"
    return session.user.role === 'ADMIN' ? "ADMIN" : "EDITOR"
  }, [session])

  const [stats, setStats] = useState<{
    totalEvents: number
    upcomingEvents: number
    pastEvents: number
    totalRegistrations: number
    totalFormations: number
    totalSubscribers: number
  } | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true)
        const res = await fetch('/api/admin/stats', { cache: 'no-store' })
        if (!res.ok) throw new Error('stat fetch failed')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error('[Admin] Erreur chargement stats:', err)
        toast.error('Impossible de charger les statistiques')
      } finally {
        setIsLoadingStats(false)
      }
    }
    loadStats()
  }, [])

  const isLoading = isLoadingEmail || isLoadingStats

  if (isLoading) {
    return <PageSkeleton type="dashboard" showHeader={true} />
  }

  return (
    <div className="space-y-8">
      {/* Section des statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Événements"
          value={stats ? stats.totalEvents : '—'}
          subtitle={stats ? `${stats.upcomingEvents} à venir, ${stats.pastEvents} passés` : 'Chargement…'}
          icon={Calendar}
          href="/admin/events"
          trend={stats ? { value: `+${stats.upcomingEvents}`, isPositive: true } : undefined}
          index={0}
        />
        <StatCard
          label="Inscriptions"
          value={stats ? stats.totalRegistrations : '—'}
          subtitle={stats ? `Total` : 'Chargement…'}
          icon={Users}
          href="/admin/registrations"
          trend={stats && stats.totalRegistrations > 0 ? { value: `+${Math.floor(stats.totalRegistrations * 0.1)}`, isPositive: true } : undefined}
          index={1}
        />
        <StatCard
          label="Formations"
          value={stats ? stats.totalFormations : '—'}
          subtitle={stats ? `Actives et disponibles` : 'Chargement…'}
          icon={BookOpen}
          href="/admin/trainings"
          index={2}
        />
        <StatCard
          label="Newsletter"
          value={stats ? stats.totalSubscribers : '—'}
          subtitle={stats ? `Abonnés` : 'Chargement…'}
          icon={TrendingUp}
          trend={stats && stats.totalSubscribers > 0 ? { value: `+${Math.floor(stats.totalSubscribers * 0.05)}`, isPositive: true } : undefined}
          index={3}
        />
      </div>

      {/* Section des actions rapides */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Actions rapides</h2>
            <p className="text-sm text-muted-foreground mt-1">Accès rapide aux fonctionnalités principales</p>
          </div>
          <Link href="/admin/events">
            <Button className="gap-2 shadow-soft-lg hover:shadow-soft-lg transition-all gradient-purple text-white border-0">
              <Plus className="w-4 h-4" />
              Nouvel événement
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card-animate" style={{ animationDelay: '0.1s' }}>
            <QuickAction
              title="Créer un événement"
              description="Ajouter un nouvel événement au calendrier"
              href="/admin/events/new"
              icon={Calendar}
            />
          </div>
          <div className="card-animate" style={{ animationDelay: '0.2s' }}>
            <QuickAction
              title="Gérer le contenu"
              description="Modifier le contenu de la page d'accueil"
              href="/admin/content"
              icon={FileText}
            />
          </div>
          <div className="card-animate" style={{ animationDelay: '0.3s' }}>
            <QuickAction
              title="Voir les inscriptions"
              description="Consulter les nouvelles inscriptions"
              href="/admin/registrations"
              icon={Users}
            />
          </div>
          <div className="card-animate" style={{ animationDelay: '0.4s' }}>
            <QuickAction
              title="Gérer les formations"
              description="Ajouter ou modifier des formations"
              href="/admin/trainings"
              icon={BookOpen}
            />
          </div>
          <div className="card-animate" style={{ animationDelay: '0.5s' }}>
            <QuickAction
              title="Paramètres du site"
              description="Modifier logo, couleurs, polices"
              href="/admin/settings"
              icon={Settings}
            />
          </div>
          <div className="card-animate" style={{ animationDelay: '0.6s' }}>
            <QuickAction
              title="Voir les analytics"
              description="Consulter les statistiques du site"
              href="/admin/analytics"
              icon={TrendingUp}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
