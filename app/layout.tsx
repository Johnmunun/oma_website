import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { NextAuthSessionProvider } from "@/components/providers/session-provider"
import { DynamicColors } from "@/components/theming/dynamic-colors"
import { VisitTracker } from "@/components/analytics/visit-tracker"
import { TrackingPixels } from "@/components/tracking/tracking-pixels"
import { PageTransition } from "@/components/animations/page-transition"
import { SmoothNavigation } from "@/components/animations/smooth-navigation"
import { CacheInitScript } from "@/lib/cache/init-cache-script"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Réseau OMA & OMA TV — Formation, Communication et Leadership",
  description:
    "Plateforme internationale dédiée à l'art oratoire, la communication, le marketing et les formations numériques. Dompter la parole, c'est dompter le monde.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${poppins.variable} overflow-x-hidden max-w-full`}>
      <body className="font-sans antialiased overflow-x-hidden max-w-full w-full">
        <CacheInitScript />
        <TrackingPixels />
        <DynamicColors />
        <SmoothNavigation />
        <NextAuthSessionProvider>
          <Suspense fallback={null}>
            <VisitTracker />
            <PageTransition transitionType="fade">
              {children}
            </PageTransition>
            <Analytics />
            <Toaster position="bottom-center" richColors={true} />
          </Suspense>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
