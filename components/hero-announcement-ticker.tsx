'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

export type HeroAnnouncementData = {
  text: string
  link: string | null
  expiresAt: string
}

type HeroAnnouncementTickerProps = {
  /** Fixe la bande juste sous la navbar du site principal */
  belowMainNav?: boolean
  className?: string
}

function ScrollingText({ announcement }: { announcement: HeroAnnouncementData }) {
  const text = (
    <span className="inline-flex items-center gap-6 whitespace-nowrap px-8 text-sm font-medium text-slate-700 md:text-base">
      <span>{announcement.text}</span>
      {announcement.link && (
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          En savoir plus →
        </span>
      )}
    </span>
  )

  if (announcement.link) {
    return (
      <Link href={announcement.link} className="shrink-0 transition-colors hover:text-primary">
        {text}
      </Link>
    )
  }

  return <div className="shrink-0">{text}</div>
}

export function HeroAnnouncementTicker({
  belowMainNav = false,
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

  const loopItems = Array.from({ length: 8 }, () => announcement)

  const bar = (
    <div
      className={cn(
        'w-full border-y border-slate-200 bg-white shadow-sm',
        belowMainNav && 'fixed left-0 right-0 top-16 z-40 md:top-20',
        className,
      )}
      role="region"
      aria-live="polite"
      aria-label="Annonce du réseau"
    >
      <div className="mx-auto flex max-w-full items-stretch">
        <div className="flex shrink-0 items-center gap-2.5 border-r border-slate-200 bg-slate-50 px-3 py-2 md:px-4 md:py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Mic className="h-4 w-4" aria-hidden />
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-600 sm:inline">
            Annonce
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden py-2 md:py-2.5">
          <div
            className="flex w-max items-center"
            style={{ animation: 'scroll-left 45s linear infinite' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.animationPlayState = 'paused'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animationPlayState = 'running'
            }}
          >
            {loopItems.map((item, index) => (
              <ScrollingText key={`${item.expiresAt}-${index}`} announcement={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (!belowMainNav) return bar

  /* Réserve l'espace sous navbar + bande — la navbar reste transparente/sombre */
  return (
    <>
      {bar}
      <div className="mt-16 h-10 shrink-0 md:mt-20 md:h-11" aria-hidden />
    </>
  )
}
