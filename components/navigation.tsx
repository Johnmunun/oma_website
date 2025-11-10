"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { useDynamicLogo } from "@/components/theming/dynamic-logo"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const logoUrl = useDynamicLogo()
  const [siteTitle, setSiteTitle] = useState("OMA")

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
        const res = await fetch('/api/site-settings', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.data?.siteTitle) {
          setSiteTitle(data.data.siteTitle)
        }
      } catch (err) {
        console.error('[Navigation] Erreur chargement settings:', err)
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

  const navLinks = [
    { href: "#accueil", label: "Accueil" },
    { href: "#formations", label: "Formations" },
    { href: "#oma-tv", label: "OMA TV" },
    { href: "#evenements", label: "Événements" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-primary/95 backdrop-blur-sm shadow-lg" : "bg-primary/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#accueil" className="flex items-center gap-2">
            {logoUrl ? (
              <div className="relative inline-flex items-center justify-center">
                {/* Cercle blanc derrière le logo pour garantir la visibilité */}
                <div className="absolute w-14 h-14 bg-white rounded-full shadow-md z-0" />
                {/* Logo par-dessus - agrandi */}
                <img src={logoUrl} alt={siteTitle} className="h-12 w-auto relative z-10" />
              </div>
            ) : (
              <div className="text-2xl font-serif font-bold text-gold">{siteTitle}</div>
            )}
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
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
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-primary-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navLinks.map((link) => (
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
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
