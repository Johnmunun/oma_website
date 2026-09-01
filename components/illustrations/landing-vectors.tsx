"use client"

import type { ReactNode } from "react"
import { useId } from "react"
import { cn } from "@/lib/utils"

type VectorProps = {
  className?: string
}

/** Décorations latérales du hero — micro, onde sonore, podium */
export function HeroVectorLeft({ className }: VectorProps) {
  return (
    <svg
      viewBox="0 0 200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden
    >
      <circle cx="40" cy="60" r="80" className="fill-gold/5" />
      <path
        d="M88 120v72c0 14.4 11.6 26 26 26s26-11.6 26-26v-36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-gold/40"
      />
      <rect x="74" y="88" width="52" height="28" rx="14" stroke="currentColor" strokeWidth="2.5" className="text-gold/50" />
      <path d="M114 192v28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gold/35" />
      <path d="M98 220h32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gold/35" />
      <path d="M24 140c16-24 40-36 72-36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold/25" />
      <path d="M16 168c20-28 52-42 92-42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold/20" />
      <path d="M8 196c24-32 60-48 108-48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold/15" />
    </svg>
  )
}

export function HeroVectorRight({ className }: VectorProps) {
  return (
    <svg
      viewBox="0 0 200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden
    >
      <circle cx="160" cy="240" r="70" className="fill-gold/5" />
      <path
        d="M60 80 L140 80 L120 200 L80 200 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="text-gold/30"
      />
      <ellipse cx="100" cy="210" rx="36" ry="8" stroke="currentColor" strokeWidth="1.5" className="text-gold/25" />
      <circle cx="145" cy="95" r="4" className="fill-gold/50" />
      <circle cx="160" cy="115" r="3" className="fill-gold/35" />
      <circle cx="130" cy="120" r="2.5" className="fill-gold/30" />
      <path
        d="M150 60c20 8 32 24 36 48M155 48c28 12 44 32 48 64"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-gold/25"
      />
      <path
        d="M40 250c24-8 48-8 72 0M30 270c32-10 68-10 100 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-gold/20"
      />
    </svg>
  )
}

/** Illustration principale — orateur & audience */
export function AboutIllustration({ className }: VectorProps) {
  return (
    <svg
      viewBox="0 0 480 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-auto max-w-md mx-auto", className)}
      aria-hidden
    >
      <rect x="40" y="300" width="400" height="8" rx="4" className="fill-gold/15" />
      <path d="M120 300V180" stroke="currentColor" strokeWidth="3" className="text-gold/40" />
      <ellipse cx="120" cy="168" rx="28" ry="32" stroke="currentColor" strokeWidth="2.5" className="text-gold" />
      <path d="M92 220c8 24 24 40 28 80M148 220c-8 24-24 40-28 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gold/60" />
      <path d="M148 188c20-8 40-4 56 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gold/50" />
      <path
        d="M200 140c40-20 88-12 120 20 32 32 36 80 16 116"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-gold/25"
      />
      <path
        d="M220 160c28-8 60 0 80 28s20 64 4 92"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-gold/20"
      />
      <circle cx="320" cy="120" r="56" stroke="currentColor" strokeWidth="2" className="text-gold/30" />
      <circle cx="320" cy="120" r="36" stroke="currentColor" strokeWidth="1.5" className="text-gold/20" />
      <path d="M296 120h48M320 96v48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gold/40" />
      <ellipse cx="200" cy="318" rx="12" ry="6" className="fill-gold/20" />
      <ellipse cx="248" cy="322" rx="10" ry="5" className="fill-gold/15" />
      <ellipse cx="288" cy="318" rx="12" ry="6" className="fill-gold/20" />
      <ellipse cx="336" cy="322" rx="10" ry="5" className="fill-gold/15" />
      <ellipse cx="376" cy="318" rx="12" ry="6" className="fill-gold/20" />
      <path d="M60 100c16-24 40-36 72-40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold/20" />
      <path d="M48 128c24-32 60-48 108-52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold/15" />
    </svg>
  )
}

export type DomainVectorVariant = "oratory" | "events" | "media" | "digital" | "training"

export function DomainWatermark({ variant, className }: VectorProps & { variant: DomainVectorVariant }) {
  const paths: Record<DomainVectorVariant, ReactNode> = {
    oratory: (
      <>
        <path d="M60 40v50M45 55h30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M60 90v20M48 110h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 50c8-12 24-18 40-18s32 6 40 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    events: (
      <>
        <rect x="30" y="35" width="60" height="50" rx="6" stroke="currentColor" strokeWidth="2" />
        <path d="M30 50h60M45 35V25M75 35V25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    media: (
      <>
        <path d="M25 45h50l-8 35H33L25 45z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M78 55l20-10v40l-20-10V55z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </>
    ),
    digital: (
      <>
        <rect x="28" y="30" width="44" height="70" rx="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="88" r="4" className="fill-current" />
        <path d="M38 42h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    training: (
      <>
        <path d="M30 40h60l-10 15H40L30 40z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <rect x="35" y="65" width="50" height="30" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M50 65v-10h20v10" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-gold/10 group-hover:text-gold/20 transition-colors duration-300", className)}
      aria-hidden
    >
      {paths[variant]}
    </svg>
  )
}

/** Motif de fond discret pour sections claires */
export function SectionDotsPattern({ className }: VectorProps) {
  const patternId = useId().replace(/:/g, "")

  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      aria-hidden
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="fill-gold/20" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} opacity="0.4" />
    </svg>
  )
}

/** Anneaux décoratifs pour newsletter / CTA */
export function RingsDecoration({ className }: VectorProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden
    >
      <circle cx="150" cy="150" r="120" stroke="currentColor" strokeWidth="1" className="text-gold/15" />
      <circle cx="150" cy="150" r="90" stroke="currentColor" strokeWidth="1" className="text-gold/20" />
      <circle cx="150" cy="150" r="60" stroke="currentColor" strokeWidth="1.5" className="text-gold/25" />
      <circle cx="150" cy="150" r="8" className="fill-gold/40" />
    </svg>
  )
}
