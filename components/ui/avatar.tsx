"use client"

import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-24 h-24 text-xl",
}

export function Avatar({ src, alt, name, className, size = "md" }: AvatarProps) {
  const sizeClass = sizeClasses[size]
  
  // Générer les initiales à partir du nom
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={cn("rounded-full object-cover", sizeClass, className)}
      />
    )
  }

  // Avatar par défaut avec initiales ou icône
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center text-gold font-semibold border-2 border-gold/30",
        sizeClass,
        className
      )}
    >
      {name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <User className={cn("text-gold", size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : size === "lg" ? "w-8 h-8" : "w-12 h-12")} />
      )}
    </div>
  )
}
