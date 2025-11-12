"use client"

import { useEffect, useRef, useState, ReactNode } from 'react'

interface AnimateOnScrollProps {
  children: ReactNode
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade'
  delay?: number
  threshold?: number
  className?: string
  once?: boolean // Si true, l'animation ne se déclenche qu'une fois
}

/**
 * Composant pour animer les éléments lorsqu'ils entrent dans le viewport
 * Utilise Intersection Observer pour détecter la visibilité
 */
export function AnimateOnScroll({
  children,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
  className = '',
  once = true,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Vérifier si l'animation a déjà été déclenchée (pour once = true)
    if (once && isVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Délai optionnel avant d'activer l'animation
            setTimeout(() => {
              setIsVisible(true)
              if (once) {
                observer.unobserve(entry.target)
              }
            }, delay)
          } else if (!once) {
            // Si once = false, on peut réanimer quand l'élément sort du viewport
            setIsVisible(false)
          }
        })
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Déclenche un peu avant que l'élément soit complètement visible
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [delay, threshold, once, isVisible])

  // Déterminer la classe d'animation
  const getAnimationClass = () => {
    const baseClass = `animate-on-scroll-${animation}`
    return isVisible ? `${baseClass} animate-in` : baseClass
  }

  return (
    <div ref={elementRef} className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  )
}

