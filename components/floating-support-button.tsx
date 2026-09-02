"use client"

import { MessageCircle, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { defaultCMSConfig } from "@/lib/cms/config"
import { cn } from "@/lib/utils"

export type FloatingSupportButtonProps = {
  whatsappNumber?: string
  title?: string
  description?: string
  buttonLabel?: string
  /** Utilise les couleurs --st-primary de la landing partenaire */
  useStructureTheme?: boolean
  className?: string
}

const DEFAULT_WHATSAPP = defaultCMSConfig.support.whatsappNumber.replace(/[^\d]/g, "")

export function FloatingSupportButton({
  whatsappNumber = DEFAULT_WHATSAPP,
  title = "Besoin d'aide ?",
  description = "Notre équipe est disponible pour répondre à toutes vos questions.",
  buttonLabel = "Contacter sur WhatsApp",
  useStructureTheme = false,
  className,
}: FloatingSupportButtonProps = {}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppClick = () => {
    const digits = whatsappNumber.replace(/[^\d]/g, "")
    if (!digits) return
    window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer")
  }

  const fabStyle = useStructureTheme
    ? {
        backgroundColor: "var(--st-primary)",
        color: "white",
      }
    : undefined

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3", className)}>
      {isOpen && (
        <div className="bg-card border border-border rounded-lg shadow-xl p-4 max-w-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Button
            onClick={handleWhatsAppClick}
            className={cn(
              "w-full",
              !useStructureTheme && "bg-gold hover:bg-gold-dark text-primary"
            )}
            style={useStructureTheme ? fabStyle : undefined}
          >
            {buttonLabel}
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group",
          !useStructureTheme && "bg-gold hover:bg-gold-dark text-primary"
        )}
        style={useStructureTheme ? fabStyle : undefined}
        aria-label="Support WhatsApp"
      >
        <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )
}
