/**
 * Emojis de réaction live — safe client/server
 */

export const LIVE_REACTION_EMOJIS = [
  '❤️',
  '🔥',
  '👏',
  '😂',
  '😮',
  '🎉',
  '💯',
  '👍',
  '🙌',
  '💖',
] as const

export type LiveReactionEmoji = (typeof LIVE_REACTION_EMOJIS)[number]
