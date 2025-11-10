"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, Play } from "lucide-react"
import YouTubeEmbed from "@/components/youtube-embed"

// Données d'exemple - À remplacer par une requête API
const eventData: Record<string, any> = {
  "formation-mc": {
    id: 1,
    title: "Formation Professionnelle Certifiante des MC",
    date: "Date à confirmer",
    dateObj: "2023-10-01",
    location: "Kinshasa, RDC",
    image: "/images/mc-formation-poster.jpg",
    type: "Formation",
    description: "Une formation professionnelle complète pour maîtriser l'art de la cérémonie.",
    duration: "5 jours",
    capacity: 50,
    registered: 28,
    program: [
      {
        day: "Jour 1",
        title: "Introduction à l'art de la cérémonie",
        description: "Fondamentaux et principes clés",
      },
      {
        day: "Jour 2",
        title: "Maîtrise de la parole en public",
        description: "Techniques et pratiques avancées",
      },
      {
        day: "Jour 3",
        title: "Gestion du timing et du protocole",
        description: "Aspects pratiques et professionnels",
      },
      {
        day: "Jour 4",
        title: "Communication non-verbale",
        description: "Langage corporel et présence",
      },
      {
        day: "Jour 5",
        title: "Évaluation et certification",
        description: "Examen final et remise de diplôme",
      },
    ],
    speakers: [
      {
        name: "Coach Bin Adan",
        title: "CEO International de Réseau OMA",
        image: "/images/coach-bin-professional.jpg",
      },
      {
        name: "Trainer Don Kayara",
        title: "Rhétoricien et Expert en Communication",
        image: "/images/coach-bin-speaking.jpg",
      },
    ],
    price: 150,
    isPast: false,
    youtubeId: null,
  },
  "masterclass-orateur": {
    id: 2,
    title: "Masterclass Art Oratoire",
    date: "15 Juin 2025",
    dateObj: "2025-06-15",
    location: "Paris, France",
    image: "/images/graduation-ceremony-1.jpg",
    type: "Masterclass",
    description: "Une masterclass exclusive sur l'art de l'éloquence et de la rhétorique.",
    duration: "2 jours",
    capacity: 100,
    registered: 45,
    program: [
      { day: "Jour 1", title: "Fondamentaux de l'éloquence", description: "Les bases de la rhétorique" },
      { day: "Jour 2", title: "Pratique et perfectionnement", description: "Exercices intensifs" },
    ],
    speakers: [{ name: "Expert Oratoire", title: "Conférencier International", image: "/placeholder.svg" }],
    price: 200,
    isPast: false,
    youtubeId: null,
  },
  "past-event": {
    id: 3,
    title: "Événement Passé",
    date: "1 Janvier 2023",
    dateObj: "2023-01-01",
    location: "Lyon, France",
    image: "/images/past-event-poster.jpg",
    type: "Conférence",
    description: "Un événement passé avec un replay disponible.",
    duration: "3 jours",
    capacity: 150,
    registered: 150,
    program: [
      { day: "Jour 1", title: "Introduction", description: "Présentation de l'événement" },
      { day: "Jour 2", title: "Ateliers", description: "Sessions pratiques" },
      { day: "Jour 3", title: "Conclusion", description: "Résumé et Q&A" },
    ],
    speakers: [{ name: "Monsieur Speaker", title: "Conférencier renommé", image: "/placeholder.svg" }],
    price: 0,
    isPast: true,
    youtubeId: "dQw4w9WgXcQ",
  },
}

