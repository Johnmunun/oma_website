/**
 * @file components/providers/session-provider.tsx
 * @description Provider NextAuth — refetch désactivé pour ne pas spammer /api/auth/session
 */

"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export function NextAuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  )
}
