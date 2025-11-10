"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BookOpen, Eye, Download, Filter } from "lucide-react"
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

// Données mock pour les graphiques
// @todo Remplacer par des données réelles du backend API
const visitorsData = [
  { month: "Jan", visits: 400, users: 240 },
  { month: "Fév", visits: 500, users: 321 },
  { month: "Mar", visits: 600, users: 450 },
  { month: "Avr", visits: 800, users: 620 },
  { month: "Mai", visits: 950, users: 780 },
  { month: "Jun", visits: 1200, users: 950 },
]

const eventData = [
  { name: "En ligne", value: 35, color: "#d4af37" },
  { name: "Présentiel", value: 45, color: "#1a1a1a" },
  { name: "Hybride", value: 20, color: "#e8e8e8" },
]

const registrationData = [
  { formation: "Communication", registrations: 45 },
  { formation: "Leadership", registrations: 38 },
  { formation: "Marketing", registrations: 32 },
  { formation: "Digital", registrations: 25 },
  { formation: "Oratoire", registrations: 20 },
]

/**
 * Composant StatCard - Affiche une métrique clé avec icône
 * Utilisé pour afficher les statistiques principales du tableau de bord
 * @param label - Libellé de la métrique
 * @param value - Valeur à afficher
 * @param change - Changement en pourcentage (optionnel)
 * @param icon - Icône React
 */
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
          <p className="text-3xl font-bold mt-2">{value}</p>
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
  const [dateRange, setDateRange] = useState("6months")

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true)
        // @todo Récupérer les données réelles du backend
        // const res = await fetch(`/api/admin/analytics?range=${dateRange}`)
        // if (!res.ok) throw new Error('Failed to load analytics')
        // const data = await res.json()
        
        // Simulation d'un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (err) {
        console.error('[Admin] Erreur chargement analytics:', err)
        toast.error('Impossible de charger les analytics')
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalytics()
  }, [dateRange])

  if (isLoading) {
    return <PageSkeleton type="analytics" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Statistiques et insights du site OMA</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Exporter rapport
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="3months">3 derniers mois</option>
            <option value="6months">6 derniers mois</option>
            <option value="1year">Cette année</option>
          </select>
        </div>
      </Card>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatCard label="Visiteurs totaux" value="5,240" change="+23% vs mois dernier" icon={Eye} />
        <AnalyticsStatCard label="Inscriptions" value="127" change="+15% vs mois dernier" icon={Users} />
        <AnalyticsStatCard label="Événements" value="8" change="+2 à venir" icon={Calendar} />
        <AnalyticsStatCard label="Formations" value="6" change="Toutes actives" icon={BookOpen} />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique visiteurs */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Tendance des visiteurs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitorsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visits" stroke="#d4af37" name="Visites" />
              <Line type="monotone" dataKey="users" stroke="#1a1a1a" name="Utilisateurs" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Graphique type d'événements */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Types d'événements</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={eventData} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                {eventData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Graphique inscriptions par formation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Inscriptions par formation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={registrationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formation" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="registrations" fill="#d4af37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Section insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Insights clés</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Les formations "Communication" sont les plus populaires (+45%)</li>
            <li>✓ Pic de trafic les mardi et mercredi</li>
            <li>✓ Taux de conversion des inscriptions: 8.2%</li>
            <li>✓ 73% des visiteurs viennent via mobile</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Top performances</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>📊 Page: Formation Communication - 1,245 vues</li>
            <li>📊 Article: Leadership moderne - 823 vues</li>
            <li>📊 Événement: MC Formation - 456 inscriptions</li>
            <li>📊 Partenaire: Plus actif ce mois</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
