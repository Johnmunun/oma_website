"use client"

/**
 * @file components/admin/share-registration-form.tsx
 * @description Composant pour partager le formulaire d'inscription d'un événement
 * Permet de partager le lien du formulaire sur WhatsApp, Facebook, etc.
 */

import { Share2, Facebook, MessageCircle, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareRegistrationFormProps {
  eventSlug: string
  eventTitle: string
  className?: string
}

export function ShareRegistrationForm({
  eventSlug,
  eventTitle,
  className,
}: ShareRegistrationFormProps) {
  const [copied, setCopied] = useState(false)
  
  const registerUrl = typeof window !== "undefined"
    ? `${window.location.origin}/events/${eventSlug}/register`
    : ""

  // WhatsApp - Partager le formulaire d'inscription
  const shareOnWhatsApp = () => {
    const text = `📅 Inscription à l'événement: ${eventTitle}\n\n🔗 Formulaire d'inscription:\n${registerUrl}\n\nRejoignez-nous !`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  // Facebook
  const shareOnFacebook = () => {
    const encodedUrl = encodeURIComponent(registerUrl)
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(`Inscription: ${eventTitle}`)}`,
      "_blank",
      "width=600,height=400"
    )
  }

  // Copier le lien du formulaire
  const copyRegistrationLink = async () => {
    try {
      await navigator.clipboard.writeText(registerUrl)
      setCopied(true)
      toast.success("Lien du formulaire copié !")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Erreur lors de la copie")
    }
  }

  // Ouvrir le formulaire dans un nouvel onglet
  const openForm = () => {
    window.open(registerUrl, '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
          <Share2 className="w-4 h-4" />
          Partager formulaire
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={openForm} className="cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          Ouvrir le formulaire
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnWhatsApp} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">
          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyRegistrationLink} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copier le lien
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

