"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

const GIF_LEFT = "/illustrations/expertise-guide-left.gif"
const GIF_RIGHT = "/illustrations/expertise-guide-right.gif"

type GuideSide = "left" | "right"

type ExpertiseGuideProps = {
  side: GuideSide
  className?: string
  /** Mettre true si les GIF sont présents dans /public/illustrations/ */
  useGif?: boolean
}

function PointingArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("expertise-guide-arrow w-10 md:w-12", className)}
      aria-hidden
    >
      <path
        d="M24 4v88"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 8"
        className="text-gold/55"
      />
      <path
        d="M12 84l12 14 12-14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gold"
      />
    </svg>
  )
}

function GuideMascotSvg({ side }: { side: GuideSide }) {
  const mirror = side === "right"

  return (
    <svg
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "expertise-guide-mascot expertise-guide-float h-36 w-28 md:h-44 md:w-32 lg:h-52 lg:w-36",
        mirror && "scale-x-[-1]"
      )}
      aria-hidden
    >
      <defs>
        <linearGradient id={`body-${side}`} x1="40" y1="30" x2="120" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`head-${side}`} x1="55" y1="18" x2="105" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <radialGradient id={`cheek-${side}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(88 52) rotate(90) scale(12)">
          <stop stopColor="#fb923c" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <filter id={`shadow-${side}`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#78350f" floodOpacity="0.18" />
        </filter>
      </defs>

      <ellipse cx="80" cy="206" rx="42" ry="8" fill="#78350f" fillOpacity="0.12" />

      <g filter={`url(#shadow-${side})`}>
        <ellipse cx="80" cy="118" rx="34" ry="44" fill={`url(#body-${side})`} />
        <circle cx="80" cy="52" r="28" fill={`url(#head-${side})`} />
        <circle cx="80" cy="52" r="28" fill={`url(#cheek-${side})`} />

        <circle cx="70" cy="48" r="3.5" fill="#422006" />
        <circle cx="90" cy="48" r="3.5" fill="#422006" />
        <path d="M72 58c6 5 14 5 20 0" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />

        <path
          d="M44 96c-8 18-6 38 8 52"
          stroke="#f59e0b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M116 96c10 14 12 34 4 52"
          stroke="#f59e0b"
          strokeWidth="14"
          strokeLinecap="round"
        />

        <g className="expertise-guide-arm origin-[116px_96px]">
          <path
            d="M116 96c18 8 28 24 30 44"
            stroke="#ea580c"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <circle cx="146" cy="142" r="10" fill="#fde68a" stroke="#ea580c" strokeWidth="2" />
          <path d="M142 148l8 10" stroke="#422006" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M150 148l-8 10" stroke="#422006" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}

export function ExpertiseGuideMascot({ side, className, useGif = false }: ExpertiseGuideProps) {
  const src = side === "left" ? GIF_LEFT : GIF_RIGHT

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 text-gold",
        side === "left" ? "items-end md:items-center" : "items-start md:items-center",
        className
      )}
    >
      {useGif ? (
        <div className="relative h-36 w-28 md:h-44 md:w-32 lg:h-52 lg:w-36 expertise-guide-float">
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            className={cn("object-contain drop-shadow-lg", side === "right" && "scale-x-[-1]")}
          />
        </div>
      ) : (
        <GuideMascotSvg side={side} />
      )}
      <PointingArrow />
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-text/80 md:text-xs">
        Voir ci-dessous
      </span>
    </div>
  )
}
