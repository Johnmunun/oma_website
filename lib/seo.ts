/**
 * Utilitaires pour générer les métadonnées SEO
 * Utilisé dans les pages Next.js pour générer les metadata
 * 
 * @author OMA Team
 */

import { Metadata } from "next"
import { prisma } from "@/lib/prisma"

interface SeoMetaData {
  title?: string | null
  description?: string | null
  keywords?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImageUrl?: string | null
  ogType?: string | null
  twitterCard?: string | null
  twitterTitle?: string | null
  twitterDescription?: string | null
  twitterImageUrl?: string | null
  noIndex?: boolean
  noFollow?: boolean
  canonicalUrl?: string | null
  schemaJson?: any
}

const defaultTitle = "Réseau OMA - Oratoire Mon Art"
const defaultDescription = "Plateforme internationale dédiée à l'art oratoire, la communication, le marketing et les formations numériques."
const defaultImage = "/og-image.jpg"
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://votre-domaine.com"

/**
 * Récupère les métadonnées SEO pour un slug donné
 */
export async function getSeoMeta(slug: string): Promise<SeoMetaData | null> {
  try {
    const seoMeta = await prisma.seoMeta.findFirst({
      where: { slug },
    })

    return seoMeta
  } catch (error) {
    console.error("[SEO] Erreur récupération métadonnées:", error)
    return null
  }
}

/**
 * Génère les metadata Next.js à partir des métadonnées SEO
 */
export async function generateSeoMetadata(slug: string): Promise<Metadata> {
  const seoMeta = await getSeoMeta(slug)

  const title = seoMeta?.title || defaultTitle
  const description = seoMeta?.description || defaultDescription
  const keywords = seoMeta?.keywords || ""
  const ogTitle = seoMeta?.ogTitle || seoMeta?.title || defaultTitle
  const ogDescription = seoMeta?.ogDescription || seoMeta?.description || defaultDescription
  const ogImage = seoMeta?.ogImageUrl || defaultImage
  const ogType = seoMeta?.ogType || "website"
  const twitterCard = seoMeta?.twitterCard || "summary_large_image"
  const twitterTitle = seoMeta?.twitterTitle || seoMeta?.ogTitle || seoMeta?.title || defaultTitle
  const twitterDescription = seoMeta?.twitterDescription || seoMeta?.ogDescription || seoMeta?.description || defaultDescription
  const twitterImage = seoMeta?.twitterImageUrl || seoMeta?.ogImageUrl || defaultImage
  const canonicalUrl = seoMeta?.canonicalUrl || `${baseUrl}${slug === "home" ? "" : `/${slug}`}`
  const robots = [
    seoMeta?.noIndex ? "noindex" : "index",
    seoMeta?.noFollow ? "nofollow" : "follow",
  ].join(", ")

  return {
    title,
    description,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()) : undefined,
    robots: {
      index: !seoMeta?.noIndex,
      follow: !seoMeta?.noFollow,
      googleBot: {
        index: !seoMeta?.noIndex,
        follow: !seoMeta?.noFollow,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
      type: ogType as any,
      url: canonicalUrl,
    },
    twitter: {
      card: twitterCard as any,
      title: twitterTitle,
      description: twitterDescription,
      images: [twitterImage],
    },
  }
}

/**
 * Génère le JSON-LD Schema.org
 */
export async function generateSchemaJson(slug: string): Promise<object | null> {
  const seoMeta = await getSeoMeta(slug)

  if (seoMeta?.schemaJson) {
    return seoMeta.schemaJson
  }

  // Schema par défaut pour l'organisation
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Réseau OMA",
    description: defaultDescription,
    url: baseUrl,
  }
}

