"use client"

/**
 * @file components/html-content.tsx
 * @description Composant pour afficher du contenu HTML de manière sécurisée
 * Utilisé pour afficher les descriptions d'événements formatées avec Tiptap
 */

import { cn } from '@/lib/utils'

interface HtmlContentProps {
  content: string | null | undefined
  className?: string
}

export function HtmlContent({ content, className }: HtmlContentProps) {
  if (!content) {
    return null
  }

  return (
    <div
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Styles pour le contenu formaté
        lineHeight: '1.6',
      }}
    />
  )
}