export default function EventDetailContent({ slug }: { slug: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const event = eventData[slug]

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Événement non trouvé</p>
      </div>
    )
  }

  const isPastEvent = event.isPast || false
  const eventDate = new Date(event.dateObj || "")
  const today = new Date()
  const isEventPassed = eventDate < today

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Envoyer les données du formulaire à l'API /api/registrations
      const formData = new FormData(e.currentTarget)
      const data = {
        eventId: event.id,
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        company: formData.get("company"),
        country: formData.get("country"),
      }

      console.log("[v0] Inscription événement:", data)

      // Simuler un délai d'envoi
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirection avec succès
      router.push("/")
    } catch (error) {
      console.error("[v0] Erreur inscription:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background animate-fadeIn">
      {/* HERO SECTION */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover animate-zoomIn"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        <div className="absolute inset-0 flex items-end p-6 md:p-12">
          <div className="max-w-4xl w-full animate-slideUp">
            <div className="inline-block bg-gold text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {event.type}
            </div>
            <h1 className="font-serif font-bold text-3xl md:text-5xl text-white mb-4 text-balance">{event.title}</h1>
            <p className="text-lg text-gray-100">{event.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* INFO CARDS */}
          <div className="grid md:grid-cols-4 gap-4 mb-12 -mt-8 relative z-10">
            {[
              { icon: Calendar, label: "Date", value: event.date },
              { icon: MapPin, label: "Lieu", value: event.location },
              { icon: Clock, label: "Durée", value: event.duration },
              {
                icon: Users,
                label: "Places restantes",
                value: `${event.capacity - event.registered}/${event.capacity}`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow animate-slideUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <item.icon className="h-5 w-5 text-gold mb-2" />
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          {/* PROGRAMME */}
          <section className="mb-16 animate-slideUp" style={{ animationDelay: "400ms" }}>
            <h2 className="font-serif font-bold text-3xl mb-8 text-foreground">Au programme</h2>
            <div className="space-y-4">
              {event.program.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-muted/50 border border-border rounded-lg p-6 hover:bg-muted transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gold rounded-full flex items-center justify-center text-primary font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {item.day} - {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SPEAKERS */}
          <section className="mb-16 animate-slideUp" style={{ animationDelay: "500ms" }}>
            <h2 className="font-serif font-bold text-3xl mb-8 text-foreground">Intervenants</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {event.speakers.map((speaker: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={speaker.image || "/placeholder.svg"}
                    alt={speaker.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-serif font-bold text-xl text-foreground mb-2">{speaker.name}</h3>
                    <p className="text-gold text-sm font-semibold">{speaker.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {isPastEvent && event.youtubeId && (
            <section className="mb-16 animate-slideUp" style={{ animationDelay: "550ms" }}>
              <h2 className="font-serif font-bold text-3xl mb-8 text-foreground flex items-center gap-3">
                <Play className="h-8 w-8 text-gold" />
                Regarder le replay
              </h2>
              <div className="rounded-xl overflow-hidden shadow-2xl border border-gold/20">
                <YouTubeEmbed videoId={event.youtubeId} />
              </div>
              <p className="text-center text-muted-foreground mt-4">
                Cet événement s'est déroulé le {event.date}. Profitez du replay pour ne rien manquer !
              </p>
            </section>
          )}

          {!isPastEvent && (
            <section className="animate-slideUp" style={{ animationDelay: "600ms" }}>
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-8 md:p-12">
                <h2 className="font-serif font-bold text-3xl mb-2 text-foreground">Réservez votre place</h2>
                <p className="text-muted-foreground mb-8">
                  Prix: <span className="font-bold text-gold">${event.price}</span> par participant
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Prénom"
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Nom"
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Téléphone"
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="company"
                      placeholder="Entreprise (optionnel)"
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="text"
                      name="country"
                      placeholder="Pays"
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      "Confirmer ma réservation"
                    )}
                  </Button>
                </form>
              </div>
            </section>
          )}

          {isPastEvent && !event.youtubeId && (
            <section className="animate-slideUp" style={{ animationDelay: "600ms" }}>
              <div className="bg-muted/50 border border-border rounded-xl p-12 text-center">
                <h2 className="font-serif font-bold text-2xl mb-4 text-foreground">Événement passé</h2>
                <p className="text-muted-foreground mb-6">
                  Cet événement s'est déroulé le {event.date}. Merci à tous les participants !
                </p>
                <Button onClick={() => router.push("/#evenements")} className="bg-gold hover:bg-gold-dark text-primary">
                  Découvrir nos prochains événements
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
