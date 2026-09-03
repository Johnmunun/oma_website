'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { LIVE_REACTION_EMOJIS, type LiveReactionEmoji } from '@/lib/challenges/live-reactions'

type ReactionEvent = {
  id: string
  emoji: string
  createdAt: string
}

type FloatingEmoji = {
  key: string
  emoji: string
  leftPct: number
  driftPx: number
  durationMs: number
  sizePx: number
}

interface ChallengeLiveReactionsProps {
  contactSlug: string
  challengeSlug: string
  enabled: boolean
  className?: string
}

const POLL_MS = 1200

function spawnFloat(emoji: string, id?: string): FloatingEmoji {
  return {
    key: id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    emoji,
    leftPct: 62 + Math.random() * 32,
    driftPx: Math.round((Math.random() - 0.5) * 48),
    durationMs: 2400 + Math.round(Math.random() * 900),
    sizePx: 26 + Math.round(Math.random() * 14),
  }
}

export function ChallengeLiveReactions({
  contactSlug,
  challengeSlug,
  enabled,
  className,
}: ChallengeLiveReactionsProps) {
  const [floats, setFloats] = useState<FloatingEmoji[]>([])
  const seenIds = useRef<Set<string>>(new Set())
  const lastCreatedAt = useRef<string | null>(null)
  const apiBase = `/api/structures/${encodeURIComponent(contactSlug)}/challenges/${encodeURIComponent(challengeSlug)}/live/reactions`

  const pushFloats = useCallback((emoji: string, id?: string) => {
    const batch = Array.from({ length: 1 + (Math.random() > 0.65 ? 1 : 0) }, () =>
      spawnFloat(emoji, id ? `${id}-${Math.random()}` : undefined)
    )
    setFloats((prev) => [...prev, ...batch].slice(-48))
  }, [])

  const ingestRemote = useCallback(
    (items: ReactionEvent[]) => {
      for (const item of items) {
        if (seenIds.current.has(item.id)) continue
        seenIds.current.add(item.id)
        pushFloats(item.emoji, item.id)
        lastCreatedAt.current = item.createdAt
      }
      if (seenIds.current.size > 500) {
        seenIds.current = new Set(Array.from(seenIds.current).slice(-200))
      }
    },
    [pushFloats]
  )

  const poll = useCallback(async () => {
    try {
      const qs = lastCreatedAt.current
        ? `?after=${encodeURIComponent(lastCreatedAt.current)}`
        : ''
      const res = await fetch(`${apiBase}${qs}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok || !data.success) return
      ingestRemote(data.data as ReactionEvent[])
    } catch {
      // ignore
    }
  }, [apiBase, ingestRemote])

  useEffect(() => {
    if (!enabled) return
    void poll()
    const id = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return
      void poll()
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [enabled, poll])

  const sendReaction = async (emoji: LiveReactionEmoji) => {
    pushFloats(emoji)
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const item = data.data as ReactionEvent
        if (!seenIds.current.has(item.id)) {
          seenIds.current.add(item.id)
          lastCreatedAt.current = item.createdAt
        }
      }
    } catch {
      // animation locale déjà affichée
    }
  }

  if (!enabled) return null

  return (
    <div className={cn('pointer-events-none absolute inset-0 z-10', className)}>
      <style jsx global>{`
        @keyframes oma-live-emoji-rise {
          0% {
            transform: translate(-50%, 0) scale(0.4);
            opacity: 0;
          }
          12% {
            opacity: 1;
            transform: translate(-50%, -12px) scale(1);
          }
          100% {
            transform: translate(calc(-50% + var(--drift)), -320px) scale(1.15);
            opacity: 0;
          }
        }
      `}</style>

      {/* Emojis flottants */}
      <div className="absolute inset-0 overflow-hidden">
        {floats.map((f) => (
          <span
            key={f.key}
            aria-hidden
            className="absolute bottom-[18%] select-none will-change-transform"
            style={{
              left: `${f.leftPct}%`,
              fontSize: `${f.sizePx}px`,
              lineHeight: 1,
              animation: `oma-live-emoji-rise ${f.durationMs}ms ease-out forwards`,
              ['--drift' as string]: `${f.driftPx}px`,
            }}
            onAnimationEnd={() => {
              setFloats((prev) => prev.filter((x) => x.key !== f.key))
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      {/* Barre d’emojis (style TikTok) */}
      <div className="pointer-events-auto absolute bottom-3 left-1/2 z-20 flex max-w-[95%] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-1.5 shadow-lg backdrop-blur-md">
        {LIVE_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Réagir ${emoji}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:scale-110 hover:bg-white/15 active:scale-95"
            onClick={() => void sendReaction(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
