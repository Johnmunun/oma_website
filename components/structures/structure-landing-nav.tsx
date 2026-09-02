'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { StructureLogo } from '@/components/structure-logo'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#apropos', label: 'À propos' },
  { href: '#services', label: 'Services' },
  { href: '#projets', label: 'Projets' },
] as const

interface StructureLandingNavProps {
  name: string
  logoUrl: string | null
  registrationPath?: string | null
}

export function StructureLandingNav({
  name,
  logoUrl,
  registrationPath,
}: StructureLandingNavProps) {
  const [open, setOpen] = useState(false)
  const navItems = registrationPath
    ? [...NAV, { href: registrationPath, label: 'Inscription', external: false as const }]
    : [...NAV]

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <a href="#accueil" className="flex min-w-0 items-center gap-3">
          <StructureLogo
            src={logoUrl}
            alt={name}
            size="md"
            priority
            className="h-11 w-11 shadow-md ring-2 ring-[var(--st-primary-soft)]"
          />
          <span className="truncate font-serif text-xl font-bold tracking-tight text-slate-900">
            {name}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--st-primary-dark)]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-full bg-gradient-to-r from-[var(--st-primary-dark)] to-[var(--st-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--st-primary-rgb),0.3)] transition hover:opacity-95"
          >
            Nous contacter
          </a>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          'border-t border-border/40 bg-white md:hidden',
          open ? 'block' : 'hidden'
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[var(--st-primary-soft)] hover:text-[var(--st-primary-dark)]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-2 rounded-lg bg-gradient-to-r from-[var(--st-primary-dark)] to-[var(--st-primary)] px-3 py-2.5 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Nous contacter
          </a>
        </nav>
      </div>
    </header>
  )
}
