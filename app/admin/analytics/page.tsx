"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
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
import {
  Eye,
  Download,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  UserCheck,
  Activity,
  MapPin,
  Clock,
  MousePointerClick,
  Languages,
} from "lucide-react"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { AdminStatCard } from "@/components/admin/admin-stat-card"
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
    bounceRate?: number
    pagesPerSession?: number
    uniqueCountries?: number
    uniqueCities?: number
  }
  visitsByDay: Array<{ date: string; count: number }>
  visitsByPath: Array<{ path: string; count: number }>
  visitsByCountry: Array<{ country: string; count: number }>
  visitsByCity: Array<{ city: string; count: number }>
  visitsByDevice: Array<{ device: string; count: number }>
  visitsByBrowser: Array<{ browser: string; count: number }>
  visitsByOS: Array<{ os: string; count: number }>
  visitsByLanguage: Array<{ language: string; count: number }>
  topReferrers: Array<{ referer: string; count: number }>
  period: {
    from: string
    to: string
  }
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#1a1a1a",
  mobile: "#c9a227",
  tablet: "#64748b",
}

const EMPTY_DATA: AnalyticsData = {
  overview: {
    totalVisits: 0,
    uniqueVisitors: 0,
    totalPageViews: 0,
    avgDuration: 0,
    bounceRate: 0,
    pagesPerSession: 0,
    uniqueCountries: 0,
    uniqueCities: 0,
  },
  visitsByDay: [],
  visitsByPath: [],
  visitsByCountry: [],
  visitsByCity: [],
  visitsByDevice: [],
  visitsByBrowser: [],
  visitsByOS: [],
  visitsByLanguage: [],
  topReferrers: [],
  period: {
    from: new Date().toISOString(),
    to: new Date().toISOString(),
  },
}

function countryFlag(code: string | null | undefined) {
  if (!code || code.length !== 2) return "🌍"
  const cc = code.toUpperCase()
  if (!/^[A-Z]{2}$/.test(cc)) return "🌍"
  return String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)))
}

function countryLabel(code: string | null | undefined) {
  if (!code) return "Inconnu"
  try {
    if (code.length === 2) {
      return new Intl.DisplayNames(["fr"], { type: "region" }).of(code.toUpperCase()) || code
    }
  } catch {
    /* ignore */
  }
  return code
}

function languageLabel(code: string | null | undefined) {
  if (!code) return "Inconnu"
  try {
    const base = code.split("-")[0]
    return new Intl.DisplayNames(["fr"], { type: "language" }).of(base) || code
  } catch {
    return code
  }
}

function refererHost(referer: string | null | undefined) {
  if (!referer || referer === "null") return "Accès direct"
  try {
    return new URL(referer).hostname.replace(/^www\./, "")
  } catch {
    return referer
  }
}

