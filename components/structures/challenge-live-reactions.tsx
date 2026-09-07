'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LIVE_REACTION_EMOJIS,
  type LiveReactionEmoji,
} from '@/lib/challenges/live-reaction-emojis'

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
  local: boolean
}

interface ChallengeLiveReactionsProps {
  contactSlug: string
  challengeSlug: string
  enabled: boolean
  className?: string
  variant?: 'default' | 'youtube'
}

const POLL_MS = 1200

function spawnFloat(emoji: string, opts?: { id?: string; local?: boolean }): FloatingEmoji {
  // Colonne droite (près de la barre) pour rester bien visible au-dessus de la vidéo
  const local = Boolean(opts?.local)
  return {
    key: opts?.id
      ? `${opts.id}-${Math.random().toString(36).slice(2, 7)}`
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    emoji,
    leftPct: local ? 72 + Math.random() * 22 : 62 + Math.random() * 32,
    driftPx: Math.round((Math.random() - 0.5) * 56),
    durationMs: local ? 2200 + Math.round(Math.random() * 600) : 2400 + Math.round(Math.random() * 900),
    sizePx: local ? 30 + Math.round(Math.random() * 16) : 26 + Math.round(Math.random() * 14),
    local,
  }
}

export function ChallengeLiveReactions({
  contactSlug,
  challengeSlug,
  enabled,
  className,
  variant = 'default',
}: ChallengeLiveReactionsProps) {
  const [floats, setFloats] = useState<FloatingEmoji[]>([])
  const [burstEmoji, setBurstEmoji] = useState<string | null>(null)
  const seenIds = useRef<Set<string>>(new Set())
  const lastCreatedAt = useRef<string | null>(null)
  const apiBase = `/api/structures/${encodeURIComponent(contactSlug)}/challenges/${encodeURIComponent(challengeSlug)}/live/reactions`
  const isYoutube = variant === 'youtube'

  const pushFloats = useCallback(
    (emoji: string, opts?: { id?: string; local?: boolean; count?: number }) => {
      const count = opts?.count ?? (opts?.local ? 3 : 1 + (Math.random() > 0.7 ? 1 : 0))
      const batch = Array.from({ length: count }, () =>
        spawnFloat(emoji, { id: opts?.id, local: opts?.local })
      )
      setFloats((prev) => [...prev, ...batch].slice(-64))
    },
    []
  )

  const ingestRemote = useCallback(
    (items: ReactionEvent[]) => {
      for (const item of items) {
        if (seenIds.current.has(item.id)) continue
        seenIds.current.add(item.id)
        pushFloats(item.emoji, { id: item.id, local: false, count: 1 })
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
    // Feedback immédiat pour la personne qui clique (ne dépend pas du poll)
    pushFloats(emoji, { local: true, count: 3 })
    setBurstEmoji(emoji)
    window.setTimeout(() => setBurstEmoji(null), 420)

    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const item = data.data as ReactionEvent
        seenIds.current.add(item.id)
        if (
          !lastCreatedAt.current ||
          new Date(item.createdAt) > new Date(lastCreatedAt.current)
        ) {
          lastCreatedAt.current = item.createdAt
        }
      }
    } catch {
      // animation locale déjà affichée
    }
  }

  if (!enabled) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-30 isolate overflow-hidden',
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {floats.map((f) => (
          <span
            key={f.key}
            className={cn(
              'oma-live-emoji-float absolute bottom-[14%] select-none will-change-transform drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]',
              f.local && 'oma-live-emoji-float--local'
            )}
            style={{
              left: `${f.leftPct}%`,
              fontSize: `${f.sizePx}px`,
              lineHeight: 1,
              animationDuration: `${f.durationMs}ms`,
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

      <div
        className={cn(
          'pointer-events-auto absolute z-40 flex',
          isYoutube
            ? 'bottom-4 right-3 flex-col gap-1 rounded-full border border-white/10 bg-black/55 p-1.5 shadow-lg backdrop-blur-md'
            : 'bottom-3 left-1/2 max-w-[95%] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-1.5 shadow-lg backdrop-blur-md'
        )}
      >
        {LIVE_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Réagir ${emoji}`}
            className={cn(
              'relative flex items-center justify-center rounded-full transition hover:scale-110 active:scale-90',
              isYoutube
                ? 'h-9 w-9 text-lg hover:bg-white/15'
                : 'h-9 w-9 text-xl hover:bg-white/15',
              burstEmoji === emoji && 'scale-125 bg-white/20 ring-2 ring-white/40'
            )}
            onClick={() => void sendReaction(emoji)}
          >
            <span className="relative z-10">{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
