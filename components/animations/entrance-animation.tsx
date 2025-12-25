"use client"

import { ReactNode } from 'react'

interface EntranceAnimationProps {
  children: ReactNode
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'rotate'
  delay?: number
  className?: string
}

/**
 * Composant pour les animations d'entrée immédiate (sans scroll)
 * L'animation se déclenche dès le montage du composant
 */
export function EntranceAnimation({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: EntranceAnimationProps) {
  const animationClass = `animate-entrance-${animation}`

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {}

  return (
    <div className={`${animationClass} ${className}`} style={style}>
      {children}
    </div>
  )
}


