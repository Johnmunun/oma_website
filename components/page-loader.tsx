// Composant loader pour les transitions de page
"use client"

import { useEffect, useState } from "react"

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Afficher le loader après un court délai
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gold/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold border-r-gold animate-spin" />
        </div>
        {/* Texte de chargement supprimé pour éviter tout flash visuel */}
      </div>
    </div>
  )
}
