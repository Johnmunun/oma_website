import { resolveExpertiseIcon } from '@/lib/expertise/domain-icons'
import type { PublicLandingService } from '@/lib/structures/load-public-structure'

type StructureServicesSectionProps = {
  structureName: string
  services: PublicLandingService[]
  intro?: string | null
}

export function StructureServicesSection({
  structureName,
  services,
  intro,
}: StructureServicesSectionProps) {
  const sectionIntro =
    intro?.trim() ||
    `${structureName} propose des programmes concrets pour progresser, se faire remarquer et réussir — avec l'expertise du réseau OMA.`

  return (
    <section id="services" className="bg-[#fafafa] py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--st-primary)' }}
          >
            Services
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
            Nos services
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">{sectionIntro}</p>
        </div>

        <div
          className={`mt-12 grid gap-5 sm:grid-cols-2 ${
            services.length >= 4 ? 'lg:grid-cols-4' : services.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
          }`}
        >
          {services.map((service) => {
            const Icon = resolveExpertiseIcon(service.iconKey)
            return (
              <article
                key={`${service.title}-${service.iconKey}`}
                className="group flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-[var(--st-primary-light)] hover:shadow-md"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors group-hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--st-primary-soft)',
                    color: 'var(--st-primary-dark)',
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
                <a
                  href="#contact"
                  className="mt-5 inline-flex text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: 'var(--st-primary-dark)' }}
                >
                  En savoir plus →
                </a>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
