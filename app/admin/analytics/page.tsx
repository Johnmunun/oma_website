"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, Download, Filter, Globe, Monitor, Smartphone, Tablet, TrendingUp, UserCheck, Activity } from "lucide-react"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface AnalyticsData {
  overview: {
    totalVisits: number
    uniqueVisitors: number
    totalPageViews: number
    avgDuration: number
  }
  visitsByDay: Array<{ date: string; count: number }>
  visitsByPath: Array<{ path: string; count: number }>
  visitsByCountry: Array<{ country: string; count: number }>
  visitsByDevice: Array<{ device: string; count: number }>
  visitsByBrowser: Array<{ browser: string; count: number }>
  visitsByOS: Array<{ os: string; count: number }>
  topReferrers: Array<{ referer: string; count: number }>
  period: {
    from: string
    to: string
  }
}

const COLORS = {
  desktop: "#d4af37",
  mobile: "#1a1a1a",
  tablet: "#e8e8e8",
}

function AnalyticsStatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
          {change && <p className="text-xs text-green-600 mt-2">↑ {change}</p>}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("7d")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [activityData, setActivityData] = useState<any>(null)
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // S'assurer que le composant est monté côté client avant de rendre les graphiques
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/admin/analytics?period=${period}`, {
          cache: "no-store",
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to load analytics")
        }
        const result = await res.json()
        if (result.success && result.data) {
          // Valider et normaliser les données
          const normalizedData: AnalyticsData = {
            overview: result.data.overview || {
              totalVisits: 0,
              uniqueVisitors: 0,
              totalPageViews: 0,
              avgDuration: 0,
            },
            visitsByDay: Array.isArray(result.data.visitsByDay) ? result.data.visitsByDay : [],
            visitsByPath: Array.isArray(result.data.visitsByPath) ? result.data.visitsByPath : [],
            visitsByCountry: Array.isArray(result.data.visitsByCountry) ? result.data.visitsByCountry : [],
            visitsByDevice: Array.isArray(result.data.visitsByDevice) ? result.data.visitsByDevice : [],
            visitsByBrowser: Array.isArray(result.data.visitsByBrowser) ? result.data.visitsByBrowser : [],
            visitsByOS: Array.isArray(result.data.visitsByOS) ? result.data.visitsByOS : [],
            topReferrers: Array.isArray(result.data.topReferrers) ? result.data.topReferrers : [],
            period: result.data.period || {
              from: new Date().toISOString(),
              to: new Date().toISOString(),
            },
          }
          setData(normalizedData)
        } else {
          throw new Error(result.error || "Erreur lors du chargement")
        }
      } catch (err: any) {
        console.error("[Admin] Erreur chargement analytics:", err)
        toast.error(err.message || "Impossible de charger les analytics")
        // Définir des données par défaut pour éviter les erreurs de rendu
        setData({
          overview: {
            totalVisits: 0,
            uniqueVisitors: 0,
            totalPageViews: 0,
            avgDuration: 0,
          },
          visitsByDay: [],
          visitsByPath: [],
          visitsByCountry: [],
          visitsByDevice: [],
          visitsByBrowser: [],
          visitsByOS: [],
          topReferrers: [],
          period: {
            from: new Date().toISOString(),
            to: new Date().toISOString(),
          },
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalytics()
  }, [period])

  // Charger l'activité système
  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoadingActivity(true)
        const res = await fetch('/api/admin/activity', { cache: 'no-store' })
        if (!res.ok) throw new Error('activity fetch failed')
        const result = await res.json()
        if (result.success) {
          setActivityData(result.data)
        }
      } catch (err) {
        console.error('[Admin] Erreur chargement activité:', err)
      } finally {
        setIsLoadingActivity(false)
      }
    }
    loadActivity()
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadActivity, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <PageSkeleton type="analytics" showHeader={true} showFilters={true} />
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <Eye className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Aucune donnée disponible</h2>
          <p className="text-muted-foreground">
            Les statistiques apparaîtront ici une fois que des visiteurs auront consulté le site.
          </p>
        </Card>
      </div>
    )
  }

  // Formater les données pour les graphiques (avec vérifications)
  const visitsByDayFormatted = (data?.visitsByDay || []).map((item) => ({
    date: new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    visites: item.count || 0,
  }))

  const deviceData = (data?.visitsByDevice || []).map((item) => ({
    name: item.device === "desktop" ? "Desktop" : item.device === "mobile" ? "Mobile" : "Tablette",
    value: item.count || 0,
    color: COLORS[item.device as keyof typeof COLORS] || "#888",
  })).filter(d => d.value > 0)

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Statistiques et insights du site OMA • {new Date(data.period.from).toLocaleDateString("fr-FR")} - {new Date(data.period.to).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="all">Toutes les périodes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatCard
          label="Visites totales"
          value={data.overview.totalVisits}
          change={`${data.overview.uniqueVisitors} visiteurs uniques`}
          icon={Eye}
        />
        <AnalyticsStatCard
          label="Visiteurs uniques"
          value={data.overview.uniqueVisitors}
          icon={TrendingUp}
        />
        <AnalyticsStatCard
          label="Pages vues"
          value={data.overview.totalPageViews}
          icon={Globe}
        />
        <AnalyticsStatCard
          label="Durée moyenne"
          value={formatDuration(data.overview.avgDuration)}
          icon={Monitor}
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique visites par jour */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Visites par jour</h3>
          {!isMounted ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse">Chargement du graphique...</div>
            </div>
          ) : visitsByDayFormatted.length > 0 ? (
            <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitsByDayFormatted} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visites"
                    stroke="#d4af37"
                    strokeWidth={2}
                    name="Visites"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Aucune donnée pour cette période
            </div>
          )}
        </Card>

        {/* Graphique appareils */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Appareils</h3>
          {!isMounted ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse">Chargement du graphique...</div>
            </div>
          ) : deviceData.length > 0 && deviceData.some(d => d.value > 0) ? (
            <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const name = String(props.name || '')
                      const percent = Number(props.percent || 0)
                      return `${name} ${(percent * 100).toFixed(0)}%`
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [value, 'Visites']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Aucune donnée
            </div>
          )}
        </Card>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages les plus visitées */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pages les plus visitées</h3>
            {data.visitsByPath.length > 20 && (
              <Badge variant="outline" className="text-xs">
                {data.visitsByPath.length} pages au total
              </Badge>
            )}
          </div>
          {!isMounted ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse">Chargement du graphique...</div>
            </div>
          ) : data.visitsByPath.length > 0 ? (
            <div style={{ width: '100%', height: `${Math.min(Math.max(300, data.visitsByPath.length * 30), 600)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.visitsByPath} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="path" 
                    type="category" 
                    width={150} 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d4af37" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Aucune donnée
            </div>
          )}
        </Card>

        {/* Navigateurs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Navigateurs</h3>
            {data.visitsByBrowser.length > 15 && (
              <Badge variant="outline" className="text-xs">
                {data.visitsByBrowser.length} navigateurs
              </Badge>
            )}
          </div>
          {!isMounted ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse">Chargement du graphique...</div>
            </div>
          ) : data.visitsByBrowser.length > 0 ? (
            <div style={{ width: '100%', height: `${Math.min(Math.max(300, data.visitsByBrowser.length * 40), 600)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.visitsByBrowser} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="browser" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1a1a1a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Aucune donnée
            </div>
          )}
        </Card>
      </div>

      {/* Tableaux de données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top référents */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top référents</h3>
            {data.topReferrers.length > 20 && (
              <Badge variant="outline" className="text-xs">
                {data.topReferrers.length} référents
              </Badge>
            )}
          </div>
          {data.topReferrers.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {data.topReferrers.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.referer === "null" || !item.referer
                        ? "Accès direct"
                        : new URL(item.referer).hostname}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-primary ml-4">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucune donnée</p>
          )}
        </Card>

        {/* Systèmes d'exploitation */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Systèmes d'exploitation</h3>
            {data.visitsByOS.length > 20 && (
              <Badge variant="outline" className="text-xs">
                {data.visitsByOS.length} systèmes
              </Badge>
            )}
          </div>
          {data.visitsByOS.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {data.visitsByOS.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.os}</p>
                  </div>
                  <div className="text-sm font-semibold text-primary ml-4">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucune donnée</p>
          )}
        </Card>
      </div>

      {/* Section Activité système */}
      {activityData && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Activité système</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Utilisateurs connectés */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Utilisateurs connectés</h3>
                  </div>
                  <Badge variant="default" className="bg-primary text-white">
                    {activityData.stats.activeSessionsCount} actif{activityData.stats.activeSessionsCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {isLoadingActivity ? (
                  <div className="text-center py-8 text-muted-foreground">Chargement...</div>
                ) : activityData.activeSessions.length > 0 ? (
                  <div className="space-y-3">
                    {activityData.activeSessions.slice(0, 5).map((session: any) => (
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun utilisateur connecté</p>
                  </div>
                )}
              </Card>

              {/* Activité système récente */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Activité système</h3>
                  </div>
                  <Badge variant="outline">
                    {activityData.stats.totalActivitiesToday} aujourd'hui
                  </Badge>
                </div>
                {isLoadingActivity ? (
                  <div className="text-center py-8 text-muted-foreground">Chargement...</div>
                ) : activityData.recentActivities.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {activityData.recentActivities.slice(0, 10).map((activity: any) => (
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
                            {new Date(activity.createdAt).toLocaleString('fr-FR')}
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
          </div>
        </div>
      )}
    </div>
  )
}
