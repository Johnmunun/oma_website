/**
 * @file app/admin/layout.tsx
 * @description Layout du panel administrateur avec sidebar intégré et navigation contextuelle
 * Structure : Sidebar simple + Header + Contenu principal
 * @author OMA Team
 */

"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
      LayoutDashboard,
      FileText,
      Calendar,
      Users,
      MessageSquare,
      Users2,
      Handshake,
      BarChart3,
      Settings,
      Menu,
      X,
      LogOut,
      ImageIcon,
      Mail,
      Search,
    } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useDynamicLogo } from "@/components/theming/dynamic-logo"

/**
 * Interface pour les éléments de navigation
 * @property name - Nom de l'élément
 * @property href - URL de destination
 * @property icon - Icône React
 * @property badge - Badge optionnel (nombre)
 */
interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: number
}

/**
 * Configuration de la navigation du panel admin
 * Structure plate pour éviter la redondance des menus
 * @todo Ajouter les contrôles d'accès basés sur les rôles
 */
const baseNavigationItems: NavItem[] = [
  {
    name: "Tableau de bord",
    href: "/admin",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Contenu du site",
    href: "/admin/content",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    name: "Événements",
    href: "/admin/events",
    icon: <Calendar className="w-5 h-5" />,
    badge: 2,
  },
  {
    name: "Équipe & Membres",
    href: "/admin/team",
    icon: <Users2 className="w-5 h-5" />,
  },
  {
    name: "Utilisateurs",
    href: "/admin/users",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Messages",
    href: "/admin/messages",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    name: "Newsletter",
    href: "/admin/newsletter",
    icon: <Mail className="w-5 h-5" />,
  },
  {
    name: "Médias",
    href: "/admin/media",
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    name: "Partenaires",
    href: "/admin/partners",
    icon: <Handshake className="w-5 h-5" />,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    name: "Paramètres",
    href: "/admin/settings",
    icon: <Settings className="w-5 h-5" />,
  },
]

/**
 * Composant Sidebar - Navigation principale du panel admin
 * Sidebar fixe avec navigation verticale
 */
