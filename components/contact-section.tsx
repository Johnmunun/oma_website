"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MessageCircle, Facebook, Instagram, Youtube, Twitter, Linkedin } from "lucide-react"

interface SiteSettings {
  email: string
  telephones: string[]
  facebook: string
  instagram: string
  youtube: string
  twitter: string
  linkedin: string
}

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [settings, setSettings] = useState<SiteSettings>({
    email: "",
    telephones: [],
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    linkedin: "",
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.data) {
          setSettings({
            email: data.data.email || "",
            telephones: Array.isArray(data.data.telephones) 
              ? data.data.telephones 
              : data.data.telephones 
                ? data.data.telephones.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [],
            facebook: data.data.facebook || "",
            instagram: data.data.instagram || "",
            youtube: data.data.youtube || "",
            twitter: data.data.twitter || "",
            linkedin: data.data.linkedin || "",
          })
        }
      } catch (err) {
        console.error('[ContactSection] Erreur chargement paramètres:', err)
      }
    }
    
    // Charger au montage
    loadSettings()
    
    // Écouter les événements de mise à jour des settings
    const handleSettingsUpdate = () => {
      loadSettings()
    }
    
    window.addEventListener('settings-updated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Validation côté client
    if (formData.name.trim().length < 2) {
      setSubmitStatus({
        type: 'error',
        message: 'Le nom doit contenir au moins 2 caractères.',
      })
      setIsSubmitting(false)
      return
    }

    if (formData.message.trim().length < 10) {
      setSubmitStatus({
        type: 'error',
        message: 'Le message doit contenir au moins 10 caractères.',
      })
      setIsSubmitting(false)
      return
    }

    if (formData.message.trim().length > 5000) {
      setSubmitStatus({
        type: 'error',
        message: 'Le message ne peut pas dépasser 5000 caractères.',
      })
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: `Message de ${formData.name.trim()}`,
          message: formData.message.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        // Afficher les détails de validation si disponibles
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          const details = data.details.map((d: { field: string; message: string }) => `${d.field}: ${d.message}`).join(', ')
          throw new Error(`Données invalides: ${details}`)
        }
        throw new Error(data.error || 'Erreur lors de l\'envoi du message')
      }

      setSubmitStatus({
        type: 'success',
        message: data.message || 'Votre message a été envoyé avec succès !',
      })

      // Reset form
      setFormData({ name: "", email: "", message: "" })

      // Effacer le message de succès après 5 secondes
      setTimeout(() => setSubmitStatus(null), 5000)
    } catch (err: any) {
      console.error('[ContactSection] Erreur soumission formulaire:', err)
      setSubmitStatus({
        type: 'error',
        message: err.message || 'Une erreur est survenue. Veuillez réessayer.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const socialLinks = [
    { icon: Facebook, url: settings.facebook, name: "Facebook" },
    { icon: Instagram, url: settings.instagram, name: "Instagram" },
    { icon: Youtube, url: settings.youtube, name: "YouTube" },
    { icon: Twitter, url: settings.twitter, name: "Twitter" },
    { icon: Linkedin, url: settings.linkedin, name: "LinkedIn" },
  ].filter(link => link.url)

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
            Contactez-nous
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Prêt à transformer votre communication ? Parlons de votre projet
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-card rounded-lg p-8 shadow-lg border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                  Nom complet
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Parlez-nous de votre projet..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              {submitStatus && (
                <div
                  className={`p-4 rounded-lg ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <p className="text-sm font-medium">{submitStatus.message}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer le message'
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-serif font-bold text-2xl mb-6 text-foreground">Informations de contact</h3>
              <div className="space-y-4">
                {settings.email && (
                <a
                    href={`mailto:${settings.email}`}
                  className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-gold transition-colors group"
                >
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Mail className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Email</div>
                      <div className="text-muted-foreground">{settings.email}</div>
                  </div>
                </a>
                )}

                {settings.telephones.length > 0 && (
                  <>
                    {settings.telephones.map((tel, index) => (
                <a
                        key={index}
                        href={`tel:${tel.replace(/\s/g, '')}`}
                  className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-gold transition-colors group"
                >
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Phone className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                          <div className="font-semibold text-foreground">
                            {index === 0 ? "Téléphone" : `Téléphone ${index + 1}`}
                          </div>
                          <div className="text-muted-foreground">{tel}</div>
                  </div>
                </a>
                    ))}
                    {settings.telephones.length > 0 && (
                <a
                        href={`https://wa.me/${settings.telephones[0].replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-gold transition-colors group"
                >
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <MessageCircle className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">WhatsApp</div>
                    <div className="text-muted-foreground">Contactez-nous directement</div>
                  </div>
                </a>
                    )}
                  </>
                )}

                {!settings.email && settings.telephones.length === 0 && (
                  <div className="p-4 bg-card rounded-lg border border-border text-muted-foreground text-center">
                    Aucune information de contact disponible
                  </div>
                )}
              </div>
            </div>

            {socialLinks.length > 0 && (
            <div>
              <h3 className="font-serif font-bold text-2xl mb-6 text-foreground">Suivez-nous</h3>
                <div className="flex gap-4 flex-wrap">
                  {socialLinks.map((link) => {
                    const Icon = link.icon
                    return (
                <a
                        key={link.name}
                        href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center hover:bg-gold hover:text-primary transition-colors"
                        aria-label={link.name}
                >
                        <Icon className="h-6 w-6" />
                </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
