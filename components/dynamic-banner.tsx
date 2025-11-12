"use client"

/**
 * @file components/dynamic-banner.tsx
 * @description Bannière dynamique pour la landing page (style YouTube)
 * Affiche la photo de couverture, le logo et les boutons de réseaux sociaux
 */

import { useEffect, useState } from 'react'
import { useDynamicLogo } from '@/components/theming/dynamic-logo'
import { Facebook, Instagram, Youtube, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SiteSettings {
  coverImageUrl?: string | null
  facebook?: string | null
  instagram?: string | null
  youtube?: string | null
  twitter?: string | null
  linkedin?: string | null
}

export function DynamicBanner() {
  const logoUrl = useDynamicLogo()
  const [settings, setSettings] = useState<SiteSettings>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/site-settings', {
          next: { revalidate: 60 },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            console.log('[DynamicBanner] Settings chargés:', {
              coverImageUrl: data.data.coverImageUrl,
              hasCoverImage: !!data.data.coverImageUrl,
              fullData: data.data,
            })
            setSettings({
              coverImageUrl: data.data.coverImageUrl || null,
              facebook: data.data.facebook || null,
              instagram: data.data.instagram || null,
              youtube: data.data.youtube || null,
              twitter: data.data.twitter || null,
              linkedin: data.data.linkedin || null,
            })
          } else {
            console.warn('[DynamicBanner] Pas de données dans la réponse:', data)
          }
        } else {
          console.error('[DynamicBanner] Erreur réponse API:', res.status, await res.text())
        }
      } catch (error) {
        console.error('[DynamicBanner] Erreur chargement settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-primary via-primary/90 to-primary animate-pulse" />
    )
  }

  const socialLinks = [
    { icon: Facebook, url: settings.facebook, label: 'Facebook', color: 'text-blue-600' },
    { icon: Instagram, url: settings.instagram, label: 'Instagram', color: 'text-pink-600' },
    { icon: Youtube, url: settings.youtube, label: 'YouTube', color: 'text-red-600' },
    { icon: Twitter, url: settings.twitter, label: 'Twitter', color: 'text-sky-500' },
    { icon: Linkedin, url: settings.linkedin, label: 'LinkedIn', color: 'text-blue-700' },
    { icon: MessageCircle, url: settings.facebook ? `https://wa.me/${settings.facebook.replace(/[^0-9]/g, '')}` : null, label: 'WhatsApp', color: 'text-green-600' },
  ].filter(link => link.url)

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Photo de couverture */}
      {settings.coverImageUrl ? (
        <img
          src={settings.coverImageUrl}
          alt="Bannière Réseau OMA"
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center',
          }}
          loading="eager"
          onError={(e) => {
            console.error('[DynamicBanner] Erreur chargement image:', settings.coverImageUrl)
            e.currentTarget.style.display = 'none'
          }}
          onLoad={() => {
            console.log('[DynamicBanner] Image chargée avec succès:', settings.coverImageUrl)
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary via-primary/90 to-primary" />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Contenu de la bannière */}
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-4 pb-8 md:pb-12 w-full">
          <div className="flex flex-col md:flex-row items-end gap-6 md:gap-8">
            {/* Logo avec cercle blanc */}
            {logoUrl && (
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white p-2 shadow-2xl flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Réseau OMA"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Informations */}
            <div className="flex-grow text-white">
              <h1 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl mb-2 drop-shadow-lg">
                Réseau OMA
              </h1>
              <p className="text-lg md:text-xl text-gray-100 mb-4 drop-shadow-md">
                Art oratoire, Communication, Management et Formation
              </p>

              {/* Boutons réseaux sociaux */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      asChild
                      className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
                    >
                      <a
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <link.icon className={cn("w-4 h-4", link.color)} />
                        <span className="hidden sm:inline">{link.label}</span>
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

