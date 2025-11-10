// ============================================
// PAGE ADMIN: GESTION DES INSCRIPTIONS
// ============================================
// Affiche toutes les inscriptions aux formations avec filtrage et actions

"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card } from "@/components/ui/card"
import { Users, Download, Filter } from "lucide-react"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"

interface Registration {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  formation: string
  date: string
  status: "pending" | "confirmed" | "cancelled"
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all")

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        setIsLoading(true)
        // @todo Remplacer par un appel API réel
        // const res = await fetch('/api/admin/registrations')
        // if (!res.ok) throw new Error('Failed to load registrations')
        // const data = await res.json()
        // setRegistrations(data)
        
        // Simulation d'un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 500))
        setRegistrations([
    {
      id: "1",
      first_name: "Jean",
      last_name: "Dupont",
      email: "jean@example.com",
      phone: "+33 6 12 34 56 78",
      formation: "MC Formation - 3ème Édition",
      date: "2025-01-15",
      status: "pending",
    },
  ])
      } catch (err) {
        console.error('[Admin] Erreur chargement inscriptions:', err)
        toast.error('Impossible de charger les inscriptions')
      } finally {
        setIsLoading(false)
      }
    }
    loadRegistrations()
  }, [])

  // Filtrer les inscriptions
  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === "all") return true
    return reg.status === filter
  })

  // Exporter en CSV
  const exportCSV = async () => {
    try {
    const headers = ["Prénom", "Nom", "Email", "Téléphone", "Formation", "Date", "Statut"]
    const rows = filteredRegistrations.map((reg) => [
      reg.first_name,
      reg.last_name,
      reg.email,
      reg.phone,
      reg.formation,
      reg.date,
      reg.status,
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inscriptions.csv"
    a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Export CSV réussi')
    } catch (err) {
      console.error('[Admin] Erreur export CSV:', err)
      toast.error('Erreur lors de l\'export CSV')
    }
  }

  if (isLoading) {
    return (
      <AdminLayout currentPage="registrations">
        <PageSkeleton type="table" showHeader={true} showFilters={true} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="registrations">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Inscriptions aux formations</h1>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <Download size={20} />
            Exporter CSV
          </button>
        </div>

        {/* Filtres */}
        <Card className="p-4 flex gap-4">
          <Filter size={20} className="text-gray-600" />
          {(["all", "pending", "confirmed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "all" && "Toutes"}
              {status === "pending" && "En attente"}
              {status === "confirmed" && "Confirmées"}
            </button>
          ))}
        </Card>

        {/* Tableau des inscriptions */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Nom</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Email</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Formation</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">
                    {reg.first_name} {reg.last_name}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{reg.email}</td>
                  <td className="py-4 px-4 text-gray-600">{reg.formation}</td>
                  <td className="py-4 px-4 text-gray-600">{new Date(reg.date).toLocaleDateString("fr-FR")}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                        reg.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {reg.status === "pending" ? "En attente" : "Confirmée"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <Card className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Aucune inscription pour le moment</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
