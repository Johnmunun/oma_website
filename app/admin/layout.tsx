/**
 * @file app/admin/layout.tsx
 * @description Layout du panel administrateur avec sidebar intégré et navigation contextuelle
 * Structure : Sidebar simple + Header + Contenu principal
 * @author OMA Team
 */

"use client"

import type React from "react"
import { useEffect, useMemo, useState, useRef } from "react"
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
      Heart,
      Globe,
      Code2,
    } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useDynamicLogo } from "@/components/theming/dynamic-logo"
import { IdleDetector } from "@/components/admin/idle-detector"
import { WakeUpPing } from "@/components/admin/wakeup-ping"

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
    name: "Témoignages",
    href: "/admin/testimonials",
    icon: <Heart className="w-5 h-5" />,
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
    name: "SEO",
    href: "/admin/seo",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    name: "Pixels",
    href: "/admin/pixels",
    icon: <Code2 className="w-5 h-5" />,
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
  const isEditor = useMemo(() => session?.user?.role === 'EDITOR', [session])
  const userRole = useMemo(() => session?.user?.role as 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined, [session])
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0)
  const logoUrl = useDynamicLogo()
  const [siteTitle, setSiteTitle] = useState("OMA")
  const [siteSlogan, setSiteSlogan] = useState("Oratoire mon art")

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

  // Charger le nombre d'événements à venir
  useEffect(() => {
    const loadUpcomingEventsCount = async () => {
      try {
        const res = await fetch('/api/events?upcoming=true&limit=1')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            // Compter tous les événements à venir (on fait une requête pour compter)
            const countRes = await fetch('/api/admin/events?status=PUBLISHED&limit=1000')
            if (countRes.ok) {
              const countData = await countRes.json()
              if (countData.success && countData.data) {
                const now = new Date()
                const upcoming = countData.data.filter((event: any) => {
                  if (!event.startsAt) return false
                  return new Date(event.startsAt) >= now
                })
                setUpcomingEventsCount(upcoming.length)
              }
            }
          }
        }
      } catch (err) {
        console.error('[Admin] Erreur chargement compteur événements:', err)
      }
    }

    loadUpcomingEventsCount()
    
    // Recharger toutes les minutes
    const interval = setInterval(loadUpcomingEventsCount, 60000)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  // Charger le titre et le slogan du site depuis les settings
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.data) {
          if (data.data.siteTitle) {
            setSiteTitle(data.data.siteTitle)
          }
          if (data.data.siteDescription) {
            setSiteSlogan(data.data.siteDescription)
          }
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

  // Éviter l'hydratation mismatch en utilisant un état de montage
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navigationItems = useMemo(() => {
    // Pendant le SSR et avant le montage, retourner tous les items sans filtrage
    // pour éviter les différences entre serveur et client
    if (!isMounted) {
      return baseNavigationItems
    }

    const items = baseNavigationItems.map((item) => {
      // Ajouter le compteur de messages non lus pour l'item Messages
      if (item.href === '/admin/messages') {
        return {
          ...item,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        }
      }
      // Ajouter le compteur d'événements à venir pour l'item Événements
      if (item.href === '/admin/events') {
        return {
          ...item,
          badge: upcomingEventsCount > 0 ? upcomingEventsCount : undefined,
        }
      }
      return item
    })

    // Filtrer selon les rôles
    return items.filter((item) => {
      // Routes réservées aux ADMIN uniquement
      const adminOnlyRoutes = [
        "/admin/users",
        "/admin/settings",
        "/admin/content",
        "/admin/analytics",
      ]
      if (adminOnlyRoutes.includes(item.href) && userRole !== "ADMIN") {
        return false
      }

      // Routes accessibles aux ADMIN et EDITOR (mais pas VIEWER)
      const editorRoutes = [
        "/admin/team",
        "/admin/testimonials",
        "/admin/newsletter",
        "/admin/media",
        "/admin/partners",
      ]
      if (editorRoutes.includes(item.href) && userRole === "VIEWER") {
        return false
      }

      // Routes accessibles à tous : Dashboard, Événements, Messages
      return true
    })
  }, [isAdmin, userRole, unreadMessagesCount, upcomingEventsCount, isMounted])

  return (
    <>
      {/* Overlay pour mobile - ferme le menu quand on clique dessus */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar principale - Violet foncé avec gradient premium */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] overflow-y-auto transition-all duration-300 z-50 md:z-auto md:relative md:transform-none w-64 shadow-2xl sidebar-scrollbar",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        style={{
          background: "linear-gradient(180deg, oklch(0.25 0.1 280) 0%, oklch(0.15 0.02 280) 100%)",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15), 2px 0 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Logo & Fermeture mobile */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[var(--sidebar-border)] bg-white/5 backdrop-blur-sm shadow-inner">
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
              <span className="text-white font-bold">{siteTitle.toUpperCase()}</span>
              <span className="text-xs text-white/70 font-normal">{siteSlogan}</span>
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
                  "flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "gradient-purple-light text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:scale-[1.02]"
                    : "text-white/80 hover:bg-white/10 hover:text-white hover:shadow-md hover:scale-[1.01]",
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
          <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/10 shadow-inner backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-md">
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
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    events: Array<{ id: string; title: string; slug: string }>
    users: Array<{ id: string; name: string | null; email: string }>
    messages: Array<{ id: string; name: string; email: string; subject: string | null }>
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  
  // Recherche globale
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null)
      setShowResults(false)
      return
    }
    
    const searchTimeout = setTimeout(async () => {
      try {
        setIsSearching(true)
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`, {
          cache: 'no-store'
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setSearchResults(data.data)
            setShowResults(true)
          }
        }
      } catch (err) {
        console.error('[Admin] Erreur recherche:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300) // Debounce de 300ms
    
    return () => clearTimeout(searchTimeout)
  }, [searchQuery])
  
  const handleSearchClick = (type: 'event' | 'user' | 'message', id: string) => {
    setSearchQuery("")
    setShowResults(false)
    if (type === 'event') {
      router.push(`/admin/events?highlight=${id}`)
    } else if (type === 'user') {
      router.push(`/admin/users?highlight=${id}`)
    } else if (type === 'message') {
      router.push(`/admin/messages?highlight=${id}`)
    }
  }
  
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-lg shadow-black/5">
      <div className="flex items-center justify-between h-20 px-4 md:px-8 max-w-full">
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
        <div className="flex items-center gap-2 md:gap-4 relative">
          {/* Barre de recherche avec résultats - Desktop */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher événements, utilisateurs, messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && searchResults && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-10 pr-4 py-2 w-64 lg:w-80 rounded-2xl border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg relative z-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {/* Dropdown de résultats - Utilise un positionnement fixe pour éviter les problèmes de z-index */}
            {showResults && searchResults && searchInputRef.current && (
              <div 
                className="fixed bg-white border border-border rounded-2xl shadow-2xl z-[9999] max-h-[500px] overflow-y-auto"
                style={{
                  top: `${searchInputRef.current.getBoundingClientRect().bottom + 8}px`,
                  left: `${searchInputRef.current.getBoundingClientRect().left}px`,
                  width: `${Math.max(searchInputRef.current.offsetWidth, 320)}px`,
                  maxWidth: 'min(90vw, 32rem)',
                }}
              >
                <div className="p-2">
                  {/* Événements */}
                  {searchResults.events.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wide">
                        Événements ({searchResults.events.length})
                      </p>
                      {searchResults.events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleSearchClick('event', event.id)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">Événement</p>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Utilisateurs */}
                  {searchResults.users.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wide">
                        Utilisateurs ({searchResults.users.length})
                      </p>
                      {searchResults.users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSearchClick('user', user.id)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Messages */}
                  {searchResults.messages.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wide">
                        Messages ({searchResults.messages.length})
                      </p>
                      {searchResults.messages.map((message) => (
                        <button
                          key={message.id}
                          onClick={() => handleSearchClick('message', message.id)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <p className="text-sm font-medium truncate">{message.subject || 'Sans objet'}</p>
                          <p className="text-xs text-muted-foreground truncate">{message.name} • {message.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.events.length === 0 && searchResults.users.length === 0 && searchResults.messages.length === 0 && (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                      Aucun résultat trouvé
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Barre de recherche mobile - Icône seulement */}
          <button
            onClick={() => {
              // Pour mobile, on pourrait ouvrir un modal de recherche
              // Pour l'instant, on redirige vers une page de recherche ou on affiche un toast
              toast.info('Utilisez la recherche sur desktop pour une meilleure expérience')
            }}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Rechercher"
            title="Rechercher"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Profil utilisateur */}
          <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-2xl hover:bg-muted/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
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
            className="p-2 hover:bg-muted/50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
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
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState(15) // Valeur par défaut
  const [wakeUpPingIntervalMinutes, setWakeUpPingIntervalMinutes] = useState(5) // Valeur par défaut
  const router = useRouter()
  const pathname = usePathname()

  // Charger les paramètres depuis les settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            if (data.data.idleTimeoutMinutes) {
              setIdleTimeoutMinutes(data.data.idleTimeoutMinutes)
            }
            if (data.data.wakeUpPingIntervalMinutes) {
              setWakeUpPingIntervalMinutes(data.data.wakeUpPingIntervalMinutes)
            }
          }
        }
      } catch (err) {
        console.error("[AdminLayout] Erreur chargement settings:", err)
      }
    }

    loadSettings()
  }, [])

  // Callback appelé quand l'inactivité est détectée
  const handleIdle = () => {
    // Rediriger vers la page de déverrouillage avec l'URL actuelle en paramètre
    const currentPath = pathname || "/admin"
    router.push(`/admin/unlock?redirect=${encodeURIComponent(currentPath)}`)
  }

  return (
    <div className="flex h-screen bg-background admin-theme overflow-x-hidden max-w-full" data-admin-theme>
      {/* Détecteur d'inactivité */}
      {pathname !== "/admin/unlock" && (
        <IdleDetector
          idleTimeoutMinutes={idleTimeoutMinutes}
          onIdle={handleIdle}
        />
      )}

      {/* Wake-up ping pour maintenir la DB active */}
      {pathname !== "/admin/unlock" && (
        <WakeUpPing intervalMinutes={wakeUpPingIntervalMinutes} />
      )}

      {/* Sidebar - Navigation principale */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-full">
        {/* Header - Barre supérieure */}
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Zone de contenu - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-white via-purple-50/30 to-white">
          <div className="p-6 md:p-8 max-w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}

function UserAvatar({ email }: { email?: string }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  // Rendre un placeholder côté serveur pour éviter l'erreur d'hydratation
  if (!isMounted) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-muted"
        aria-label="Avatar utilisateur"
      >
        US
      </div>
    )
  }

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
