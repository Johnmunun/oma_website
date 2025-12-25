/**
 * @file types/next-auth.d.ts
 * @description Extensions de types pour NextAuth.js
 * Permet d'ajouter des propriétés personnalisées à session.user
 */

import 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    email: string
  }
}

