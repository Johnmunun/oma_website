import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PAST_EVENTS, UPCOMING_EVENTS, sortPastByDateDesc, sortUpcomingByDate } from '@/lib/events'

export default function EventsIndexPage() {
  const upcoming = [...UPCOMING_EVENTS].sort(sortUpcomingByDate)
  const past = [...PAST_EVENTS].sort(sortPastByDateDesc)

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-4">Tous les événements</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Découvrez nos prochains rendez-vous et revisitez nos moments marquants.</p>
        </header>

        {/* À venir */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-semibold">À venir</h2>
            <span className="text-sm text-muted-foreground">{upcoming.length} événements</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map((event, idx) => (
              <div key={idx} className="bg-card rounded-lg overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative h-48 overflow-hidden">
                  <img src={event.image || '/placeholder.svg'} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-4 left-4 bg-gold text-primary px-3 py-1 rounded-full text-sm font-semibold">{event.type}</div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif font-bold text-xl mb-3 text-foreground">{event.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-gold" />
                      <span className="text-sm">{event.dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-gold" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                  <Link href={`/events/${event.slug ?? 'details'}`}>
                    <Button className="w-full bg-gold hover:bg-gold-dark text-primary">Réserver ma place</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Passés */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-semibold">Moments passés</h2>
            <span className="text-sm text-muted-foreground">{past.length} événements</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {past.map((event, idx) => (
              <Link key={idx} href={`/events/${event.slug}`}>
                <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <img src={event.image || '/placeholder.svg'} alt={event.title} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
                    <h3 className="font-serif font-bold text-lg mb-1">{event.title}</h3>
                    <p className="text-sm text-gold">{event.dateLabel}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}



