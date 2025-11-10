/**
 * @file app/api/auth/[...nextauth]/route.ts
 * @description Configuration NextAuth.js avec PrismaAdapter
 * Supporte Credentials et Google OAuth
 */

import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import { NextRequest } from 'next/server'

// Vérifier que NEXTAUTH_SECRET est défini
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('[NextAuth] NEXTAUTH_SECRET n\'est pas défini. L\'authentification peut ne pas fonctionner correctement.')
}

// Vérifier et définir NEXTAUTH_URL si non défini (pour le développement)
if (!process.env.NEXTAUTH_URL) {
  // En développement, utiliser localhost:3000 par défaut
  if (process.env.NODE_ENV === 'development') {
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    console.warn('[NextAuth] NEXTAUTH_URL non défini, utilisation de http://localhost:3000 par défaut')
  } else {
    console.error('[NextAuth] NEXTAUTH_URL doit être défini en production!')
  }
}

const config = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Provider Credentials (email/password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        try {
          // Chercher l'utilisateur dans la base de données
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user || !user.password) {
            throw new Error('Identifiants invalides')
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Identifiants invalides')
          }

          // Vérifier si le compte est actif
          if (!user.isActive) {
            throw new Error('Compte désactivé')
          }

          // Mettre à jour la date de dernière connexion
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error('[NextAuth] Erreur authentification:', error)
          throw error
        }
      },
    }),

    // Provider Google OAuth (optionnel)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Lors de la première connexion, ajouter les infos utilisateur au token
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'EDITOR'
        token.email = user.email
      }

      // Si on met à jour la session, recharger depuis la DB
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
          // Continuer avec les valeurs existantes en cas d'erreur
        }
      }

      return token
    },
    async session({ session, token }) {
      // Ajouter les infos au session.user
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || 'EDITOR'
        session.user.email = token.email as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Callback pour Google OAuth - créer l'utilisateur s'il n'existe pas
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Créer un nouvel utilisateur avec Google
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                role: 'EDITOR', // Par défaut EDITOR, peut être changé manuellement
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

export const { handlers, auth, signIn, signOut } = NextAuth(config)

// Export pour les routes API avec gestion d'erreur robuste
export async function GET(request: NextRequest) {
  try {
    return await handlers.GET(request)
  } catch (error: any) {
    console.error('[NextAuth] Erreur GET:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur d\'authentification',
        message: error?.message || 'Une erreur est survenue'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handlers.POST(request)
  } catch (error: any) {
    console.error('[NextAuth] Erreur POST:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur d\'authentification',
        message: error?.message || 'Une erreur est survenue'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

