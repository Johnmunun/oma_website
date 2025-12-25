"use client"

import { MessageCircle, Mail, Phone, Facebook, Instagram, Youtube, Twitter, Linkedin } from "lucide-react"
import { useEffect, useState } from "react"

interface SiteSettings {
  email: string
  telephones: string[]
  facebook: string
  instagram: string
  youtube: string
  twitter: string
  linkedin: string
  site_title?: string
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<SiteSettings>({
    email: "",
    telephones: [],
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    linkedin: "",
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/site-settings', { 
          next: { revalidate: 60 } // Cache 60 secondes
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.data) {
          setSettings({
            email: data.data.email || "",
            telephones: Array.isArray(data.data.telephones) 
              ? data.data.telephones 
              : data.data.telephones 
                ? data.data.telephones.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [],
            facebook: data.data.facebook || "",
            instagram: data.data.instagram || "",
            youtube: data.data.youtube || "",
            twitter: data.data.twitter || "",
            linkedin: data.data.linkedin || "",
          })
        }
      } catch (err) {
        console.error('[Footer] Erreur chargement paramètres:', err)
      }
    }
    
    // Charger au montage
    loadSettings()
    
    // Écouter les événements de mise à jour des settings
    const handleSettingsUpdate = () => {
      loadSettings()
    }
    
    window.addEventListener('settings-updated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  const socialLinks = [
    { icon: Facebook, url: settings.facebook, name: "Facebook" },
    { icon: Instagram, url: settings.instagram, name: "Instagram" },
    { icon: Youtube, url: settings.youtube, name: "YouTube" },
    { icon: Twitter, url: settings.twitter, name: "Twitter" },
    { icon: Linkedin, url: settings.linkedin, name: "LinkedIn" },
  ].filter(link => link.url)

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif font-bold text-2xl text-gold mb-4">Réseau OMA</h3>
            <p className="text-primary-foreground/80 leading-relaxed">
              Plateforme internationale dédiée à l'art oratoire, la communication et le leadership.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {socialLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-gold hover:text-primary transition-colors"
                      aria-label={link.name}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gold">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <a href="#accueil" className="text-primary-foreground/80 hover:text-gold transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#formations" className="text-primary-foreground/80 hover:text-gold transition-colors">
                  Formations
                </a>
              </li>
              <li>
                <a href="#oma-tv" className="text-primary-foreground/80 hover:text-gold transition-colors">
                  OMA TV
                </a>
              </li>
              <li>
                <a href="#evenements" className="text-primary-foreground/80 hover:text-gold transition-colors">
                  Événements
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gold">Nos services</h4>
            <ul className="space-y-2">
              <li className="text-primary-foreground/80">Art oratoire</li>
              <li className="text-primary-foreground/80">Leadership</li>
              <li className="text-primary-foreground/80">Communication</li>
              <li className="text-primary-foreground/80">Marketing digital</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-gold" />
              <h4 className="font-semibold text-gold">Contact</h4>
            </div>
            <ul className="space-y-2">
              {settings.email && (
                <li>
                  <a 
                    href={`mailto:${settings.email}`}
                    className="text-primary-foreground/80 hover:text-gold transition-colors flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.telephones.length > 0 && (
                <>
                  {settings.telephones.map((tel, index) => (
                    <li key={index}>
                      <a 
                        href={`tel:${tel.replace(/\s/g, '')}`}
                        className="text-primary-foreground/80 hover:text-gold transition-colors flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        {tel}
                      </a>
                    </li>
                  ))}
                </>
              )}
              {!settings.email && settings.telephones.length === 0 && (
                <li className="text-primary-foreground/60">Aucune information de contact</li>
              )}
            </ul>
          </div>
        </div>

       <div className="border-t border-primary-foreground/20 pt-8 text-center">
  <p className="text-primary-foreground/80">
    Copyright © {currentYear} Réseau OMA — Tous droits réservés
  </p>
  <p className="text-primary-foreground/60 mt-2">
    Site créé par EasyLearn Academia — contact@easylearn.com
  </p>
</div>

      </div>
    </footer>
  )
}
