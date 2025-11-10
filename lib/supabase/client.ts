/**
 * @file lib/supabase/client.ts
 * @description DEPRECATED - Ce fichier n'est plus utilisé après migration vers NextAuth
 * Conservé temporairement pour référence, peut être supprimé
 * 
 * Migration: Supabase → NextAuth + Prisma + Neon
 */

// Ce fichier est désactivé car nous utilisons maintenant NextAuth
// Pour l'authentification, utilisez useSession() de next-auth/react
// Pour les données, utilisez Prisma avec Neon PostgreSQL

// import { createBrowserClient } from '@supabase/ssr'
// 
// export function getSupabaseBrowserClient() {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
//   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   return createBrowserClient(supabaseUrl, supabaseAnonKey)
// }

export {} // Fichier vide pour éviter les erreurs d'import
