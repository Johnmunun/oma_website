"use client"

import { MessageCircle, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function FloatingSupportButton() {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/243858703808", "_blank")
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <div className="bg-card border border-border rounded-lg shadow-xl p-4 max-w-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground">Besoin d'aide?</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
            <Button onClick={handleWhatsAppClick} className="w-full bg-gold hover:bg-gold-dark text-primary">
              Contacter sur WhatsApp
            </Button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gold hover:bg-gold-dark text-primary rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Support client"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </>
  )
}
