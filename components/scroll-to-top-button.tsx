'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 300
      setIsVisible(shouldShow)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Revenir en haut"
      className={[
        'fixed bottom-28 right-6 z-50',
        'rounded-full shadow-lg hover:shadow-xl',
        'bg-primary text-primary-foreground',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-ring/50',
        'p-3 md:p-3.5',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
      ].join(' ')}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}


