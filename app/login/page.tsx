'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react'
import { useDynamicLogo } from '@/components/theming/dynamic-logo'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/admin'
  const errorParam = params.get('error')
  const logoUrl = useDynamicLogo()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Validation basique
      if (!email || !password) {
        setError('Veuillez remplir tous les champs')
        setLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      // Gérer les erreurs de manière robuste
      if (result?.error) {
        const errMsg = result.error.toLowerCase()
        console.error('[Login] Erreur de connexion complète:', {
          error: result.error,
          fullResult: result,
        })
        
        if (errMsg.includes('identifiants invalides') || 
            errMsg.includes('invalid') || 
            errMsg.includes('credentials') ||
            errMsg.includes('email et mot de passe requis')) {
          setError("E-mail ou mot de passe incorrect.")
        } else if (errMsg.includes('désactivé') || 
                   errMsg.includes('disabled') || 
                   errMsg.includes('inactive') ||
                   errMsg.includes('compte désactivé')) {
          setError("Votre compte est désactivé. Contactez un administrateur.")
        } else if (errMsg.includes('json') || 
                   errMsg.includes('parse') || 
                   errMsg.includes('unexpected')) {
          setError("Erreur de communication avec le serveur. Veuillez réessayer.")
          console.error('[Login] Erreur JSON:', result.error)
        } else if (errMsg.includes('configuration') || 
                   errMsg.includes('config') ||
                   errMsg.includes('trusthost') ||
                   errMsg.includes('untrusted')) {
          setError("Erreur de configuration serveur. Contactez un administrateur.")
          console.error('[Login] Erreur de configuration:', result.error)
        } else {
          setError(`Erreur: ${result.error}. Vérifiez vos identifiants ou contactez un administrateur.`)
        }
        setLoading(false)
        return
      }

      // Vérifier le résultat
      if (result?.ok) {
        toast.success('Connexion réussie')
        // Petit délai pour s'assurer que la session est bien créée
        setTimeout(() => {
      router.push(redirect)
          router.refresh()
        }, 100)
      } else {
        setError('Une erreur inattendue est survenue.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('[Login] Erreur inattendue:', err)
      
      // Gérer différents types d'erreurs
      if (err?.message?.includes('JSON') || err?.message?.includes('parse')) {
        setError('Erreur de communication avec le serveur. Vérifiez votre connexion.')
      } else if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
        setError('Problème de connexion réseau. Vérifiez votre connexion internet.')
      } else {
        setError('Une erreur est survenue lors de la connexion. Merci de réessayer.')
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    if (errorParam !== 'forbidden' && params.get('redirect')) {
      const path = params.get('redirect') || '/admin'
      toast.info('Veuillez vous connecter pour accéder à ' + path)
    }
  }, [errorParam, params])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-400/20 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="w-full max-w-md relative">
        <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-slate-500/10 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                {logoUrl ? (
                  <div className="relative inline-flex items-center justify-center">
                    {/* Cercle blanc derrière le logo pour garantir la visibilité */}
                    <div className="absolute w-14 h-14 bg-white rounded-full shadow-md z-0" />
                    {/* Logo par-dessus */}
                    <img 
                      src={logoUrl} 
                      alt="Réseau OMA" 
                      className="h-12 w-auto object-contain relative z-10"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-lg shadow-lg">
                    OMA
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">Connexion administrateur</h1>
              <p className="text-blue-100/80 text-sm mb-1">Accédez au panneau de contrôle</p>
              <p className="text-gold font-semibold text-sm italic">We are the best</p>
            </div>
          </div>

          <div className="p-8">
        {errorParam === 'forbidden' && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Accès refusé</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Votre compte n'est pas autorisé. Contactez un administrateur ou utilisez une adresse autorisée.
                    </p>
                  </div>
            </div>
          </div>
        )}

            <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary transition-colors"
                    placeholder="admin@exemple.com"
            />
          </div>
              </div>

          <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary transition-colors"
                    placeholder="••••••••"
            />
          </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-slate-800 dark:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 shadow-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion…
                  </span>
                ) : (
                  "Se connecter"
                )}
          </Button>
        </form>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground mb-4">
          Seuls les comptes autorisés peuvent accéder au panneau d'administration.
              </p>
              <Link href="/" className="block">
                <Button variant="ghost" size="sm" className="w-full hover:bg-muted/50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à l'accueil
            </Button>
          </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
