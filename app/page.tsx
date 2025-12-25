import { HeroSection } from "@/components/hero-section"
import { ScrollingEventsBanner } from "@/components/scrolling-events-banner"
import { AboutSection } from "@/components/about-section"
import { DomainsSection } from "@/components/domains-section"
import { Navigation } from "@/components/navigation"
import dynamic from "next/dynamic"

// Lazy loading des composants non critiques (en bas de page)
// Le lazy loading seul améliore déjà les performances en divisant le bundle
const EventsSection = dynamic(() => import("@/components/events-section").then(mod => ({ default: mod.EventsSection })))
const OmaTvSection = dynamic(() => import("@/components/oma-tv-section").then(mod => ({ default: mod.OmaTvSection })))
const TestimonialsSection = dynamic(() => import("@/components/testimonials-section").then(mod => ({ default: mod.TestimonialsSection })))
const TeamSection = dynamic(() => import("@/components/team-section").then(mod => ({ default: mod.TeamSection })))
const PartnersSection = dynamic(() => import("@/components/partners-section").then(mod => ({ default: mod.PartnersSection })))
const NewsletterSection = dynamic(() => import("@/components/newsletter-section").then(mod => ({ default: mod.NewsletterSection })))
const ContactSection = dynamic(() => import("@/components/contact-section").then(mod => ({ default: mod.ContactSection })))
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })))
const FloatingSupportButton = dynamic(() => import("@/components/floating-support-button").then(mod => ({ default: mod.FloatingSupportButton })))
const ScrollToTopButton = dynamic(() => import("@/components/scroll-to-top-button").then(mod => ({ default: mod.ScrollToTopButton })))

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden max-w-full w-full">
      <Navigation />
      <HeroSection />
      <ScrollingEventsBanner />
      <AboutSection />
      <DomainsSection />
      {/*<FormationsSection /> */}
      <EventsSection />
      <OmaTvSection />
      <TestimonialsSection />
      <TeamSection />
      <PartnersSection />
      <NewsletterSection />
      <ContactSection />
      <Footer />
      <FloatingSupportButton />
      <ScrollToTopButton />
    </main>
  )
}
