'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Microphone3dIcon } from '@/components/illustrations/microphone-3d-icon'
import { cn } from '@/lib/utils'

export type HeroAnnouncementData = {
  text: string
  link: string | null
  expiresAt: string
}

type HeroAnnouncementTickerProps = {
  /** site = landing OMA principale, structure = pages partenaires /s/... */
  variant?: 'site' | 'structure'
  className?: string
}

function AnnouncementItem({
  announcement,
  variant,
}: {
  announcement: HeroAnnouncementData
  variant: 'site' | 'structure'
}) {
  const inner = (
    <span
      className={cn(
        'inline-flex items-center gap-3 whitespace-nowrap px-10',
        variant === 'site' ? 'text-primary-foreground/95' : 'text-white/95',
      )}
    >
      <Microphone3dIcon className={variant === 'structure' ? 'scale-90' : undefined} />
      <span className="text-sm font-semibold tracking-wide md:text-base">{announcement.text}</span>
      {announcement.link && (
        <span
          className={cn(
            'text-xs uppercase tracking-widest',
            variant === 'site' ? 'text-gold/90' : 'text-white/80',
          )}
        >
          En savoir plus →
        </span>
      )}
    </span>
  )

  if (announcement.link) {
    return (
      <Link href={announcement.link} className="shrink-0 transition-opacity hover:opacity-90">
        {inner}
      </Link>
    )
  }

  return <div className="shrink-0">{inner}</div>
}

export function HeroAnnouncementTicker({
  variant = 'site',
  className,
}: HeroAnnouncementTickerProps) {
  const [announcement, setAnnouncement] = useState<HeroAnnouncementData | null>(null)

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' })
        if (!res.ok) return

        const data = await res.json()
        if (data.success && data.data?.heroAnnouncement) {
          setAnnouncement(data.data.heroAnnouncement)
        } else {
          setAnnouncement(null)
        }
      } catch (err) {
        console.error('[HeroAnnouncementTicker] Erreur chargement:', err)
        setAnnouncement(null)
      }
    }

    loadAnnouncement()

    const handleSettingsUpdate = () => loadAnnouncement()
    window.addEventListener('settings-updated', handleSettingsUpdate)
    return () => window.removeEventListener('settings-updated', handleSettingsUpdate)
  }, [])

  if (!announcement) return null

  const loopItems = Array.from({ length: 6 }, () => announcement)

  return (
    <div
      className={cn(
        'relative z-20 w-full overflow-hidden border-b',
        variant === 'site'
          ? 'border-gold/25 bg-primary/95 backdrop-blur-sm'
          : 'border-white/15 bg-black/35 backdrop-blur-md',
        className,
      )}
      role="marquee"
      aria-live="polite"
      aria-label="Annonce"
    >
      <div className="relative py-2.5 md:py-3">
        <div
          className="flex w-max"
          style={{ animation: 'scroll-left 40s linear infinite' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animationPlayState = 'paused'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animationPlayState = 'running'
          }}
        >
          {loopItems.map((item, index) => (
            <AnnouncementItem
              key={`${item.expiresAt}-${index}`}
              announcement={item}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
