/**
 * SSE chat live — flux quasi temps réel (reconnect client ~25s)
 */

import { LiveChatError, listPublicLiveChatMessages } from '@/lib/challenges/live-chat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  const { slug, challengeSlug } = await params
  const url = new URL(request.url)
  let after = url.searchParams.get('after')
  const encoder = new TextEncoder()
  const started = Date.now()
  const deadlineMs = 25_000

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      try {
        send('ready', { ok: true })

        while (Date.now() - started < deadlineMs) {
          if (request.signal.aborted) break

          try {
            const messages = await listPublicLiveChatMessages(slug, challengeSlug, after)
            if (messages.length > 0) {
              send('messages', messages)
              after = messages[messages.length - 1].createdAt
            } else {
              send('ping', { t: Date.now() })
            }
          } catch (error) {
            if (error instanceof LiveChatError) {
              send('chat-error', { message: error.message, status: error.statusCode })
              break
            }
            console.error('[SSE] live chat:', error)
            send('chat-error', { message: 'Erreur chat' })
            break
          }

          await sleep(1500)
        }

        send('done', { reconnect: true })
      } catch (error) {
        console.error('[SSE] live chat stream:', error)
      } finally {
        try {
          controller.close()
        } catch {
          // ignore
        }
      }
    },
    cancel() {
      // client disconnected
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