function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const email = session?.user?.email || null
  const isAdmin = useMemo(() => session?.user?.role === 'ADMIN', [session])
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const logoUrl = useDynamicLogo()
  const [siteTitle, setSiteTitle] = useState("OMA")

  // Charger le compteur de messages non lus
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const res = await fetch('/api/admin/messages/count')
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setUnreadMessagesCount(data.data.unreadCount)
          }
        }
      } catch (err) {
        console.error('[Admin] Erreur chargement compteur messages:', err)
      }
    }

    loadUnreadCount()
    
    // Recharger toutes les 30 secondes pour le compteur en temps réel
    const interval = setInterval(loadUnreadCount, 30000)
    
    // Écouter les événements de mise à jour des messages
    const handleMessageUpdate = () => {
      loadUnreadCount()
    }
    
    window.addEventListener('message-updated', handleMessageUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('message-updated', handleMessageUpdate)
    }
  }, [])

  // Charger le titre du site depuis les settings
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.data?.siteTitle) {
          setSiteTitle(data.data.siteTitle)
        }
      } catch (err) {
        console.error('[AdminSidebar] Erreur chargement settings:', err)
      }
    }
    
    loadSiteSettings()
    
    const handleSettingsUpdate = () => {
      loadSiteSettings()
    }
    
    window.addEventListener('settings-updated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  const navigationItems = useMemo(() => {
    const items = baseNavigationItems.map((item) => {
      // Ajouter le compteur de messages non lus pour l'item Messages
      if (item.href === '/admin/messages') {
        return {
          ...item,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        }
      }
      return item
    })

    return items.filter((item) => {
      if (item.href === "/admin/users" && !isAdmin) return false
      return true
    })
  }, [isAdmin, unreadMessagesCount])

  return (
    <>
      {/* Overlay pour mobile - ferme le menu quand on clique dessus */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar principale - Violet foncé avec gradient */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] overflow-y-auto transition-transform duration-300 z-50 md:z-auto md:relative md:transform-none w-64 shadow-soft-lg sidebar-scrollbar",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        style={{
          background: "linear-gradient(180deg, oklch(0.25 0.1 280) 0%, oklch(0.15 0.02 280) 100%)",
        }}
      >
        {/* Logo & Fermeture mobile */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[var(--sidebar-border)]">
          {/* Logo compact avec logo dynamique */}
          <Link href="/admin" className="flex items-center gap-3 font-bold text-xl text-white">
            {logoUrl ? (
              <div className="relative inline-flex items-center justify-center">
                {/* Cercle blanc derrière le logo pour garantir la visibilité sur fond violet - agrandi */}
                <div className="absolute w-16 h-16 bg-white rounded-full shadow-xl z-0 border-2 border-white/30" />
                {/* Logo par-dessus - agrandi pour meilleure visibilité */}
                <img 
                  src={logoUrl} 
                  alt={siteTitle} 
                  className="h-14 w-auto object-contain relative z-10" 
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center text-white text-sm font-bold shadow-soft">
                OMA
              </div>
            )}
            <div className="hidden sm:flex flex-col">
              <span className="text-white font-bold">RÉSEAU OMA</span>
              <span className="text-xs text-white/70 font-normal">Oratoire mon art</span>
            </div>
          </Link>
          {/* Bouton fermeture mobile */}
          <button onClick={onClose} className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "gradient-purple-light text-white shadow-soft-lg"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
                onClick={() => onClose()}
              >
                <span className="flex items-center gap-3">
                  <span className={cn(isActive ? "text-white" : "text-white/70")}>
                    {item.icon}
                  </span>
                  {item.name}
                </span>
                {/* Badge pour les éléments avec notification */}
                {item.badge && (
                  <span className="ml-auto bg-white/20 text-white text-xs font-bold rounded-full px-2.5 py-1 min-w-[24px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Séparateur */}
        <div className="border-t border-white/10 my-4 mx-4" />

        {/* Actions utilisateur en bas */}
        <div className="p-4 space-y-2">
          <div className="px-4 py-3 bg-white/5 rounded-xl flex items-center gap-3 border border-white/10">
            <UserAvatar email={email ?? undefined} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Connecté</p>
              <p className="text-sm font-medium mt-0.5 truncate text-white">{email ?? "Utilisateur"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

/**
 * Composant Header - Barre supérieure du panel admin
 * Contient: Bouton menu mobile, titre, actions utilisateur
 */
function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter()
  const { data: session } = useSession()
  const email = session?.user?.email || null
  const displayName = useMemo(() => {
    if (!email) return "Utilisateur"
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }, [email])
  
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-soft">
      <div className="flex items-center justify-between h-20 px-4 md:px-8">
        {/* Bouton menu mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Titre de bienvenue */}
        <div className="flex-1 ml-4 md:ml-0">
          <h1 className="text-2xl font-bold text-foreground">Bienvenue {displayName} !</h1>
          <p className="text-sm text-muted-foreground">Voici un aperçu de votre activité</p>
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-4">
          {/* Barre de recherche */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Profil utilisateur */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
            <UserAvatar email={email ?? undefined} />
            <div className="hidden sm:block">
              <p className="text-sm font-medium truncate max-w-[160px]">{email ?? 'Utilisateur'}</p>
              <p className="text-xs text-muted-foreground">Connecté</p>
            </div>
          </div>

          {/* Bouton déconnexion */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-muted/50"
            onClick={async () => {
              await signOut({ redirect: false })
              toast.success('Déconnexion réussie')
              router.push('/login')
            }}
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

/**
 * Layout principal du panel administrateur
 * Structure: Sidebar fixe + Header sticky + Contenu scrollable
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background admin-theme" data-admin-theme>
      {/* Sidebar - Navigation principale */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Barre supérieure */}
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Zone de contenu - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-white">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

function UserAvatar({ email }: { email?: string }) {
  const initials = useMemo(() => {
    if (!email) return 'US'
    const name = email.split('@')[0]
    const letters = name.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
    return letters || 'US'
  }, [email])

  const bg = useMemo(() => {
    const str = email || 'user'
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0
    const hue = Math.abs(hash) % 360
    return `hsl(${hue} 70% 40%)`
  }, [email])

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
      style={{ backgroundColor: bg }}
      aria-label="Avatar utilisateur"
    >
      {initials}
    </div>
  )
}
