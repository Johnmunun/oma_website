import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Megaphone,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { StructureLandingNav } from '@/components/structures/structure-landing-nav'
import { HeroAnnouncementTicker } from '@/components/hero-announcement-ticker'
import { StructureContactForm } from '@/components/structures/structure-contact-form'
import { StructureFloatingWhatsApp } from '@/components/structures/structure-floating-whatsapp'
import { StructureServicesSection } from '@/components/structures/structure-services-section'
import { StructureLogo } from '@/components/structure-logo'
import type { PublicStructureLanding } from '@/lib/structures/load-public-structure'
import {
  getStructureThemeVars,
  resolveStructureHero,
} from '@/lib/structures/landing-theme'
import { getChallengeRegistrationPath, getMainSiteOrigin } from '@/lib/structures/public-url'

interface StructureLandingViewProps {
  structure: PublicStructureLanding
}

export function StructureLandingView({ structure }: StructureLandingViewProps) {
  const mainSite = getMainSiteOrigin()
  const mainChallenge = structure.challenges[0]
  const hero = resolveStructureHero(structure)
  const contactSlug =
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug
  const themeStyle = getStructureThemeVars(structure.landingThemeColor)
  const registrationPath = mainChallenge
    ? getChallengeRegistrationPath(structure, mainChallenge.slug)
    : null

  const highlights = [
    structure.expertiseDomain?.name ?? 'Expertise dédiée',
    mainChallenge ? 'Challenge actif' : 'Projets éducatifs',
    'Accompagnement personnalisé',
  ]

  return (
    <div
      className="structure-site min-h-screen bg-[#fafafa] text-slate-900 antialiased"
      style={themeStyle}
    >
      <StructureLandingNav
        name={structure.name}
        logoUrl={structure.logoUrl}
        registrationPath={registrationPath}
      />

      <HeroAnnouncementTicker />

      <section id="accueil" className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
        <div
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(var(--st-primary-rgb), 0.22)' }}
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(var(--st-primary-rgb), 0.12)' }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
          <div>
            {structure.expertiseDomain && (
              <span
                className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--st-primary-soft)',
                  color: 'var(--st-primary-dark)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {structure.expertiseDomain.name}
              </span>
            )}
            <h1 className="font-serif text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-[3.25rem]">
              {hero.title}
              <span
                className="mt-1 block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
                }}
              >
                {hero.highlight}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">{hero.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#projets"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
                  boxShadow: '0 10px 30px -8px rgba(var(--st-primary-rgb), 0.45)',
                }}
              >
                Découvrir nos projets
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#apropos"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--st-primary-light)] hover:text-[var(--st-primary-dark)]"
              >
                En savoir plus
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div
              className="absolute inset-0 m-auto h-[85%] w-[85%] rounded-full opacity-90"
              style={{
                backgroundImage:
                  'linear-gradient(to bottom right, var(--st-primary-light), var(--st-primary))',
              }}
            />
            <div className="relative flex aspect-square items-center justify-center p-8">
              <StructureLogo
                src={structure.logoUrl}
                alt={structure.name}
                size="lg"
                priority
                className="h-40 w-40 border-4 border-white shadow-2xl md:h-48 md:w-48"
              />
            </div>

            <div className="absolute -left-2 top-8 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur sm:left-4">
              <p className="text-xs font-medium text-slate-500">Notre mission</p>
              <p className="mt-1 font-serif text-lg font-bold text-slate-900">{structure.name}</p>
            </div>

            <div className="absolute -right-2 bottom-12 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur sm:right-4">
              <p className="text-xs font-medium text-slate-500">Projets</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--st-primary)' }}>
                {structure.challenges.length || '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-6 mx-auto max-w-4xl px-4 md:-mt-10 md:px-6">
        <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-xl shadow-slate-200/50 md:px-10 md:py-6">
          <p className="text-center text-sm font-medium text-slate-600">
            Une structure engagée pour révéler les talents et accompagner la réussite
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 opacity-70 grayscale">
            {highlights.map((label) => (
              <span
                key={label}
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="apropos" className="py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
          <div className="relative mx-auto max-w-sm">
            <div
              className="absolute -inset-3 rounded-full border-2 border-dashed"
              style={{ borderColor: 'var(--st-primary-light)' }}
            />
            <div
              className="relative overflow-hidden rounded-full p-3 shadow-inner"
              style={{
                backgroundImage:
                  'linear-gradient(to bottom right, var(--st-primary-soft), white)',
              }}
            >
              <StructureLogo
                src={structure.logoUrl}
                alt={structure.name}
                size="lg"
                className="mx-auto h-56 w-56 border-4 border-white shadow-lg"
              />
            </div>
            <div
              className="absolute -bottom-2 -right-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-lg"
              style={{ backgroundColor: 'var(--st-primary)' }}
            >
              100% dédié
            </div>
          </div>

          <div>
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'var(--st-primary)' }}
            >
              À propos
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
              Des personnes réelles,
              <br />
              des résultats concrets.
            </h2>
            <p className="mt-6 leading-relaxed text-slate-600">
              {structure.description ??
                `${structure.name} accompagne les jeunes et les talents dans leur développement personnel et professionnel.`}
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: Megaphone, label: 'Communication & expression' },
                { icon: Users, label: 'Accompagnement sur mesure' },
                { icon: Trophy, label: 'Projets et challenges' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'var(--st-primary-soft)',
                      color: 'var(--st-primary-dark)',
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-slate-800">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <StructureServicesSection
        structureName={structure.name}
        services={structure.landingServices}
        intro={structure.landingServicesIntro}
      />

      <section id="projets" className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'var(--st-primary)' }}
            >
              Nos projets
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
              Ce que nous proposons
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {structure.expertiseDomain && (
              <article
                className="rounded-2xl p-8 text-white shadow-xl"
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
                  boxShadow: '0 20px 40px -16px rgba(var(--st-primary-rgb), 0.45)',
                }}
              >
                <Sparkles className="h-8 w-8 opacity-90" />
                <h3 className="mt-6 font-serif text-xl font-bold">
                  {structure.expertiseDomain.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/90">
                  Notre domaine d&apos;expertise au cœur de {structure.name}.
                </p>
              </article>
            )}

            {mainChallenge ? (
              <article className="rounded-2xl border border-slate-100 bg-slate-50 p-8 shadow-sm transition hover:shadow-md lg:col-span-2">
                <Trophy className="h-8 w-8" style={{ color: 'var(--st-primary)' }} />
                <h3 className="mt-6 font-serif text-xl font-bold text-slate-900">
                  {mainChallenge.name}
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">
                  {mainChallenge.description ??
                    'Notre challenge phare — inscriptions bientôt ouvertes.'}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <p
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: 'var(--st-primary-dark)' }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Challenge actif
                  </p>
                  <Link
                    href={registrationPath ?? '#projets'}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02]"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
                    }}
                  >
                    S&apos;inscrire au challenge
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ) : (
              <article className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center lg:col-span-2">
                <Trophy className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-4 text-slate-500">Nouveaux projets annoncés prochainement.</p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[#1a1033] py-20 text-white md:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <h2 className="font-serif text-3xl font-bold leading-tight md:text-5xl">
            Construisons le pont entre
            <br />
            <span style={{ color: 'var(--st-primary-light)' }}>
              votre talent et votre audience.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-slate-300">
            Rejoignez {structure.name} et participez à nos projets éducatifs et créatifs.
          </p>

          <StructureContactForm structureName={structure.name} contactSlug={contactSlug} />

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#projets"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Voir nos projets
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-12">
            {[
              {
                value: structure.challenges.length > 0 ? `${structure.challenges.length}+` : '1',
                label: 'Projets',
              },
              { value: '100%', label: 'Engagement' },
              { value: '★ 5.0', label: 'Ambition' },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-2xl font-bold md:text-3xl"
                  style={{ color: 'var(--st-primary-light)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-slate-500 md:flex-row md:px-6 md:text-left">
          <p>
            © {new Date().getFullYear()} {structure.name}. Tous droits réservés.
          </p>
          <p className="text-xs text-slate-400">
            Propulsé par{' '}
            <Link
              href={mainSite}
              className="hover:underline"
              style={{ color: 'var(--st-primary)' }}
            >
              Réseau OMA
            </Link>
          </p>
        </div>
      </footer>

      <StructureFloatingWhatsApp structureName={structure.name} />
    </div>
  )
}
