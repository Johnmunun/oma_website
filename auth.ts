/**
 * @file auth.ts
 * @description Configuration NextAuth.js — export centralisé (hors route handler)
 */

import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { UserRole } from '@prisma/client'
import type { NextAuthConfig } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    '[NextAuth] ERREUR CRITIQUE: NEXTAUTH_SECRET n\'est pas défini. L\'authentification ne fonctionnera pas!'
  )
}

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.AUTH_URL) return process.env.AUTH_URL
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || '3000'
    return `http://localhost:${port}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

if (!process.env.NEXTAUTH_URL) {
  const baseUrl = getBaseUrl()
  process.env.NEXTAUTH_URL = baseUrl
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[NextAuth] NEXTAUTH_URL non défini, utilisation de ${baseUrl} par défaut`)
  } else {
    console.warn(`[NextAuth] NEXTAUTH_URL non défini, utilisation de ${baseUrl} (détecté automatiquement)`)
  }
}

console.log('[NextAuth] Configuration:', {
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  url: process.env.NEXTAUTH_URL,
  trustHost: process.env.AUTH_TRUST_HOST !== 'false',
  nodeEnv: process.env.NODE_ENV,
})

export const authConfig = {
  trustHost: process.env.AUTH_TRUST_HOST !== 'false',
  adapter: PrismaAdapter(prisma) as NextAuthConfig['adapter'],
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('[NextAuth] Credentials manquants')
          throw new Error('Email et mot de passe requis')
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user || !user.password) {
            throw new Error('Identifiants invalides')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) throw new Error('Identifiants invalides')
          if (!user.isActive) throw new Error('Compte désactivé')

          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })
          } catch (updateError) {
            console.warn('[NextAuth] Erreur mise à jour lastLoginAt (non bloquant):', updateError)
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error: unknown) {
          console.error('[NextAuth] Erreur authentification:', error)
          throw error
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: UserRole }).role || 'EDITOR'
        token.email = user.email
      }

      if (trigger === 'update') {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.email = dbUser.email
          }
        } catch (error) {
          console.error('[NextAuth] Erreur lors de la mise à jour du token:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as UserRole) || 'EDITOR'
        session.user.email = token.email as string
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                role: 'EDITOR',
                isActive: true,
              },
            })
          }
        } catch (error) {
          console.error('[NextAuth] Erreur création utilisateur Google:', error)
          return false
        }
      }
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
