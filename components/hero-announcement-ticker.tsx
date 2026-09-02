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
  /** Position sous la navbar fixe du site principal */
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

  return (
    <div
      className={cn(
        'w-full border-b border-slate-200/90 bg-white shadow-sm',
        belowMainNav && 'sticky top-16 z-40 mt-16 md:top-20 md:mt-20',
        className,
      )}
      role="region"
      aria-live="polite"
      aria-label="Annonce du réseau"
    >
      <div className="mx-auto flex max-w-full items-stretch">
        {/* Icône + label fixes — repère visuel « annonce » */}
        <div
          className="flex shrink-0 items-center gap-2 border-r border-slate-200 bg-white px-3 py-2.5 md:px-4 md:py-3"
          aria-hidden
        >
          <Microphone3dIcon className="h-8 w-8 md:h-9 md:w-9" />
          <span className="hidden min-w-[4.5rem] flex-col leading-tight sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Live
            </span>
            <span className="text-xs font-semibold text-slate-800">Annonce</span>
          </span>
        </div>

        {/* Texte défilant */}
        <div className="relative min-w-0 flex-1 overflow-hidden py-2.5 md:py-3">
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
}
