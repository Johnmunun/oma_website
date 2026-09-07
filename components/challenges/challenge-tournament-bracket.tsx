'use client'

import { useMemo, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { downloadBracketPdf } from '@/lib/challenges/export-bracket-pdf'
import { useDynamicLogo } from '@/components/theming/dynamic-logo'
import { toast } from 'sonner'

export type BracketCandidate = {
  id: string
  fullName: string
  candidateCode?: string | null
  number?: number | null
}

export type BracketRound = {
  id: string
  name: string
  status?: 'DRAFT' | 'ACTIVE' | 'CLOSED' | string
  isActive?: boolean
  candidates: BracketCandidate[]
}

interface ChallengeTournamentBracketProps {
  rounds: BracketRound[]
  title?: string
  subtitle?: string
  /** dark = stadium look (public), light = admin */
  variant?: 'dark' | 'light'
  className?: string
  emptyHint?: string
  /** Affiche le bouton Export PDF */
  enablePdfExport?: boolean
  /** Logo optionnel (sinon logo du site) */
  logoUrl?: string | null
  logoAlt?: string
}

function statusLabel(status?: string) {
  if (status === 'ACTIVE') return 'En cours'
  if (status === 'CLOSED') return 'Terminé'
  if (status === 'DRAFT') return 'À venir'
  return null
}

export function ChallengeTournamentBracket({
  rounds,
  title = 'Tableau du tournoi',
  subtitle,
  variant = 'dark',
  className,
  emptyHint = 'Ajoutez des tours et assignez des candidats pour afficher le tableau.',
  enablePdfExport = true,
  logoUrl: logoUrlProp,
  logoAlt = 'Logo',
}: ChallengeTournamentBracketProps) {
  const isDark = variant === 'dark'
  const sorted = [...rounds]
  const [exporting, setExporting] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const siteLogo = useDynamicLogo()
  const logoSrc = (logoUrlProp?.trim() || siteLogo || '').trim() || null

  const summary = useMemo(() => {
    const uniqueIds = new Set<string>()
    for (const round of rounds) {
      for (const c of round.candidates) {
        if (c.id) uniqueIds.add(c.id)
      }
    }
    const activeRound = rounds.find((r) => r.isActive)
    const closedCount = rounds.filter((r) => r.status === 'CLOSED').length
    return {
      tours: rounds.length,
      talents: uniqueIds.size,
      activeName: activeRound?.name ?? null,
      closedCount,
    }
  }, [rounds])

  const handleExportPdf = async () => {
    try {
      setExporting(true)
      await downloadBracketPdf({
        title,
        subtitle,
        rounds: sorted,
        challengeName: title,
        logoUrl: logoSrc,
        summary: {
          tours: summary.tours,
          talents: summary.talents,
          activeName: summary.activeName,
        },
      })
      toast.success('PDF téléchargé')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export PDF impossible')
    } finally {
      setExporting(false)
    }
  }

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border px-5 py-10 text-center text-sm',
          isDark
            ? 'border-white/10 bg-[#0b1f14] text-white/55'
            : 'border-border/60 bg-muted/30 text-muted-foreground',
          className
        )}
      >
        {emptyHint}
      </div>
    )
  }

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border',
        isDark
          ? 'border-emerald-900/40 bg-[radial-gradient(ellipse_at_top,_#143d28_0%,_#0a1a12_55%,_#07140e_100%)] text-white'
          : 'border-border/60 bg-gradient-to-b from-muted/40 to-background',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-end justify-between gap-3 border-b px-4 py-4 sm:px-5',
          isDark ? 'border-white/10' : 'border-border/50'
        )}
      >
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {logoSrc && !logoFailed ? (
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border sm:h-14 sm:w-14',
                isDark
                  ? 'border-white/15 bg-white/95 shadow-[0_0_24px_rgba(16,185,129,0.15)]'
                  : 'border-border/60 bg-white shadow-sm'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-full w-full object-contain p-1.5"
                onError={() => setLogoFailed(true)}
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <p
              className={cn(
                'text-[10px] font-bold uppercase tracking-[0.22em]',
                isDark ? 'text-emerald-300/80' : 'text-muted-foreground'
              )}
            >
              Tableau du tournoi
            </p>
            <h2
              className={cn(
                'mt-1 font-serif text-xl font-bold tracking-tight sm:text-2xl',
                isDark ? 'text-white' : 'text-foreground'
              )}
            >
              {title}
            </h2>
            {subtitle && (
              <p className={cn('mt-1 text-xs', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sorted.map((round) => (
            <span
              key={`legend-${round.id}`}
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
                round.isActive
                  ? isDark
                    ? 'bg-amber-400 text-black'
                    : 'bg-gold text-black'
                  : isDark
                    ? 'bg-white/10 text-white/70'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {round.name}
            </span>
          ))}
          {enablePdfExport && (
            <Button
              type="button"
              size="sm"
              variant={isDark ? 'secondary' : 'outline'}
              className={cn(
                'h-8 gap-1.5 text-xs',
                isDark && 'bg-white/10 text-white hover:bg-white/15 hover:text-white'
              )}
              disabled={exporting}
              onClick={handleExportPdf}
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Export PDF
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-2 gap-2 border-b px-4 py-3 sm:grid-cols-4 sm:px-5',
          isDark ? 'border-white/10 bg-black/20' : 'border-border/50 bg-muted/20'
        )}
      >
        {[
          { label: 'Tours', value: String(summary.tours) },
          { label: 'Talents', value: String(summary.talents) },
          {
            label: 'Tour actif',
            value: summary.activeName || '—',
          },
          {
            label: 'Terminés',
            value: String(summary.closedCount),
          },
        ].map((item) => (
          <div key={item.label} className="min-w-0">
            <p
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                isDark ? 'text-white/40' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </p>
            <p
              className={cn(
                'mt-0.5 truncate text-sm font-semibold',
                isDark ? 'text-white' : 'text-foreground'
              )}
              title={item.value}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div
          className="flex min-w-max items-stretch gap-0 px-4 py-6 sm:px-6"
          style={{ minHeight: 280 }}
        >
          {sorted.map((round, roundIndex) => {
            const isLast = roundIndex === sorted.length - 1
            const slots =
              round.candidates.length > 0
                ? round.candidates
                : Array.from({ length: Math.max(2, 4 - roundIndex) }, (_, i) => ({
                    id: `empty-${round.id}-${i}`,
                    fullName: '—',
                    candidateCode: null,
                    number: null,
                    empty: true as const,
                  }))

            // Pair into match boxes
            const pairs: Array<Array<(typeof slots)[number] & { empty?: boolean }>> = []
            for (let i = 0; i < slots.length; i += 2) {
              pairs.push(slots.slice(i, i + 2) as Array<(typeof slots)[number] & { empty?: boolean }>)
            }
            if (pairs.length === 0) {
              pairs.push([
                { id: `ph-${round.id}`, fullName: '—', empty: true },
                { id: `ph2-${round.id}`, fullName: '—', empty: true },
              ])
            }

            return (
              <div key={round.id} className="flex items-stretch">
                <div className="flex w-[11.5rem] flex-col sm:w-[13rem]">
                  <div className="mb-4 text-center">
                    <p
                      className={cn(
                        'text-xs font-bold uppercase tracking-wider',
                        round.isActive
                          ? isDark
                            ? 'text-amber-300'
                            : 'text-gold-text'
                          : isDark
                            ? 'text-white/70'
                            : 'text-foreground'
                      )}
                    >
                      {round.name}
                    </p>
                    <p
                      className={cn(
                        'mt-0.5 text-[10px]',
                        isDark ? 'text-white/40' : 'text-muted-foreground'
                      )}
                    >
                      {statusLabel(round.status) ||
                        `${round.candidates.length} talent${round.candidates.length !== 1 ? 's' : ''}`}
                      {round.isActive ? ' · actif' : ''}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col justify-around gap-4">
                    {pairs.map((pair, pairIndex) => (
                      <div key={`${round.id}-pair-${pairIndex}`} className="relative">
                        <div
                          className={cn(
                            'overflow-hidden rounded-lg border shadow-sm',
                            round.isActive
                              ? isDark
                                ? 'border-amber-400/50 bg-black/35 ring-1 ring-amber-400/30'
                                : 'border-gold/50 bg-white ring-1 ring-gold/25'
                              : isDark
                                ? 'border-white/10 bg-black/25'
                                : 'border-border/70 bg-white'
                          )}
                        >
                          {pair.map((slot, slotIndex) => {
                            const empty = 'empty' in slot && slot.empty
                            return (
                              <div
                                key={slot.id}
                                className={cn(
                                  'flex items-center gap-2 px-2.5 py-2',
                                  slotIndex === 0 &&
                                    pair.length > 1 &&
                                    (isDark ? 'border-b border-white/10' : 'border-b border-border/60')
                                )}
                              >
                                <span
                                  className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold',
                                    empty
                                      ? isDark
                                        ? 'bg-white/5 text-white/25'
                                        : 'bg-muted text-muted-foreground/50'
                                      : isDark
                                        ? 'bg-emerald-500/20 text-emerald-200'
                                        : 'bg-primary/10 text-primary'
                                  )}
                                >
                                  {empty
                                    ? '·'
                                    : slot.number != null
                                      ? slot.number
                                      : slot.candidateCode?.replace(/\D/g, '').slice(-2) ||
                                        slot.fullName.slice(0, 1).toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={cn(
                                      'truncate text-xs font-semibold',
                                      empty
                                        ? isDark
                                          ? 'text-white/25'
                                          : 'text-muted-foreground/50'
                                        : isDark
                                          ? 'text-white'
                                          : 'text-foreground'
                                    )}
                                  >
                                    {slot.fullName}
                                  </p>
                                  {!empty && slot.candidateCode && (
                                    <p
                                      className={cn(
                                        'truncate font-mono text-[10px]',
                                        isDark ? 'text-white/40' : 'text-muted-foreground'
                                      )}
                                    >
                                      {slot.candidateCode}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Connector stub to next round */}
                        {!isLast && (
                          <div
                            className={cn(
                              'pointer-events-none absolute top-1/2 -right-3 h-px w-3',
                              isDark ? 'bg-white/25' : 'bg-border'
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vertical connector column between rounds */}
                {!isLast && (
                  <div className="relative mx-1 flex w-6 items-center sm:mx-2 sm:w-8">
                    <div
                      className={cn(
                        'absolute inset-y-[18%] left-1/2 w-px -translate-x-1/2',
                        isDark ? 'bg-white/20' : 'bg-border'
                      )}
                    />
                    <div
                      className={cn(
                        'absolute top-1/2 right-0 h-px w-1/2',
                        isDark ? 'bg-white/20' : 'bg-border'
                      )}
                    />
                    <div
                      className={cn(
                        'absolute top-1/2 left-0 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold',
                        isDark
                          ? 'bg-emerald-800/80 text-emerald-100 ring-1 ring-white/15'
                          : 'bg-muted text-muted-foreground ring-1 ring-border'
                      )}
                    >
                      →
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div
        className={cn(
          'border-t px-4 py-3 text-[11px] sm:px-5',
          isDark ? 'border-white/10 text-white/40' : 'border-border/50 text-muted-foreground'
        )}
      >
        Les talents avancent de tour en tour. Le tour surligné est celui en cours (votes &
        classement).
      </div>
    </section>
  )
}
