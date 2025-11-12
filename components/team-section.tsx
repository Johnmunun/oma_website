"use client"

import { useState, useEffect } from "react"
import { Linkedin, Facebook, Instagram, Twitter, Users2, Loader2 } from "lucide-react"
import Link from "next/link"
import { EmblaCarousel } from "@/components/ui/embla-carousel"

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string | null
  photoUrl: string | null
  xUrl: string | null
  linkedinUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
}

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/team', {
          next: { revalidate: 60 },
        })
        
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setMembers(data.data)
          }
        }
      } catch (error) {
        console.error('[TeamSection] Erreur chargement équipe:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTeam()
  }, [])

  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">Notre équipe</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Des experts passionnés au service de votre développement
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (members.length === 0) {
    return null
  }

  // Vue desktop (grille)
  const desktopView = (
    <div className={`grid gap-12 max-w-5xl mx-auto ${
      members.length === 1 
        ? 'grid-cols-1 md:grid-cols-1' 
        : members.length === 2 
        ? 'grid-cols-1 md:grid-cols-2' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {members.map((member) => (
        <div key={member.id} className="text-center">
          <div className="relative inline-block mb-6">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-64 h-64 rounded-lg object-cover shadow-xl border-4 border-gold"
                loading="lazy"
              />
            ) : (
              <div className="w-64 h-64 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-xl border-4 border-gold">
                <Users2 className="w-24 h-24 text-muted-foreground opacity-30" />
              </div>
            )}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold rounded-lg -z-10" />
          </div>
          <h3 className="font-serif font-bold text-3xl mb-2 text-foreground">{member.name}</h3>
          <p className="text-gold font-semibold mb-4 text-lg">{member.role}</p>
          {member.bio && (
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto mb-4">
              {member.bio}
            </p>
          )}
          
          {/* Réseaux sociaux */}
          {(member.linkedinUrl || member.facebookUrl || member.instagramUrl || member.xUrl) && (
            <div className="flex items-center justify-center gap-3 mt-4">
              {member.linkedinUrl && (
                <Link
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-gold transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
              )}
              {member.facebookUrl && (
                <Link
                  href={member.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-gold transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
              )}
              {member.instagramUrl && (
                <Link
                  href={member.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-gold transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
              )}
              {member.xUrl && (
                <Link
                  href={member.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-gold transition-colors"
                  aria-label="X (Twitter)"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  // Slides pour le carousel mobile
  const slides = members.map((member) => (
    <div key={member.id} className="text-center px-4">
      <div className="relative inline-block mb-6">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg object-cover shadow-xl border-4 border-gold mx-auto"
            loading="lazy"
          />
        ) : (
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-xl border-4 border-gold mx-auto">
            <Users2 className="w-20 h-20 sm:w-24 sm:h-24 text-muted-foreground opacity-30" />
          </div>
        )}
        <div className="absolute -bottom-4 -right-4 w-20 h-20 sm:w-24 sm:h-24 bg-gold rounded-lg -z-10" />
      </div>
      <h3 className="font-serif font-bold text-2xl sm:text-3xl mb-2 text-foreground">{member.name}</h3>
      <p className="text-gold font-semibold mb-4 text-lg">{member.role}</p>
      {member.bio && (
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto mb-4 text-sm sm:text-base">
          {member.bio}
        </p>
      )}
      
      {/* Réseaux sociaux */}
      {(member.linkedinUrl || member.facebookUrl || member.instagramUrl || member.xUrl) && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {member.linkedinUrl && (
            <Link
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-gold transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          )}
          {member.facebookUrl && (
            <Link
              href={member.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-gold transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </Link>
          )}
          {member.instagramUrl && (
            <Link
              href={member.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-gold transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </Link>
          )}
          {member.xUrl && (
            <Link
              href={member.xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-gold transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-5 h-5" />
            </Link>
          )}
        </div>
      )}
    </div>
  ))

  return (
    <section id="equipe" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">Notre équipe</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Des experts passionnés au service de votre développement
          </p>
        </div>

        {/* Carousel mobile / Grille desktop */}
        <EmblaCarousel
          breakpoint="md"
          desktopView={desktopView}
          slideClassName="w-[90%] sm:w-[80%]"
          options={{
            align: "center",
            containScroll: "trimSnaps",
          }}
        >
          {slides}
        </EmblaCarousel>
      </div>
    </section>
  )
}
