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
      Shield,
      Building2,
      Layers,
      Trophy,
    } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useDynamicLogo } from "@/components/theming/dynamic-logo"
import { IdleDetector } from "@/components/admin/idle-detector"
import { WakeUpPing } from "@/components/admin/wakeup-ping"
import Image from "next/image"
import {
  useAdminPermissions,
  ADMIN_NAV_PERMISSIONS,
} from "@/hooks/use-admin-permissions"

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
    name: "Domaines d'expertise",
    href: "/admin/expertise-domains",
    icon: <Layers className="w-5 h-5" />,
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
    name: "Rôles",
    href: "/admin/roles",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    name: "Structures",
    href: "/admin/structures",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    name: "Challenges",
    href: "/admin/challenges",
    icon: <Trophy className="w-5 h-5" />,
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
  const { can, isRoot, loaded: permissionsLoaded } = useAdminPermissions()
  const email = session?.user?.email || null
  const isAdmin = useMemo(() => session?.user?.role === 'ADMIN', [session])
  const isEditor = useMemo(() => session?.user?.role === 'EDITOR', [session])
  const userRole = useMemo(() => session?.user?.role as 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined, [session])
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0)
  const logoUrl = useDynamicLogo()
  const [siteTitle, setSiteTitle] = useState("OMA")
  const [siteSlogan, setSiteSlogan] = useState("Oratoire mon art")
  
  // Éviter l'hydratation mismatch en utilisant un état de montage
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Charger le compteur de messages non lus
  useEffect(() => {
    if (!isMounted || !session?.user) return

    const controller = new AbortController()

    const loadUnreadCount = async () => {
      try {
        const res = await fetch('/api/admin/messages/count', {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!res.ok) {
          if (res.status !== 401 && res.status !== 403) {
            console.warn('[Admin] Erreur chargement compteur messages:', res.status, res.statusText)
          }
          return
        }
        const data = await res.json()
        if (data.success && typeof data.data?.unreadCount === 'number') {
          setUnreadMessagesCount(data.data.unreadCount)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        if (err instanceof TypeError && err.message === 'Failed to fetch') return
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[Admin] Erreur chargement compteur messages:', err)
      }
    }

    loadUnreadCount()

    const interval = setInterval(loadUnreadCount, 30000)

    const handleMessageUpdate = () => {
      loadUnreadCount()
    }

    window.addEventListener('message-updated', handleMessageUpdate)

    return () => {
      controller.abort()
      clearInterval(interval)
      window.removeEventListener('message-updated', handleMessageUpdate)
    }
  }, [isMounted, session?.user])

  // Charger le nombre d'événements à venir
  useEffect(() => {
    const loadUpcomingEventsCount = async () => {
      try {
        // Utiliser directement l'API admin qui est déjà authentifiée
        const res = await fetch('/api/admin/events/upcoming-count', {
          credentials: 'include',
        })
        
        if (!res.ok) {
          if (res.status !== 401 && res.status !== 403) {
            console.warn('[Admin] Erreur chargement compteur événements:', res.status, res.statusText)
          }
          return
        }
        
        const data = await res.json()
        if (data.success && typeof data.data?.count === 'number') {
          setUpcomingEventsCount(data.data.count)
        }
      } catch (err) {
        // Ne pas afficher d'erreur si c'est juste une erreur réseau temporaire
        // (par exemple, si la base de données n'est pas accessible)
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          // Erreur réseau silencieuse - la connexion sera réessayée au prochain intervalle
          return
        }
        console.error('[Admin] Erreur chargement compteur événements:', err)
      }
    }

    // Ne charger que si l'utilisateur est monté (évite les erreurs SSR)
    if (isMounted) {
      loadUpcomingEventsCount()
      
      // Recharger toutes les minutes
      const interval = setInterval(loadUpcomingEventsCount, 60000)
      
      return () => {
        clearInterval(interval)
      }
    }
  }, [isMounted])

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

    // Filtrer selon les permissions RBAC (fallback legacy si pas encore chargé)
    return items.filter((item) => {
      const requiredPerm = ADMIN_NAV_PERMISSIONS[item.href]

      if (permissionsLoaded) {
        if (isRoot) return true
        if (!requiredPerm) return true
        return can(requiredPerm)
      }

      // Fallback legacy pendant le chargement / transition
      const adminOnlyRoutes = [
        "/admin/users",
        "/admin/roles",
        "/admin/structures",
        "/admin/settings",
        "/admin/content",
        "/admin/analytics",
      ]
      if (adminOnlyRoutes.includes(item.href) && userRole !== "ADMIN") {
        return false
      }

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

      return true
    })
  }, [can, isRoot, permissionsLoaded, userRole, unreadMessagesCount, upcomingEventsCount, isMounted])

  return (
    <>
      {/* Overlay pour mobile - ferme le menu quand on clique dessus */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ease-out sidebar-mobile-backdrop" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar principale */}
      <aside
        role="navigation"
        aria-label="Navigation principale"
        className={cn(
          "fixed left-0 top-0 h-screen border-r border-white/10 overflow-y-auto transition-transform duration-300 ease-out z-50 md:z-auto md:relative md:transform-none w-[17rem] sidebar-scrollbar flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "will-change-transform"
        )}
        style={{
          background: "linear-gradient(180deg, oklch(0.22 0.08 280) 0%, oklch(0.14 0.02 280) 100%)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Logo & Fermeture mobile */}
        <div className="flex items-center justify-between h-[4.5rem] px-5 border-b border-white/10 shrink-0">
          <Link href="/admin" className="flex items-center gap-3 min-w-0 group/logo">
            <div className="relative inline-flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-xl bg-white/95 shadow-lg border border-white/40" />
              <div className="relative z-10 p-1.5">
                {isMounted && logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={siteTitle}
                    width={44}
                    height={44}
                    className="h-11 w-auto object-contain"
                    sizes="44px"
                    quality={95}
                    priority
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center text-gold text-xs font-bold font-serif">
                    OMA
                  </div>
                )}
              </div>
            </div>
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-sm text-white font-semibold tracking-wide truncate">{siteTitle}</span>
              <span className="text-[11px] text-white/50 font-normal truncate">
                {siteSlogan || "Administration"}
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto" role="navigation" aria-label="Menu de navigation">
          <p className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Menu
          </p>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-white/12 text-white shadow-sm"
                    : "text-white/65 hover:bg-white/8 hover:text-white",
                )}
                onClick={() => onClose()}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gold" aria-hidden />
                )}
                <span className="flex items-center gap-3 min-w-0">
                  <span className={cn(
                    "transition-colors duration-200 shrink-0",
                    isActive ? "text-gold" : "text-white/50 group-hover:text-white/80"
                  )}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </span>
                {item.badge && (
                  <span className="ml-2 shrink-0 bg-gold text-primary text-[11px] font-bold rounded-md px-2 py-0.5 min-w-[22px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions utilisateur en bas */}
        <div className="p-3 mt-auto border-t border-white/10 shrink-0">
          <div className="px-3 py-3 bg-white/5 rounded-xl flex items-center gap-3 border border-white/8">
            <UserAvatar email={email ?? undefined} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">Connecté</p>
              <p className="text-sm font-medium mt-0.5 truncate text-white/90">
                <HydratedUserEmail email={email} />
              </p>
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
function AdminHeader({ onMenuClick, sidebarOpen }: { onMenuClick: () => void; sidebarOpen: boolean }) {
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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="flex items-center justify-between h-[4.5rem] px-4 md:px-8 max-w-full gap-3">
          {/* Bouton menu mobile */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-muted rounded-xl transition-colors"
            aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-5 h-5" />
          </button>

        {/* Titre de bienvenue */}
        <div className="flex-1 ml-1 md:ml-0 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80 mb-0.5 hidden sm:block">
            Panel admin
          </p>
          <h1 className="text-base md:text-xl font-semibold text-foreground truncate">
            Bienvenue, {displayName}
          </h1>
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-2 md:gap-3 relative shrink-0">
          {/* Barre de recherche avec résultats - Desktop */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && searchResults && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-10 pr-4 py-2.5 w-56 lg:w-72 rounded-xl border border-border/80 bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-gold/40 focus:bg-white transition-all relative z-10"
              aria-label="Rechercher dans l'administration"
              aria-expanded={showResults}
              aria-controls="search-results"
              role="combobox"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {/* Dropdown de résultats - Utilise un positionnement fixe pour éviter les problèmes de z-index */}
            {showResults && searchResults && searchInputRef.current && (
              <div 
                id="search-results"
                role="listbox"
                aria-label="Résultats de recherche"
                className="fixed bg-white border border-border/80 rounded-xl shadow-xl z-[9999] max-h-[500px] overflow-y-auto ring-1 ring-black/5"
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
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Rechercher"
            title="Rechercher"
          >
            <Search className="w-5 h-5 transition-transform duration-200" />
          </button>

          {/* Profil utilisateur */}
          <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/40 transition-colors">
            <UserAvatar email={email ?? undefined} />
            <div className="hidden sm:block">
              <p className="text-xs md:text-sm font-medium truncate max-w-[160px]">
                <HydratedUserEmail email={email} />
              </p>
              <p className="text-[11px] text-muted-foreground">Connecté</p>
            </div>
          </div>

          {/* Bouton déconnexion */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
            onClick={async () => {
              await signOut({ redirect: false })
              toast.success('Déconnexion réussie')
              router.push('/login')
            }}
            title="Déconnexion"
            aria-label="Déconnexion"
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
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        {/* Zone de contenu - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[oklch(0.985_0.004_280)] relative">
          <div className="pointer-events-none absolute inset-0 opacity-[0.35] admin-content-grain" aria-hidden />
          <div className="p-5 md:p-8 max-w-full relative">{children}</div>
        </main>
      </div>
    </div>
  )
}

function HydratedUserEmail({ email }: { email: string | null }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return <>{mounted && email ? email : 'Utilisateur'}</>
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
