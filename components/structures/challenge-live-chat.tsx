'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type ChatMessage = {
  id: string
  authorName: string
  body: string
  createdAt: string
}

interface ChallengeLiveChatProps {
  contactSlug: string
  challengeSlug: string
  className?: string
  /** Layout sombre type YouTube Live */
  variant?: 'default' | 'youtube'
}

const NAME_KEY = 'oma-live-chat-name'
const POLL_MS = 3500

export function ChallengeLiveChat({
  contactSlug,
  challengeSlug,
  className,
  variant = 'default',
}: ChallengeLiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [authorName, setAuthorName] = useState('')
  const [body, setBody] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liveMode, setLiveMode] = useState<'sse' | 'poll'>('sse')
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastCreatedAt = useRef<string | null>(null)
  const isYoutube = variant === 'youtube'

  const apiBase = `/api/structures/${encodeURIComponent(contactSlug)}/challenges/${encodeURIComponent(challengeSlug)}/live/chat`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_KEY)
      if (saved) setAuthorName(saved)
    } catch {
      // ignore
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const mergeMessages = useCallback((incoming: ChatMessage[], replace = false) => {
    setMessages((prev) => {
      const map = new Map<string, ChatMessage>()
      const base = replace ? [] : prev
      for (const m of base) map.set(m.id, m)
      for (const m of incoming) map.set(m.id, m)
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    })
  }, [])

  const fetchMessages = useCallback(
    async (incremental: boolean) => {
      try {
        const qs =
          incremental && lastCreatedAt.current
            ? `?after=${encodeURIComponent(lastCreatedAt.current)}`
            : ''
        const res = await fetch(`${apiBase}${qs}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok || !data.success) {
          if (!incremental) setError(data.error || 'Chat indisponible')
          return
        }
        const list = data.data as ChatMessage[]
        mergeMessages(list, !incremental)
        if (list.length > 0) {
          lastCreatedAt.current = list[list.length - 1].createdAt
        }
        setError(null)
      } catch {
        if (!incremental) setError('Impossible de charger le chat')
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase, mergeMessages]
  )

  useEffect(() => {
    void fetchMessages(false)
  }, [fetchMessages])

  useEffect(() => {
    let closed = false
    let es: EventSource | null = null
    let pollId: number | null = null
    let reconnectId: number | null = null

    const startPoll = () => {
      setLiveMode('poll')
      if (pollId != null) return
      pollId = window.setInterval(() => {
        if (document.visibilityState === 'hidden') return
        void fetchMessages(true)
      }, POLL_MS)
    }

    const connectSse = () => {
      if (closed) return
      if (typeof EventSource === 'undefined') {
        startPoll()
        return
      }

      const qs = lastCreatedAt.current
        ? `?after=${encodeURIComponent(lastCreatedAt.current)}`
        : ''
      es = new EventSource(`${apiBase}/stream${qs}`)
      setLiveMode('sse')

      es.addEventListener('messages', (ev) => {
        try {
          const list = JSON.parse((ev as MessageEvent).data) as ChatMessage[]
          mergeMessages(list)
          if (list.length > 0) {
            lastCreatedAt.current = list[list.length - 1].createdAt
          }
          setError(null)
          setIsLoading(false)
        } catch {
          // ignore
        }
      })

      es.addEventListener('chat-error', (ev) => {
        try {
          const payload = JSON.parse((ev as MessageEvent).data) as {
            message?: string
          }
          if (payload.message) setError(payload.message)
        } catch {
          // ignore
        }
      })

      es.addEventListener('done', () => {
        es?.close()
        es = null
        if (!closed) {
          reconnectId = window.setTimeout(connectSse, 400)
        }
      })

      es.onerror = () => {
        es?.close()
        es = null
        if (closed) return
        startPoll()
        reconnectId = window.setTimeout(() => {
          if (pollId != null) {
            window.clearInterval(pollId)
            pollId = null
          }
          connectSse()
        }, 8000)
      }
    }

    connectSse()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchMessages(true)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      closed = true
      document.removeEventListener('visibilitychange', onVisibility)
      es?.close()
      if (pollId != null) window.clearInterval(pollId)
      if (reconnectId != null) window.clearTimeout(reconnectId)
    }
  }, [apiBase, fetchMessages, mergeMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = authorName.trim()
    const text = body.trim()
    if (!name || !text) return

    setIsSending(true)
    setError(null)
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: name, body: text }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Envoi impossible')
      }
      try {
        localStorage.setItem(NAME_KEY, name)
      } catch {
        // ignore
      }
      mergeMessages([data.data as ChatMessage])
      lastCreatedAt.current = (data.data as ChatMessage).createdAt
      setBody('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden',
        isYoutube
          ? 'h-full bg-transparent text-white'
          : 'h-[min(28rem,70vh)] rounded-2xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      {!isYoutube && (
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Chat en direct</p>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
            {liveMode === 'sse' ? 'Temps réel' : 'Actualisation'}
          </span>
        </div>
      )}

      <div
        className={cn(
          'flex-1 space-y-2.5 overflow-y-auto',
          isYoutube ? 'px-3 py-3' : 'px-4 py-3'
        )}
      >
        {isLoading ? (
          <div
            className={cn(
              'flex h-full items-center justify-center',
              isYoutube ? 'text-white/40' : 'text-slate-400'
            )}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p
            className={cn(
              'py-8 text-center text-sm',
              isYoutube ? 'text-white/45' : 'text-slate-500'
            )}
          >
            Soyez le premier à écrire dans le chat.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-[13px] leading-snug">
              <span
                className={cn(
                  'font-semibold',
                  isYoutube ? 'text-[#3ea6ff]' : 'text-slate-800'
                )}
              >
                {m.authorName}
              </span>
              <span className={cn('mx-1.5', isYoutube ? 'text-white/25' : 'text-slate-300')}>
                ·
              </span>
              <span className={cn('text-[11px]', isYoutube ? 'text-white/35' : 'text-slate-400')}>
                {new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <p className={cn('mt-0.5 break-words', isYoutube ? 'text-white/85' : 'text-slate-600')}>
                {m.body}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className={cn(
          'space-y-2',
          isYoutube ? 'border-t border-white/10 p-3' : 'border-t border-slate-100 p-3'
        )}
      >
        {error && (
          <p
            className={cn(
              'rounded-lg px-3 py-2 text-xs',
              isYoutube ? 'bg-red-500/15 text-red-300' : 'bg-red-50 text-red-700'
            )}
          >
            {error}
          </p>
        )}
        <Input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Votre pseudo"
          maxLength={32}
          className={cn(
            'h-9',
            isYoutube &&
              'border-white/10 bg-[#121212] text-white placeholder:text-white/35 focus-visible:ring-white/20'
          )}
          required
        />
        <div className="flex gap-2">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Discuter…"
            maxLength={280}
            className={cn(
              'h-9',
              isYoutube &&
                'border-white/10 bg-[#121212] text-white placeholder:text-white/35 focus-visible:ring-white/20'
            )}
            required
          />
          <Button
            type="submit"
            size="sm"
            disabled={isSending}
            className={cn(
              'shrink-0',
              isYoutube
                ? 'bg-white text-black hover:bg-white/90'
                : 'text-white'
            )}
            style={isYoutube ? undefined : { backgroundColor: 'var(--st-primary)' }}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {isYoutube && (
          <p className="text-[10px] text-white/30">
            {liveMode === 'sse' ? 'Temps réel' : 'Actualisation'} · soyez respectueux
          </p>
        )}
      </form>
    </div>
  )
}
