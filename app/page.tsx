import { HeroSection } from "@/components/hero-section"
import { ScrollingEventsBanner } from "@/components/scrolling-events-banner"
import { AboutSection } from "@/components/about-section"
import { DomainsSection } from "@/components/domains-section"
import { EventsSection } from "@/components/events-section"
import { OmaTvSection } from "@/components/oma-tv-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { TeamSection } from "@/components/team-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { FloatingSupportButton } from "@/components/floating-support-button"
import { NewsletterSection } from "@/components/newsletter-section"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"

export default function Home() {
  return (
    <main className="min-h-screen">
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
      <NewsletterSection />
      <ContactSection />
      <Footer />
      <FloatingSupportButton />
      <ScrollToTopButton />
    </main>
  )
}
