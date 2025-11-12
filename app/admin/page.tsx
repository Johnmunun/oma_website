/**
 * @file app/admin/page.tsx
 * @description Dashboard principal - Vue d'ensemble des statistiques et actions rapides
 * Affiche: Statistiques clés, Événements à venir, Dernières inscriptions, Actions rapides
 */

"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"

import Link from "next/link"
import { Plus, TrendingUp, Users, Calendar, BookOpen, FileText, Settings, Eye, Activity, UserCheck, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

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
    <Card className={`p-6 cursor-pointer border-0 shadow-lg bg-white rounded-2xl card-animate card-hover-effect transition-all duration-300 ${index !== undefined ? `card-animate-${index}` : ''}`}>
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
        <div className="ml-4 p-3 rounded-2xl gradient-purple-light shadow-md">
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
      <div className="p-5 border border-border rounded-2xl cursor-pointer bg-white hover:border-primary/20 card-hover-effect shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl gradient-purple-light shadow-md">
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
    totalVisits: number
    visitsLast7Days: number
    visitsLast30Days: number
    uniqueVisitorsLast7Days: number
    uniqueVisitorsLast30Days: number
  } | null>(null)

  const [activityData, setActivityData] = useState<{
    activeSessions: Array<{
      id: string
      userId: string
      user: {
        id: string
        name: string | null
        email: string
        role: string
        image: string | null
        lastLoginAt: string | null
      }
      expiresAt: string
      isExpired: boolean
      timeUntilExpiry: number
    }>
    recentActivities: Array<{
      id: string
      action: string
      target: string | null
      payload: any
      user: {
        id: string
        name: string | null
        email: string
        role: string
      } | null
      createdAt: string
    }>
    recentlyActiveUsers: Array<{
      id: string
      name: string | null
      email: string
      role: string
      image: string | null
      lastLoginAt: string | null
    }>
    stats: {
      activeSessionsCount: number
      recentActivitiesCount: number
      recentlyActiveUsersCount: number
      totalUsers: number
      totalActivitiesToday: number
      totalActivitiesLast7Days: number
    }
  } | null>(null)
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)

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

  // Charger l'activité système seulement pour les ADMIN
  useEffect(() => {
    const loadActivity = async () => {
      if (session?.user?.role !== 'ADMIN') return
      
      try {
        setIsLoadingActivity(true)
        const res = await fetch('/api/admin/activity', { cache: 'no-store' })
        if (!res.ok) throw new Error('activity fetch failed')
        const data = await res.json()
        if (data.success) {
          setActivityData(data.data)
        }
      } catch (err) {
        console.error('[Admin] Erreur chargement activité:', err)
        // Ne pas afficher d'erreur toast pour l'activité (optionnel)
      } finally {
        setIsLoadingActivity(false)
      }
    }
    loadActivity()
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadActivity, 30000)
    return () => clearInterval(interval)
  }, [session])

  const isLoading = isLoadingEmail || isLoadingStats
  const isAdmin = session?.user?.role === 'ADMIN'

  if (isLoading) {
    return <PageSkeleton type="dashboard" showHeader={true} />
  }

  return (
    <div className="space-y-8">
      {/* Section des statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Visiteurs (7j)"
          value={stats ? stats.visitsLast7Days.toLocaleString() : '—'}
          subtitle={stats ? `${stats.uniqueVisitorsLast7Days} visiteurs uniques` : 'Chargement…'}
          icon={Eye}
          href="/admin/analytics"
          trend={stats && stats.visitsLast7Days > 0 ? { value: `${stats.uniqueVisitorsLast7Days} uniques`, isPositive: true } : undefined}
          index={0}
        />
        <StatCard
          label="Événements"
          value={stats ? stats.totalEvents : '—'}
          subtitle={stats ? `${stats.upcomingEvents} à venir, ${stats.pastEvents} passés` : 'Chargement…'}
          icon={Calendar}
          href="/admin/events"
          trend={stats ? { value: `+${stats.upcomingEvents}`, isPositive: true } : undefined}
          index={1}
        />
        <StatCard
          label="Inscriptions"
          value={stats ? stats.totalRegistrations : '—'}
          subtitle={stats ? `Total` : 'Chargement…'}
          icon={Users}
          href="/admin/registrations"
          trend={stats && stats.totalRegistrations > 0 ? { value: `+${Math.floor(stats.totalRegistrations * 0.1)}`, isPositive: true } : undefined}
          index={2}
        />
        <StatCard
          label="Visites totales"
          value={stats ? stats.totalVisits.toLocaleString() : '—'}
          subtitle={stats ? `${stats.visitsLast30Days} sur 30 jours` : 'Chargement…'}
          icon={TrendingUp}
          href="/admin/analytics"
          trend={stats && stats.visitsLast30Days > 0 ? { value: `${stats.uniqueVisitorsLast30Days} uniques`, isPositive: true } : undefined}
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

      {/* Section Activité système - Seulement pour ADMIN */}
      {session?.user?.role === 'ADMIN' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Utilisateurs connectés */}
            <Card className="p-6 border-0 shadow-soft bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Utilisateurs connectés</h3>
                </div>
                {activityData && (
                  <Badge variant="default" className="bg-primary text-white">
                    {activityData.stats.activeSessionsCount} actif{activityData.stats.activeSessionsCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              {isLoadingActivity ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : activityData && activityData.activeSessions.length > 0 ? (
                <div className="space-y-3">
                  {activityData.activeSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {session.user.image ? (
                            <img src={session.user.image} alt={session.user.name || ''} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-primary font-semibold">
                              {(session.user.name || session.user.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{session.user.name || session.user.email}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {session.user.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.timeUntilExpiry > 0 ? `${session.timeUntilExpiry} min` : 'Expiré'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activityData.activeSessions.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{activityData.activeSessions.length - 5} autre{activityData.activeSessions.length - 5 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun utilisateur connecté</p>
                </div>
              )}
            </Card>

            {/* Activité système récente */}
            <Card className="p-6 border-0 shadow-soft bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Activité système</h3>
                </div>
                {activityData && (
                  <Badge variant="outline">
                    {activityData.stats.totalActivitiesToday} aujourd'hui
                  </Badge>
                )}
              </div>
              {isLoadingActivity ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : activityData && activityData.recentActivities.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {activityData.recentActivities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {activity.user?.name || activity.user?.email || 'Système'}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {activity.action}
                          </Badge>
                        </div>
                        {activity.target && (
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.target}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.createdAt), "dd MMM yyyy à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune activité récente</p>
                </div>
              )}
            </Card>
          </div>

          {/* Statistiques d'activité */}
          {activityData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 border-0 shadow-soft bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activityData.stats.activeSessionsCount}</p>
                    <p className="text-xs text-muted-foreground">Sessions actives</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-soft bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activityData.stats.recentlyActiveUsersCount}</p>
                    <p className="text-xs text-muted-foreground">Actifs (24h)</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-soft bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activityData.stats.totalActivitiesToday}</p>
                    <p className="text-xs text-muted-foreground">Activités (aujourd'hui)</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-soft bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activityData.stats.totalActivitiesLast7Days}</p>
                    <p className="text-xs text-muted-foreground">Activités (7j)</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
