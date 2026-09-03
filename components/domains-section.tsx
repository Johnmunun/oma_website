"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"
import { SectionDotsPattern } from "@/components/illustrations/landing-vectors"
import { ExpertiseGuideMascot } from "@/components/illustrations/expertise-guide-mascots"
import { StructureLogo } from "@/components/structure-logo"
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { resolveExpertiseIcon } from "@/lib/expertise/domain-icons"
import { cn } from "@/lib/utils"
import type { StructureLogoSize } from "@/lib/media/resolve-public-image-url"

const PARTNER_STACK_VISIBLE = 6

interface ExpertisePartner {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  href: string
}

interface ExpertiseDomain {
  id: string
  name: string
  slug: string
  description: string | null
  iconKey: string
  structures: ExpertisePartner[]
}

function PartnerLogo({
  partner,
  className,
  size = "md",
  style,
  priority = false,
}: {
  partner: ExpertisePartner
  className?: string
  size?: StructureLogoSize
  style?: CSSProperties
  priority?: boolean
}) {
  return (
    <StructureLogo
      src={partner.logoUrl}
      alt={partner.name}
      size={size}
      className={className}
      style={style}
      priority={priority}
    />
  )
}

function PartnersPopover({
  partners,
  domainName,
}: {
  partners: ExpertisePartner[]
  domainName: string
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  const visible = partners.slice(0, PARTNER_STACK_VISIBLE)
  const remaining = partners.length - visible.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group/stack mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 text-left shadow-sm transition-all hover:border-gold/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          aria-label={`${partners.length} partenaire${partners.length > 1 ? "s" : ""}`}
          onMouseEnter={() => {
            clearCloseTimer()
            setOpen(true)
          }}
          onMouseLeave={scheduleClose}
        >
          <div className="flex min-w-0 items-center">
            <div className="flex items-center pl-0.5">
              {visible.map((partner, index) => (
                <PartnerLogo
                  key={partner.id}
                  partner={partner}
                  priority
                  className="-ml-2.5 first:ml-0 ring-2 ring-background transition-transform group-hover/stack:-translate-y-0.5"
                  style={{ zIndex: visible.length - index }}
                />
              ))}
              {remaining > 0 && (
                <div
                  className="-ml-2.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background"
                  style={{ zIndex: 0 }}
                >
                  +{remaining}
                </div>
              )}
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground group-hover/stack:text-gold-text">
            Voir
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={12}
        className="relative w-[min(100vw-2rem,22rem)] border-0 bg-transparent p-0 shadow-none"
        onMouseEnter={clearCloseTimer}
        onMouseLeave={scheduleClose}
      >
        <PopoverArrow side="top" className="left-10" />
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-popover shadow-xl">
          <div className="border-b border-border/60 bg-gradient-to-r from-gold/10 via-background to-background px-4 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-text">
              {domainName}
            </p>
            <p className="mt-0.5 font-serif text-base font-semibold text-foreground">
              Structures partenaires
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {partners.length} partenaire{partners.length > 1 ? "s" : ""} · cliquez pour visiter
            </p>
          </div>

          <ul className="max-h-72 overflow-y-auto overscroll-contain bg-popover p-1.5">
            {partners.map((partner) => (
              <li key={partner.id}>
                <Link
                  href={partner.href}
                  className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/70"
                >
                  <PartnerLogo partner={partner} size="lg" className="border-border/80" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground group-hover/item:text-gold-text">
                      {partner.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">Visiter la page</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:text-gold-text" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DomainCard({ domain, index }: { domain: ExpertiseDomain; index: number }) {
  const Icon = resolveExpertiseIcon(domain.iconKey)

  return (
    <AnimateOnScroll animation="fade-up" delay={80 + index * 50}>
      <article
        className={cn(
          "group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5",
          "transition-all duration-300 hover:border-gold/35 hover:shadow-soft-lg"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 transition-colors group-hover:bg-gold/15">
            <Icon className="h-5 w-5 text-gold-text" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg font-bold leading-tight text-foreground">
              {domain.name}
            </h3>
            {domain.description && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {domain.description}
              </p>
            )}
          </div>
        </div>

        {domain.structures.length > 0 ? (
          <PartnersPopover partners={domain.structures} domainName={domain.name} />
        ) : (
          <p className="mt-4 text-xs text-muted-foreground/80">Aucun partenaire pour le moment</p>
        )}
      </article>
    </AnimateOnScroll>
  )
}

export function DomainsSection() {
  const [domains, setDomains] = useState<ExpertiseDomain[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/expertise")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setDomains(res.data)
      })
      .catch((err) => console.error("[DomainsSection]", err))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section id="expertise" className="relative overflow-hidden bg-muted/20 py-16 md:py-20">
      <SectionDotsPattern className="opacity-[0.12]" />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        aria-hidden
      />

      <div className="container relative mx-auto px-4">
        <AnimateOnScroll animation="fade-up" delay={80}>
          <div className="relative mx-auto mb-10 max-w-5xl md:mb-12">
            <ExpertiseGuideMascot
              side="left"
              className="absolute -left-2 top-0 z-10 hidden sm:flex md:-left-4 lg:-left-2 xl:left-0"
            />
            <ExpertiseGuideMascot
              side="right"
              className="absolute -right-2 top-0 z-10 hidden sm:flex md:-right-4 lg:-right-2 xl:right-0"
            />

            <div className="relative z-20 mx-auto max-w-2xl px-2 text-center sm:px-16 md:px-24 lg:px-32">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-text">
                Expertise
              </p>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Nos domaines d&apos;expertise
              </h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                Une approche complète pour développer vos compétences — avec les structures
                partenaires du réseau OMA.
              </p>
            </div>
          </div>
        </AnimateOnScroll>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-border/50 bg-card/50"
              />
            ))}
          </div>
        ) : domains.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Les domaines d&apos;expertise seront bientôt disponibles.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain, index) => (
              <DomainCard key={domain.id} domain={domain} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
