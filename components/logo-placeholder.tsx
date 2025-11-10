/**
 * Composant pour afficher le logo
 * Le logo peut être changé via le CMS
 */

import Image from "next/image"

interface LogoProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function LogoPlaceholder({ src, alt, width = 40, height = 40, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {src && src.startsWith("/") ? (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          priority
          className="object-contain"
        />
      ) : (
        // Placeholder si le logo n'est pas disponible
        <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">OMA</span>
        </div>
      )}
    </div>
  )
}
