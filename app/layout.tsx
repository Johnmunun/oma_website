import type React from "react"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Playfair_Display, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { NextAuthSessionProvider } from "@/components/providers/session-provider"
import { DynamicColors } from "@/components/theming/dynamic-colors"
import { VisitTracker } from "@/components/analytics/visit-tracker"
import { SmoothNavigation } from "@/components/animations/smooth-navigation"
import { CacheInitScript } from "@/lib/cache"

const TrackingPixels = dynamic(() =>
  import("@/components/tracking/tracking-pixels").then((mod) => ({
    default: mod.TrackingPixels,
  })),
)

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "700"],
  preload: true,
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "600"],
  preload: true,
})

export const metadata: Metadata = {
  title: "Réseau OMA & OMA TV — Formation, Communication et Leadership",
  description:
    "Plateforme internationale dédiée à l'art oratoire, la communication, le marketing et les formations numériques. Dompter la parole, c'est dompter le monde.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: '/icon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="fr" 
      className={`${playfair.variable} ${poppins.variable} overflow-x-hidden max-w-full`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased overflow-x-hidden max-w-full w-full" suppressHydrationWarning>
        <CacheInitScript />
        <TrackingPixels />
        <DynamicColors />
        <SmoothNavigation />
        <NextAuthSessionProvider>
          <Suspense fallback={null}>
            <VisitTracker />
            {children}
            <Analytics />
            <Toaster position="bottom-center" richColors={true} />
          </Suspense>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
