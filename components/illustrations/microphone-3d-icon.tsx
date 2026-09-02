import { cn } from '@/lib/utils'

type Microphone3dIconProps = {
  className?: string
}

/** Microphone stylisé 3D pour la bande d'annonce hero */
export function Microphone3dIcon({ className }: Microphone3dIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-9 w-9 shrink-0 drop-shadow-md', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="mic3d-body" x1="14" y1="8" x2="34" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a8a29e" />
          <stop offset="0.45" stopColor="#57534e" />
          <stop offset="1" stopColor="#292524" />
        </linearGradient>
        <linearGradient id="mic3d-grille" x1="18" y1="10" x2="30" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#44403c" />
          <stop offset="1" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id="mic3d-stem" x1="22" y1="26" x2="26" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#78716c" />
          <stop offset="1" stopColor="#44403c" />
        </linearGradient>
        <linearGradient id="mic3d-base" x1="14" y1="36" x2="34" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d6d3d1" />
          <stop offset="0.5" stopColor="#a8a29e" />
          <stop offset="1" stopColor="#78716c" />
        </linearGradient>
        <filter id="mic3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <ellipse cx="24" cy="42" rx="14" ry="3" fill="#000" opacity="0.15" />
      <g filter="url(#mic3d-shadow)">
        <rect x="15" y="38" width="18" height="4" rx="2" fill="url(#mic3d-base)" />
        <rect x="22" y="26" width="4" height="13" rx="1.5" fill="url(#mic3d-stem)" />
        <rect x="17" y="8" width="14" height="20" rx="7" fill="url(#mic3d-body)" />
        <rect x="19" y="10" width="10" height="14" rx="5" fill="url(#mic3d-grille)" />
        <path
          d="M20 14h8M20 17h8M20 20h8"
          stroke="#78716c"
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.6"
        />
        <ellipse cx="24" cy="8.5" rx="5" ry="2" fill="#fff" opacity="0.22" />
      </g>
    </svg>
  )
}
