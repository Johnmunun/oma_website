"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useDynamicLogo } from "@/components/theming/dynamic-logo"
import { SkeletonLogo } from "@/components/theming/skeleton-logo"
import { SkeletonSiteName } from "@/components/theming/skeleton-site-name"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  getCachedSiteTitle,
  setCachedSiteTitle,
  getCachedLogo,
} from "@/lib/cache/visual-settings-cache"
import { cn } from "@/lib/utils"

type NavLinkItem = {
  href: string
  label: string
  isPage?: boolean
}

const navLinks: NavLinkItem[] = [
  { href: "/", label: "Accueil", isPage: true },
  { href: "/about", label: "About Us", isPage: true },
  { href: "/#oma-tv", label: "OMA TV" },
  { href: "/#evenements", label: "Événements" },
  { href: "/#contact", label: "Contact" },
]

function NavLink({
  link,
  onClick,
  className,
}: {
  link: NavLinkItem
  onClick?: () => void
  className?: string
}) {
  const baseClass = cn(
    "text-sm font-medium text-primary-foreground hover:text-gold transition-colors inline-flex items-center gap-2",
    className
  )

  if (link.isPage) {
    return (
      <Link href={link.href} className={baseClass} onClick={onClick}>
        {link.label}
      </Link>
    )
  }

  return (
    <Link href={link.href} className={baseClass} onClick={onClick}>
      {link.label}
    </Link>
  )
}

interface NavigationProps {
  /** Force la barre opaque (pages sans hero plein écran) */
  forceSolid?: boolean
}

export function Navigation({ forceSolid = false }: NavigationProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const logoUrl = useDynamicLogo()
  const [cachedLogo, setCachedLogo] = useState<string | null>(null)
  const [siteTitle, setSiteTitle] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        (window as Window & { __OMA_CACHE__?: { siteTitle?: string } }).__OMA_CACHE__?.siteTitle ||
        getCachedSiteTitle() ||
        "OMA"
      )
    }
    return "OMA"
  })
  const [siteDescription, setSiteDescription] = useState("")
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const win = window as Window & { __OMA_CACHE__?: { siteTitle?: string; logo?: string } }
      const hasCache = win.__OMA_CACHE__?.siteTitle || win.__OMA_CACHE__?.logo || getCachedSiteTitle()
      return !hasCache
    }
    return true
  })

  const isHome = pathname === "/"
  const showSolidNav = forceSolid || !isHome || isScrolled

  useEffect(() => {
    if (typeof window !== "undefined") {
      const logo =
        (window as Window & { __OMA_CACHE__?: { logo?: string } }).__OMA_CACHE__?.logo ||
        getCachedLogo()
      setCachedLogo(logo)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/site-settings", { cache: "no-store" })
        if (!res.ok) {
          setIsLoading(false)
          return
        }
        const data = await res.json()
        if (data.success && data.data) {
          const newSiteTitle = data.data.siteTitle || "OMA"
          const newSiteDescription = data.data.siteDescription || ""
          if (newSiteTitle !== siteTitle) {
            setSiteTitle(newSiteTitle)
            setCachedSiteTitle(newSiteTitle)
          }
          if (newSiteDescription !== siteDescription) {
            setSiteDescription(newSiteDescription)
          }
        }
      } catch (err) {
        console.error("[Navigation] Erreur chargement settings:", err)
        const cachedTitle = getCachedSiteTitle()
        if (cachedTitle && cachedTitle !== siteTitle) {
          setSiteTitle(cachedTitle)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSiteSettings()
    const handleSettingsUpdate = () => loadSiteSettings()
    window.addEventListener("settings-updated", handleSettingsUpdate)
    return () => window.removeEventListener("settings-updated", handleSettingsUpdate)
  }, [siteTitle, siteDescription])

  const truncatedTitle = siteTitle.length > 25 ? `${siteTitle.substring(0, 25)}...` : siteTitle
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <nav
        role="navigation"
        aria-label="Navigation principale"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 max-w-full w-full overflow-x-hidden",
          showSolidNav
            ? "bg-primary/95 backdrop-blur-md shadow-lg border-b border-gold/10"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-full overflow-x-hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 sm:flex-initial">
              {isLoading && !logoUrl && !cachedLogo ? (
                <SkeletonLogo />
              ) : logoUrl ? (
                <div className="relative inline-flex items-center justify-center flex-shrink-0 group/logo">
                  <div className="absolute w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-lg shadow-black/10 border border-white/50 z-0 transition-all duration-300 group-hover/logo:shadow-xl group-hover/logo:shadow-gold/20 group-hover/logo:scale-105" />
                  <div className="absolute w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent rounded-2xl z-[1] opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 blur-sm" />
                  <div className="relative z-10 p-1 sm:p-1.5 transition-transform duration-300 group-hover/logo:scale-105">
                    <Image
                      src={logoUrl}
                      alt={siteTitle}
                      width={56}
                      height={56}
                      className="h-10 w-auto sm:h-12 md:h-14 object-contain drop-shadow-sm"
                      onLoad={() => setIsLoading(false)}
                      sizes="(max-width: 640px) 40px, 56px"
                      quality={95}
                      priority
                    />
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">OMA</span>
                </div>
              )}
              {isLoading && !siteTitle && !getCachedSiteTitle() ? (
                <SkeletonSiteName />
              ) : (
                <div className="flex flex-col justify-center min-w-0 flex-1 sm:flex-initial">
                  <span className="font-serif font-bold text-sm sm:text-lg md:text-xl lg:text-2xl text-primary-foreground leading-tight group-hover:text-gold transition-colors truncate">
                    {truncatedTitle}
                  </span>
                  <span className="hidden sm:block text-[10px] md:text-xs text-primary-foreground/70 leading-tight mt-0.5 line-clamp-1">
                    Oratoire Mon Art
                  </span>
                </div>
              )}
            </Link>

            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <NavLink key={link.href} link={link} />
              ))}
              <Button
                size="sm"
                className="bg-gold hover:bg-gold-dark text-primary font-semibold ml-1 shrink-0"
                asChild
              >
                <Link href="/#contact">Nous contacter</Link>
              </Button>
            </div>

            <button
              className="lg:hidden text-primary-foreground p-2 -mr-2 shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="right"
          className="bg-primary border-gold/20 text-primary-foreground w-[min(100vw-2rem,20rem)] p-0 flex flex-col"
        >
          <SheetHeader className="p-6 pb-4 border-b border-gold/15 text-left">
            <SheetTitle className="font-serif text-gold text-xl">Menu</SheetTitle>
            <SheetDescription className="text-primary-foreground/60 text-sm">
              Navigation du Réseau OMA
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col p-4 gap-1 flex-1" aria-label="Navigation mobile">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                onClick={closeMobileMenu}
                className="text-base py-3 px-3 rounded-lg hover:bg-gold/10 w-full"
              />
            ))}
          </nav>

          <div className="p-4 border-t border-gold/15 mt-auto">
            <Button
              className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold"
              asChild
              onClick={closeMobileMenu}
            >
              <Link href="/#contact">Nous contacter</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
