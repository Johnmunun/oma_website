"use client"

import { useEffect, useState } from "react"
import { FloatingSupportButton } from "@/components/floating-support-button"
import { defaultCMSConfig } from "@/lib/cms/config"

type StructureFloatingWhatsAppProps = {
  structureName: string
}

function normalizeWhatsApp(value: string): string {
  return value.replace(/[^\d]/g, "")
}

export function StructureFloatingWhatsApp({ structureName }: StructureFloatingWhatsAppProps) {
  const [whatsappNumber, setWhatsappNumber] = useState(
    normalizeWhatsApp(defaultCMSConfig.support.whatsappNumber)
  )

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((res) => {
        if (!res.success || !res.data) return
        const phones = Array.isArray(res.data.telephones)
          ? res.data.telephones
          : res.data.telephones
            ? String(res.data.telephones)
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : []
        if (phones[0]) {
          setWhatsappNumber(normalizeWhatsApp(phones[0]))
        }
      })
      .catch(() => {})
  }, [])

  if (!whatsappNumber) return null

  return (
    <FloatingSupportButton
      whatsappNumber={whatsappNumber}
      title={`Discuter avec ${structureName}`}
      description="Une question sur nos programmes ? Écrivez-nous sur WhatsApp, nous vous répondons rapidement."
      buttonLabel="Ouvrir WhatsApp"
      useStructureTheme
    />
  )
}
