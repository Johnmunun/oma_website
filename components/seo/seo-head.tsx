/**
 * Hook pour récupérer les métadonnées SEO
 * Utilisé dans les pages pour générer les meta tags
 * 
 * @hook useSeoMeta
 * @author OMA Team
 */

"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface SeoMeta {
  id: string
  slug: string | null
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImageUrl: string | null
  ogType: string | null
  twitterCard: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImageUrl: string | null
  noIndex: boolean
  noFollow: boolean
  canonicalUrl: string | null
  schemaJson: any
}

export function useSeoMeta() {
  const pathname = usePathname()
  const [seoMeta, setSeoMeta] = useState<SeoMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSeoMeta = async () => {
      try {
        // Normaliser le slug (enlever le leading slash)
        const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "")
        
        if (!slug) {
          setIsLoading(false)
          return
        }

        const res = await fetch(`/api/seo/${slug}`, {
          cache: "no-store",
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setSeoMeta(data.data)
          }
        }
      } catch (err) {
        console.error("[useSeoMeta] Erreur chargement SEO:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSeoMeta()
  }, [pathname])

  return { seoMeta, isLoading }
}

