"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminStatCard } from "@/components/admin/admin-stat-card"
import { toast } from "sonner"
import { Mail, MessageCircle, Search, Download, Users, UserCheck, UserX } from "lucide-react"

interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  whatsapp: string | null
  subscribed: boolean
  createdAt: string
}

interface NewsletterStats {
  total: number
  subscribed: number
  unsubscribed: number
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [stats, setStats] = useState<NewsletterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterSubscribed, setFilterSubscribed] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadSubscribers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(search && { search }),
        ...(filterSubscribed !== null && { subscribed: filterSubscribed }),
      })

      const res = await fetch(`/api/newsletter?${params}`)
      if (!res.ok) throw new Error("Erreur chargement abonnés")

      const data = await res.json()
      if (data.success) {
        setSubscribers(data.data)
        setStats(data.stats)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (err: any) {
      console.error("[Newsletter] Erreur:", err)
      toast.error("Impossible de charger les abonnés")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscribers()
  }, [page, search, filterSubscribed])

  // Export CSV
  const exportCSV = () => {
    const headers = ["Email", "Nom", "WhatsApp", "Abonné", "Date d'inscription"]
    const rows = subscribers.map((s) => [
      s.email,
      s.name || "",
      s.whatsapp || "",
      s.subscribed ? "Oui" : "Non",
      new Date(s.createdAt).toLocaleDateString("fr-FR"),
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Export CSV téléchargé")
  }

  if (loading && subscribers.length === 0) {
    return <PageSkeleton type="table" showHeader={true} />
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Newsletter - Abonnés"
        description="Gérez les abonnements à la newsletter"
        action={{
          label: "Exporter CSV",
          onClick: exportCSV,
          icon: <Download className="w-4 h-4" />,
        }}
      />

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminStatCard
            label="Total abonnés"
            value={stats.total}
            icon={Users}
          />
          <AdminStatCard
            label="Abonnés actifs"
            value={stats.subscribed}
            icon={UserCheck}
            trend={{ value: `${Math.round((stats.subscribed / stats.total) * 100)}%`, isPositive: true }}
          />
          <AdminStatCard
            label="Désabonnés"
            value={stats.unsubscribed}
            icon={UserX}
          />
        </div>
      )}

      {/* Filtres */}
      <Card className="border-0 shadow-soft bg-white">
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email, nom ou WhatsApp..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Button
              variant={filterSubscribed === null ? "default" : "outline"}
              onClick={() => {
                setFilterSubscribed(null)
                setPage(1)
              }}
            >
              Tous
            </Button>
            <Button
              variant={filterSubscribed === "true" ? "default" : "outline"}
              onClick={() => {
                setFilterSubscribed("true")
                setPage(1)
              }}
            >
              Abonnés
            </Button>
            <Button
              variant={filterSubscribed === "false" ? "default" : "outline"}
              onClick={() => {
                setFilterSubscribed("false")
                setPage(1)
              }}
            >
              Désabonnés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des abonnés */}
      <Card className="border-0 shadow-soft bg-white">
        <CardHeader>
          <CardTitle className="text-foreground">Liste des abonnés</CardTitle>
          <CardDescription>{subscribers.length} abonné(s) affiché(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun abonné trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Nom</th>
                      <th className="text-left p-3 font-medium">WhatsApp</th>
                      <th className="text-left p-3 font-medium">Statut</th>
                      <th className="text-left p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="p-3">{subscriber.name || <span className="text-muted-foreground">—</span>}</td>
                        <td className="p-3">
                          {subscriber.whatsapp ? (
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-green-500" />
                              <a
                                href={`https://wa.me/${subscriber.whatsapp.replace(/[^\d]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {subscriber.whatsapp}
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={subscriber.subscribed ? "default" : "secondary"}
                            className={subscriber.subscribed ? "gradient-purple text-white" : ""}
                          >
                            {subscriber.subscribed ? "Abonné" : "Désabonné"}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(subscriber.createdAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


