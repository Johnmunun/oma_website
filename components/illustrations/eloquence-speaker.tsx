"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

const ELOQUENCE_GIF = "/illustrations/eloquence-speaker.gif"

type EloquenceSpeakerIllustrationProps = {
  className?: string
  /** true si le GIF est dans public/illustrations/eloquence-speaker.gif */
  useGif?: boolean
}

function SoundWave({ x, delay }: { x: number; delay: string }) {
  return (
    <path
      d={`M${x} 118 Q ${x + 14} 108, ${x + 28} 118 T ${x + 56} 118`}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      className="eloquence-sound-wave text-gold/50"
      style={{ animationDelay: delay }}
    />
  )
}

function SpeakerSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("eloquence-speaker-float w-full h-auto max-w-[320px] sm:max-w-[380px] md:max-w-[420px]", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="elo-body" x1="120" y1="80" x2="280" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="0.45" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="elo-suit" x1="100" y1="180" x2="320" y2="360" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1c1917" />
          <stop offset="1" stopColor="#44403c" />
        </linearGradient>
        <linearGradient id="elo-mic" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#78716c" />
          <stop offset="1" stopColor="#292524" />
        </linearGradient>
        <radialGradient id="elo-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(210 120) rotate(90) scale(100)">
          <stop stopColor="#fbbf24" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <filter id="elo-shadow" x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#78350f" floodOpacity="0.2" />
        </filter>
      </defs>

      <ellipse cx="210" cy="392" rx="120" ry="14" fill="#78350f" fillOpacity="0.1" />

      <circle cx="210" cy="130" r="95" fill="url(#elo-glow)" className="eloquence-glow-pulse" />

      <g filter="url(#elo-shadow)">
        {/* Podium */}
        <path d="M88 318h244l-16 52H104l-16-52z" fill="#44403c" />
        <path d="M96 318h228v8H96v-8z" fill="#57534e" />
        <rect x="118" y="278" width="184" height="40" rx="6" fill="url(#elo-suit)" />
        <path d="M118 278h184v6H118v-6z" fill="#292524" fillOpacity="0.5" />

        {/* Body / suit */}
        <ellipse cx="210" cy="248" rx="52" ry="62" fill="url(#elo-suit)" />
        <path d="M168 248c-6 28-4 56 8 72M252 248c6 28 4 56-8 72" stroke="#57534e" strokeWidth="12" strokeLinecap="round" />

        {/* Head */}
        <circle cx="210" cy="148" r="44" fill="url(#elo-body)" />
        <circle cx="210" cy="148" r="44" fill="#fb923c" fillOpacity="0.12" />

        <ellipse cx="196" cy="142" rx="5" ry="6" fill="#422006" />
        <ellipse cx="224" cy="142" rx="5" ry="6" fill="#422006" />
        <path d="M198 158c8 6 18 6 26 0" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />

        {/* Speaking mouth */}
        <ellipse
          cx="210"
          cy="162"
          rx="10"
          ry="7"
          fill="#78350f"
          fillOpacity="0.55"
          className="eloquence-mouth-pulse"
        />

        {/* Arm + microphone */}
        <g className="eloquence-mic-arm origin-[248px_220px]">
          <path d="M248 220c28-8 48-28 56-52" stroke="#44403c" strokeWidth="14" strokeLinecap="round" />
          <path d="M248 220c28-8 48-28 56-52" stroke="#57534e" strokeWidth="10" strokeLinecap="round" />

          <g transform="translate(296 156)">
            <rect x="-8" y="24" width="16" height="36" rx="4" fill="url(#elo-mic)" />
            <ellipse cx="0" cy="24" rx="18" ry="22" fill="url(#elo-mic)" stroke="#a8a29e" strokeWidth="2" />
            <path d="M-22 24h44" stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round" />
            <rect x="-3" y="58" width="6" height="20" rx="2" fill="#292524" />
            <ellipse cx="0" cy="82" rx="14" ry="4" fill="#1c1917" />
          </g>
        </g>

        {/* Tie */}
        <path d="M210 188l-8 36h16l-8-36z" fill="#b45309" />
      </g>

      {/* Sound waves — éloquence */}
      <g className="text-gold">
        <SoundWave x="48" delay="0s" />
        <SoundWave x="68" delay="0.35s" />
        <SoundWave x="288" delay="0.15s" />
        <SoundWave x="308" delay="0.5s" />
      </g>

      {/* Sparkle accents */}
      <circle cx="92" cy="96" r="3" className="fill-gold/60 eloquence-sparkle" style={{ animationDelay: "0s" }} />
      <circle cx="328" cy="88" r="2.5" className="fill-gold/50 eloquence-sparkle" style={{ animationDelay: "0.6s" }} />
      <circle cx="340" cy="200" r="2" className="fill-gold/40 eloquence-sparkle" style={{ animationDelay: "1.1s" }} />
    </svg>
  )
}

export function EloquenceSpeakerIllustration({
  className,
  useGif = false,
}: EloquenceSpeakerIllustrationProps) {
  if (useGif) {
    return (
      <div
        className={cn(
          "relative mx-auto eloquence-speaker-float aspect-square w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px]",
          className
        )}
      >
        <Image
          src={ELOQUENCE_GIF}
          alt=""
          fill
          unoptimized
          className="object-contain drop-shadow-xl"
          sizes="(max-width: 768px) 320px, 420px"
        />
      </div>
    )
  }

  return <SpeakerSvg className={className} />
}
