'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { Building2 } from 'lucide-react'
import {
  resolvePublicImageUrl,
  type StructureLogoSize,
} from '@/lib/media/resolve-public-image-url'
import { cn } from '@/lib/utils'

export interface StructureLogoProps {
  src: string | null | undefined
  alt: string
  size?: StructureLogoSize
  className?: string
  style?: CSSProperties
  /** Chargement immédiat (pile de logos visible) */
  priority?: boolean
}

const DIM: Record<StructureLogoSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
}

const ICON: Record<StructureLogoSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export function StructureLogo({
  src,
  alt,
  size = 'md',
  className,
  style,
  priority = false,
}: StructureLogoProps) {
  const [failed, setFailed] = useState(false)
  const [useRawUrl, setUseRawUrl] = useState(false)

  const optimizedSrc = resolvePublicImageUrl(src, size)
  const rawSrc = src?.trim() || null
  const displaySrc = useRawUrl ? rawSrc : optimizedSrc

  useEffect(() => {
    setFailed(false)
    setUseRawUrl(false)
  }, [src])

  return (
    <div
      style={style}
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full border border-border/60 bg-white shadow-sm',
        DIM[size],
        className
      )}
    >
      {displaySrc && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={displaySrc}
          src={displaySrc}
          alt={alt}
          className="h-full w-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            if (!useRawUrl && rawSrc && optimizedSrc !== rawSrc) {
              setUseRawUrl(true)
              return
            }
            setFailed(true)
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/30">
          <Building2 className={cn('text-muted-foreground/50', ICON[size])} />
        </div>
      )}
    </div>
  )
}