function formatDuration(seconds: number) {
  if (!seconds || seconds < 0) return "0s"
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes < 60) return `${minutes}m ${secs}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function RankingList({
  items,
  empty,
}: {
  items: Array<{ label: string; count: number; prefix?: React.ReactNode }>
  empty: string
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-center py-8 text-sm">{empty}</p>
  }
  const max = Math.max(...items.map((i) => i.count), 1)
  const total = items.reduce((sum, i) => sum + i.count, 0) || 1

  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
      {items.map((item, index) => {
        const pct = Math.round((item.count / total) * 100)
        const width = Math.max(6, Math.round((item.count / max) * 100))
        return (
          <div key={`${item.label}-${index}`}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {item.prefix}
                <p className="text-sm font-medium truncate">{item.label}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <span className="text-muted-foreground">{pct}%</span>
                <span className="font-semibold text-primary tabular-nums">{item.count}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("7d")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [activityData, setActivityData] = useState<any>(null)
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

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
          setData({
            overview: {
              ...EMPTY_DATA.overview,
              ...(result.data.overview || {}),
            },
            visitsByDay: Array.isArray(result.data.visitsByDay) ? result.data.visitsByDay : [],
            visitsByPath: Array.isArray(result.data.visitsByPath) ? result.data.visitsByPath : [],
            visitsByCountry: Array.isArray(result.data.visitsByCountry) ? result.data.visitsByCountry : [],
            visitsByCity: Array.isArray(result.data.visitsByCity) ? result.data.visitsByCity : [],
            visitsByDevice: Array.isArray(result.data.visitsByDevice) ? result.data.visitsByDevice : [],
            visitsByBrowser: Array.isArray(result.data.visitsByBrowser) ? result.data.visitsByBrowser : [],
            visitsByOS: Array.isArray(result.data.visitsByOS) ? result.data.visitsByOS : [],
            visitsByLanguage: Array.isArray(result.data.visitsByLanguage) ? result.data.visitsByLanguage : [],
            topReferrers: Array.isArray(result.data.topReferrers) ? result.data.topReferrers : [],
            period: result.data.period || EMPTY_DATA.period,
          })
        } else {
          throw new Error(result.error || "Erreur lors du chargement")
        }
      } catch (err: any) {
        console.error("[Admin] Erreur chargement analytics:", err)
        toast.error(err.message || "Impossible de charger les analytics")
        setData(EMPTY_DATA)
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalytics()
  }, [period])

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoadingActivity(true)
        const res = await fetch("/api/admin/activity", { cache: "no-store" })
        if (!res.ok) throw new Error("activity fetch failed")
        const result = await res.json()
        if (result.success) {
          setActivityData(result.data)
        }
      } catch (err) {
        console.error("[Admin] Erreur chargement activité:", err)
      } finally {
        setIsLoadingActivity(false)
      }
    }
    loadActivity()
    const interval = setInterval(loadActivity, 30000)
    return () => clearInterval(interval)
  }, [])

  const visitsByDayFormatted = useMemo(
    () =>
      (data?.visitsByDay || []).map((item) => ({
        date: new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        visites: item.count || 0,
      })),
    [data]
  )

  const deviceData = useMemo(() => {
    const labels: Record<string, string> = {
      desktop: "Ordinateur",
      mobile: "Mobile",
      tablet: "Tablette",
    }
    return (data?.visitsByDevice || [])
      .map((item) => ({
        key: item.device,
        name: labels[item.device] || item.device,
        value: item.count || 0,
        color: DEVICE_COLORS[item.device] || "#888",
      }))
      .filter((d) => d.value > 0)
  }, [data])

  const deviceTotal = deviceData.reduce((sum, d) => sum + d.value, 0) || 1

  const exportCsv = () => {
    if (!data) return
    const rows: string[][] = [
      ["Section", "Libellé", "Visites"],
      ...data.visitsByCountry.map((i) => ["Pays", countryLabel(i.country), String(i.count)]),
      ...data.visitsByCity.map((i) => ["Ville", i.city, String(i.count)]),
      ...data.visitsByDevice.map((i) => ["Appareil", i.device, String(i.count)]),
      ...data.visitsByBrowser.map((i) => ["Navigateur", i.browser, String(i.count)]),
      ...data.visitsByOS.map((i) => ["OS", i.os, String(i.count)]),
      ...data.visitsByPath.map((i) => ["Page", i.path, String(i.count)]),
      ...data.topReferrers.map((i) => ["Référent", refererHost(i.referer), String(i.count)]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `oma-analytics-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Export CSV téléchargé")
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-1 w-10 rounded-full bg-gold mb-3" aria-hidden />
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            Audience, géographie et appareils •{" "}
            {new Date(data.period.from).toLocaleDateString("fr-FR")} –{" "}
            {new Date(data.period.to).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 dernières heures</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="all">Toutes les périodes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={exportCsv}>
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Visites"
          value={data.overview.totalVisits}
          subtitle={`${data.overview.totalPageViews} pages vues`}
          icon={Eye}
        />
        <AdminStatCard
          label="Visiteurs uniques"
          value={data.overview.uniqueVisitors}
          subtitle={`${data.overview.pagesPerSession || 0} pages / session`}
          icon={TrendingUp}
        />
        <AdminStatCard
          label="Pays / villes"
          value={data.overview.uniqueCountries || 0}
          subtitle={`${data.overview.uniqueCities || 0} villes détectées`}
          icon={Globe}
        />
        <AdminStatCard
          label="Durée moyenne"
          value={formatDuration(data.overview.avgDuration)}
          subtitle={`${data.overview.bounceRate || 0}% de rebond`}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-border/60 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Visites par jour</h3>
          {!isMounted ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse">Chargement du graphique...</div>
            </div>
          ) : visitsByDayFormatted.length > 0 ? (
            <div style={{ width: "100%", height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitsByDayFormatted} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-35} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visites"
                    stroke="#c9a227"
                    strokeWidth={2}
                    name="Visites"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Aucune donnée pour cette période
            </div>
          )}
        </Card>

        <Card className="p-6 border-border/60 rounded-2xl">
          <h3 className="text-lg font-semibold mb-1">Appareils</h3>
          <p className="text-xs text-muted-foreground mb-4">Répartition ordinateur / mobile / tablette</p>
          {!isMounted ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse">Chargement...</div>
            </div>
          ) : deviceData.length > 0 ? (
            <>
              <div style={{ width: "100%", height: "180px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, "Visites"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {deviceData.map((d) => {
                  const Icon = d.key === "mobile" ? Smartphone : d.key === "tablet" ? Tablet : Monitor
                  return (
                    <div key={d.key} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        {d.name}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {d.value}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({Math.round((d.value / deviceTotal) * 100)}%)
                        </span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              Aucune donnée appareil
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Pays</h3>
            </div>
            {data.overview.uniqueCountries ? (
              <Badge variant="outline">{data.overview.uniqueCountries} pays</Badge>
            ) : null}
          </div>
          <RankingList
            items={data.visitsByCountry.map((i) => ({
              label: countryLabel(i.country),
              count: i.count,
              prefix: <span className="text-base leading-none">{countryFlag(i.country)}</span>,
            }))}
            empty="Pas encore de géolocalisation. Les nouvelles visites (après déploiement) renseigneront le pays."
          />
        </Card>

        <Card className="p-6 border-border/60 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Villes</h3>
            </div>
            {data.overview.uniqueCities ? (
              <Badge variant="outline">{data.overview.uniqueCities} villes</Badge>
            ) : null}
          </div>
          <RankingList
            items={data.visitsByCity.map((i) => ({
              label: i.city,
              count: i.count,
              prefix: <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />,
            }))}
            empty="Les villes apparaîtront dès que les visites seront géolocalisées."
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Pages les plus visitées</h3>
            </div>
          </div>
          {!isMounted ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse">Chargement...</div>
            </div>
          ) : data.visitsByPath.length > 0 ? (
            <div style={{ width: "100%", height: `${Math.min(Math.max(260, data.visitsByPath.length * 36), 420)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.visitsByPath.map((p) => ({
                    ...p,
                    path: p.path.length > 28 ? `${p.path.slice(0, 26)}…` : p.path,
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="path" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#c9a227" radius={[0, 8, 8, 0]} name="Visites" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8 text-sm">Aucune donnée</p>
          )}
        </Card>

        <Card className="p-6 border-border/60 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Navigateurs</h3>
          {!isMounted ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse">Chargement...</div>
            </div>
          ) : data.visitsByBrowser.length > 0 ? (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.visitsByBrowser} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="browser" angle={-25} textAnchor="end" height={50} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1a1a1a" radius={[8, 8, 0, 0]} name="Visites" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8 text-sm">Aucune donnée</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Top référents</h3>
          <RankingList
            items={data.topReferrers.map((i) => ({
              label: refererHost(i.referer),
              count: i.count,
            }))}
            empty="Aucun référent pour cette période"
          />
        </Card>

        <Card className="p-6 border-border/60 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Systèmes d&apos;exploitation</h3>
          <RankingList
            items={data.visitsByOS.map((i) => ({
              label: i.os,
              count: i.count,
            }))}
            empty="Aucune donnée OS"
          />
        </Card>

        <Card className="p-6 border-border/60 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Langues</h3>
          </div>
          <RankingList
            items={data.visitsByLanguage.map((i) => ({
              label: languageLabel(i.language),
              count: i.count,
            }))}
            empty="Aucune langue détectée"
          />
        </Card>
      </div>

      {activityData && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Activité système</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 border-border/60 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Utilisateurs connectés</h3>
                  </div>
                  <Badge variant="default" className="bg-primary text-white">
                    {activityData.stats.activeSessionsCount} actif
                    {activityData.stats.activeSessionsCount !== 1 ? "s" : ""}
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
                              <img src={session.user.image} alt={session.user.name || ""} className="w-10 h-10 rounded-full" />
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
                            {session.timeUntilExpiry > 0 ? `${session.timeUntilExpiry} min` : "Expiré"}
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

              <Card className="p-6 border-border/60 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Activité système</h3>
                  </div>
                  <Badge variant="outline">{activityData.stats.totalActivitiesToday} aujourd&apos;hui</Badge>
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
                              {activity.user?.name || activity.user?.email || "Système"}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {activity.action}
                            </Badge>
                          </div>
                          {activity.target && (
                            <p className="text-xs text-muted-foreground truncate">{activity.target}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.createdAt).toLocaleString("fr-FR")}
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
