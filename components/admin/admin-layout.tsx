// ============================================
// COMPOSANT: LAYOUT ADMIN
// ============================================
// Layout principal pour toutes les pages admin
// Inclut la navigation, la sidebar et la gestion de l'authentification

"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogOut, Settings, Calendar, Users, MessageSquare } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: string
}

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    {
      label: "Paramètres du site",
      href: "/admin/settings",
      icon: Settings,
      key: "settings",
    },
    {
      label: "Événements",
      href: "/admin/events",
      icon: Calendar,
      key: "events",
    },
    {
      label: "Inscriptions",
      href: "/admin/registrations",
      icon: Users,
      key: "registrations",
    },
    {
      label: "Messages de contact",
      href: "/admin/messages",
      icon: MessageSquare,
      key: "messages",
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && <h1 className="text-xl font-bold">OMA Admin</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-800 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.key
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {menuItems.find((item) => item.key === currentPage)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin User</span>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  )
}
