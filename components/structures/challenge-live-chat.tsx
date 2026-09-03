'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, MessageCircle, Send } from 'lucide-react'
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
}

const NAME_KEY = 'oma-live-chat-name'
const POLL_MS = 3500

export function ChallengeLiveChat({
  contactSlug,
  challengeSlug,
  className,
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

  // Charge initiale
  useEffect(() => {
    void fetchMessages(false)
  }, [fetchMessages])

  // SSE + fallback poll
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
        // Si SSE tombe, bascule poll jusqu'à prochain essai
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
        'flex h-[min(28rem,70vh)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <MessageCircle className="h-4 w-4" style={{ color: 'var(--st-primary)' }} />
        <p className="text-sm font-semibold text-slate-800">Chat en direct</p>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
          {liveMode === 'sse' ? 'Temps réel' : 'Actualisation'}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Soyez le premier à écrire dans le chat.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-semibold text-slate-800">{m.authorName}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="text-[11px] text-slate-400">
                {new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <p className="mt-0.5 break-words text-slate-600">{m.body}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="space-y-2 border-t border-slate-100 p-3">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}
        <Input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Votre pseudo"
          maxLength={32}
          className="h-9"
          required
        />
        <div className="flex gap-2">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Votre message…"
            maxLength={280}
            className="h-9"
            required
          />
          <Button
            type="submit"
            size="sm"
            disabled={isSending}
            className="shrink-0 text-white"
            style={{ backgroundColor: 'var(--st-primary)' }}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
