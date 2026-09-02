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

type AnnouncementTone = 'hero' | 'light'

type HeroAnnouncementTickerProps = {
  /** hero = bandeau sur fond sombre (accueil OMA) · light = pages partenaires */
  tone?: AnnouncementTone
  className?: string
}

/* Palette isolée — n'utilise pas les tokens navbar / primary du site */
const LIVE_GOLD = '#d4af37'

function ScrollingText({
  announcement,
  tone,
}: {
  announcement: HeroAnnouncementData
  tone: AnnouncementTone
}) {
  const text = (
    <span
      className={cn(
        'inline-flex items-center gap-5 whitespace-nowrap px-10 text-sm font-medium md:text-[15px]',
        tone === 'hero' ? 'text-white/92' : 'text-slate-700',
      )}
    >
      <span>{announcement.text}</span>
      <span
        aria-hidden
        className="opacity-40"
        style={{ color: tone === 'hero' ? LIVE_GOLD : '#b8860b' }}
      >
        ·
      </span>
      {announcement.link && (
        <span
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: tone === 'hero' ? LIVE_GOLD : '#b8860b' }}
        >
          En savoir plus →
        </span>
      )}
    </span>
  )

  if (announcement.link) {
    return (
      <Link
        href={announcement.link}
        className="shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ ['--tw-ring-color' as string]: LIVE_GOLD }}
      >
        {text}
      </Link>
    )
  }

  return <div className="shrink-0">{text}</div>
}

export function HeroAnnouncementTicker({
  tone = 'light',
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

  /** 2 copies : l'animation scroll-left translate -50% boucle sans chevauchement */
  const loopItems = [announcement, announcement]
  const isHero = tone === 'hero'

  return (
    <div
      className={cn('oma-live-announcement w-full', className)}
      role="region"
      aria-live="polite"
      aria-label="Annonce en direct"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border shadow-lg',
          isHero
            ? 'border-[rgba(212,175,55,0.35)] bg-[rgba(15,15,28,0.72)] shadow-black/25 backdrop-blur-md'
            : 'border-[#e8e2d4] bg-gradient-to-r from-[#fdfbf7] via-white to-[#f8f5ef] shadow-slate-200/60',
        )}
      >
        {/* Lueur décorative — scoped au composant */}
        {isHero && (
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'linear-gradient(105deg, rgba(212,175,55,0.12) 0%, transparent 45%, rgba(212,175,55,0.08) 100%)',
            }}
          />
        )}

        <div className="relative flex items-stretch">
          {/* Badge Live + micro — fixe */}
          <div
            className={cn(
              'flex shrink-0 items-center gap-3 border-r px-4 py-3 md:px-5 md:py-3.5',
              isHero ? 'border-[rgba(212,175,55,0.25)]' : 'border-[#ebe5d8]',
            )}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl shadow-inner"
              style={{
                background: isHero
                  ? `linear-gradient(145deg, ${LIVE_GOLD} 0%, #a67c00 100%)`
                  : `linear-gradient(145deg, ${LIVE_GOLD} 0%, #c9a020 100%)`,
                boxShadow: isHero
                  ? '0 4px 14px rgba(212,175,55,0.35)'
                  : '0 4px 12px rgba(184,134,11,0.25)',
              }}
            >
              <Mic className="h-[18px] w-[18px] text-white" strokeWidth={2.25} aria-hidden />
            </div>
            <div className="hidden min-w-[3.5rem] flex-col sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="oma-live-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: isHero ? LIVE_GOLD : '#b8860b' }}
                >
                  Live
                </span>
              </span>
              <span
                className={cn(
                  'text-xs font-semibold',
                  isHero ? 'text-white/90' : 'text-slate-800',
                )}
              >
                Annonce
              </span>
            </div>
          </div>

          {/* Texte défilant */}
          <div className="relative min-w-0 flex-1 overflow-hidden py-3 md:py-3.5">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 md:w-12"
              style={{
                background: isHero
                  ? 'linear-gradient(to right, rgba(15,15,28,0.9), transparent)'
                  : 'linear-gradient(to right, #fdfbf7, transparent)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 md:w-12"
              style={{
                background: isHero
                  ? 'linear-gradient(to left, rgba(15,15,28,0.9), transparent)'
                  : 'linear-gradient(to left, #f8f5ef, transparent)',
              }}
            />
            <div
              className="flex w-max items-center"
              style={{ animation: 'scroll-left 48s linear infinite' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.animationPlayState = 'paused'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animationPlayState = 'running'
              }}
            >
              {loopItems.map((item, index) => (
                <ScrollingText
                  key={`${item.expiresAt}-${index}`}
                  announcement={item}
                  tone={tone}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .oma-live-pulse {
          animation: oma-live-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes oma-live-ping {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          70% {
            transform: scale(2.2);
            opacity: 0;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
