"use client"

import { Share2, Facebook, Instagram, Twitter, Linkedin, MessageCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  imageUrl?: string
  className?: string
}

export function ShareButtons({ url, title, description, imageUrl, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  // Encoder les paramètres pour les URLs de partage
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || title)
  const encodedImage = encodeURIComponent(imageUrl || "")

  // WhatsApp
  const shareOnWhatsApp = () => {
    const text = `${title}${description ? `\n\n${description}` : ""}\n\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  // Facebook
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=600,height=400")
  }

  // Twitter/X
  const shareOnTwitter = () => {
    const text = `${title}${description ? ` - ${description.substring(0, 100)}` : ""}`
    window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(text)}`, "_blank", "width=600,height=400")
  }

  // LinkedIn
  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank", "width=600,height=400")
  }

  // Instagram (nécessite une app, on ouvre juste Instagram)
  const shareOnInstagram = () => {
    toast.info("Pour partager sur Instagram, copiez l'image et le texte, puis publiez sur votre compte.")
    // Optionnel: ouvrir Instagram dans un nouvel onglet
    window.open("https://www.instagram.com/", "_blank")
  }

  // Copier le lien
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Lien copié dans le presse-papiers !")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Erreur lors de la copie du lien")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
          <Share2 className="w-4 h-4" />
          Partager
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={shareOnWhatsApp} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">
          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer">
          <Twitter className="w-4 h-4 mr-2 text-sky-500" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnLinkedIn} className="cursor-pointer">
          <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnInstagram} className="cursor-pointer">
          <Instagram className="w-4 h-4 mr-2 text-pink-600" />
          Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
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
