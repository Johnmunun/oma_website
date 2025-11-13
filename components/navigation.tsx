"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useDynamicLogo } from "@/components/theming/dynamic-logo"
import { SkeletonLogo } from "@/components/theming/skeleton-logo"
import { SkeletonSiteName } from "@/components/theming/skeleton-site-name"
import {
  getCachedSiteTitle,
  setCachedSiteTitle,
  getCachedLogo,
} from "@/lib/cache/visual-settings-cache"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const logoUrl = useDynamicLogo()
  const [cachedLogo, setCachedLogo] = useState<string | null>(null)
  const [siteTitle, setSiteTitle] = useState<string>(() => {
    // Initialiser avec le cache si disponible
    if (typeof window !== 'undefined') {
      return (
        (window as any).__OMA_CACHE__?.siteTitle ||
        getCachedSiteTitle() ||
        "OMA"
      )
    }
    return "OMA"
  })
  const [siteDescription, setSiteDescription] = useState("")
  const [isLoading, setIsLoading] = useState(() => {
    // Si on a déjà des valeurs en cache, on n'a pas besoin de charger
    if (typeof window !== 'undefined') {
      const hasCache = 
        (window as any).__OMA_CACHE__?.siteTitle ||
        (window as any).__OMA_CACHE__?.logo ||
        getCachedSiteTitle()
      return !hasCache
    }
    return true
  })

  // Charger le logo depuis le cache côté client uniquement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logo = 
        (window as any).__OMA_CACHE__?.logo ||
        getCachedLogo()
      setCachedLogo(logo)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        setIsLoading(true)
        
        // Charger depuis l'API
        const res = await fetch('/api/site-settings', {
          cache: 'no-store', // Pas de cache HTTP, on utilise notre cache local
        })
        if (!res.ok) {
          console.warn('[Navigation] ⚠️ Erreur API, utilisation du cache')
          setIsLoading(false)
          return
        }
        
        const data = await res.json()
        if (data.success && data.data) {
          const newSiteTitle = data.data.siteTitle || "OMA"
          const newSiteDescription = data.data.siteDescription || ""

          // Vérifier si les valeurs ont changé
          if (newSiteTitle !== siteTitle) {
            setSiteTitle(newSiteTitle)
            setCachedSiteTitle(newSiteTitle)
            console.log('[Navigation] ✅ Nom du site chargé depuis l\'API et mis à jour')
          } else {
            console.log('[Navigation] ✅ Nom du site identique, pas de mise à jour nécessaire')
          }

          if (newSiteDescription !== siteDescription) {
            setSiteDescription(newSiteDescription)
          }
        }
      } catch (err) {
        console.error('[Navigation] ❌ Erreur chargement settings:', err)
        // En cas d'erreur, utiliser le cache si disponible
        const cachedTitle = getCachedSiteTitle()
        if (cachedTitle && cachedTitle !== siteTitle) {
          setSiteTitle(cachedTitle)
          console.log('[Navigation] ✅ Utilisation du cache en cas d\'erreur')
        }
      } finally {
        setIsLoading(false)
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
  }, [siteTitle, siteDescription])

  // Limiter le titre à 25 caractères
  const truncatedTitle = siteTitle.length > 25 ? `${siteTitle.substring(0, 25)}...` : siteTitle

  const navLinks = [
    { href: "/", label: "Accueil", isHome: true },
    { href: "#formations", label: "Formations" },
    { href: "#oma-tv", label: "OMA TV" },
    { href: "#evenements", label: "Événements" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 max-w-full w-full overflow-x-hidden ${
        isScrolled ? "bg-primary/95 backdrop-blur-sm shadow-lg" : "bg-primary/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 py-4 max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 sm:flex-initial">
            {/* Logo avec skeleton */}
            {isLoading && !logoUrl && !cachedLogo ? (
              <SkeletonLogo />
            ) : logoUrl ? (
              <div className="relative inline-flex items-center justify-center flex-shrink-0">
                {/* Cercle blanc derrière le logo pour garantir la visibilité */}
                <div className="absolute w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-md z-0" />
                {/* Logo par-dessus - responsive */}
                <img
                  src={logoUrl}
                  alt={siteTitle}
                  className="h-10 w-auto sm:h-12 relative z-10"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-base sm:text-lg">OMA</span>
              </div>
            )}
            {/* Titre et slogan avec skeleton */}
            {isLoading && !siteTitle && !getCachedSiteTitle() ? (
              <SkeletonSiteName />
            ) : (
              <div className="flex flex-col justify-center min-w-0 flex-1 sm:flex-initial">
                <h1 className="font-serif font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground leading-tight group-hover:text-gold transition-colors truncate">
                  {truncatedTitle}
                </h1>
                <p className="hidden sm:block text-[10px] md:text-xs text-primary-foreground/70 leading-tight mt-0.5 line-clamp-1">
                  Oratoire Mon Art
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.isHome) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-primary-foreground hover:text-gold transition-colors inline-flex items-center gap-2"
                  >
                    {link.label}
                    {link.label === 'Formations' && (
                      <span className="text-[10px] leading-none px-2 py-1 rounded-full bg-secondary text-secondary-foreground shadow-sm uppercase tracking-wide">
                        Avenir
                      </span>
                    )}
                  </Link>
                )
              }
              
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-primary-foreground hover:text-gold transition-colors inline-flex items-center gap-2"
                >
                  {link.label}
                  {link.label === 'Formations' && (
                    <span className="text-[10px] leading-none px-2 py-1 rounded-full bg-secondary text-secondary-foreground shadow-sm uppercase tracking-wide">
                      Avenir
                    </span>
                  )}
                </a>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-primary-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navLinks.map((link) => {
              if (link.isHome) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm font-medium text-primary-foreground hover:text-gold transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="inline-flex items-center gap-2">
                      {link.label}
                      {link.label === 'Formations' && (
                        <span className="text-[10px] leading-none px-2 py-1 rounded-full bg-secondary text-secondary-foreground shadow-sm uppercase tracking-wide">
                          Avenir
                        </span>
                      )}
                    </span>
                  </Link>
                )
              }
              
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-primary-foreground hover:text-gold transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    {link.label}
                    {link.label === 'Formations' && (
                      <span className="text-[10px] leading-none px-2 py-1 rounded-full bg-secondary text-secondary-foreground shadow-sm uppercase tracking-wide">
                        Avenir
                      </span>
                    )}
                  </span>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
