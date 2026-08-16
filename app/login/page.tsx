'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { useDynamicLogo } from '@/components/theming/dynamic-logo'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/admin'
  const errorParam = params.get('error')
  const logoUrl = useDynamicLogo()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // S'assurer que le composant est monté côté client avant d'afficher le logo dynamique
  useEffect(() => {
    setMounted(true)
  }, [])

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
    <main className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-primary">
      {/* Atmosphere de fond — style OMA */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.08),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Retour accueil */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-gold transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Retour à l&apos;accueil
        </Link>

        <div className="rounded-2xl border border-gold/20 bg-card/95 backdrop-blur-xl shadow-[0_0_80px_-20px_rgba(249,115,22,0.35)] overflow-hidden">
          {/* En-tête marque */}
          <div className="relative px-8 pt-8 pb-6 text-center border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent">
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="inline-flex items-center justify-center mb-5">
              <div className="relative flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-2xl bg-primary border border-gold/30 shadow-lg ring-4 ring-gold/10">
                {mounted && logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Réseau OMA"
                    className="h-12 w-auto object-contain p-1.5"
                  />
                ) : (
                  <span className="font-serif font-bold text-lg text-gold tracking-wide">OMA</span>
                )}
              </div>
            </div>

            <p className="font-serif text-gold tracking-[0.3em] uppercase text-xs mb-2">
              Réseau OMA
            </p>
            <h1 className="font-serif text-2xl md:text-[1.65rem] font-bold text-foreground mb-1.5">
              Espace administrateur
            </h1>
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour gérer le contenu
            </p>
          </div>

          <div className="p-8">
            {errorParam === 'forbidden' && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <div className="flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Accès refusé</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Votre compte n&apos;est pas autorisé. Contactez un administrateur ou utilisez une adresse autorisée.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-background border-border/70 focus-visible:border-gold focus-visible:ring-gold/30 rounded-xl transition-colors"
                    placeholder="admin@exemple.com"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-11 h-12 bg-background border-border/70 focus-visible:border-gold focus-visible:ring-gold/30 rounded-xl transition-colors"
                    placeholder="••••••••"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  id="login-error"
                  role="alert"
                  className="flex items-start gap-2 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl"
                  aria-live="polite"
                >
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold-dark text-primary font-semibold shadow-[0_0_32px_-8px_rgba(249,115,22,0.55)] transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Connexion…
                  </span>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <p className="mt-6 text-xs text-center text-muted-foreground leading-relaxed">
              Accès réservé aux comptes administrateurs autorisés.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
