'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Hash,
  Home,
  Mail,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChallengeRegistrationShell } from '@/components/structures/challenge-registration-shell'
import type { PublicChallengeRegistrationPage } from '@/lib/challenges/load-public-challenge-registration'
import {
  clearRegistrationResult,
  parseRegistrationResultFromUrl,
  readRegistrationResult,
  type ChallengeRegistrationResult,
  type ChallengeRegistrationResultType,
  type RegistrationResultUrlParams,
} from '@/lib/challenges/registration-result-session'
import {
  getChallengeRegistrationPath,
} from '@/lib/structures/public-url'

interface ChallengeRegistrationResultPageProps {
  data: PublicChallengeRegistrationPage
  expectedType: ChallengeRegistrationResultType
  urlParams?: RegistrationResultUrlParams
}

export function ChallengeRegistrationResultPage({
  data,
  expectedType,
  urlParams = {},
}: ChallengeRegistrationResultPageProps) {
  const router = useRouter()
  const [result, setResult] = useState<ChallengeRegistrationResult | null>(null)
  const [ready, setReady] = useState(false)
  const resolvedRef = useRef(false)

  const { structure, challenge, contactSlug } = data
  const formPath = getChallengeRegistrationPath(structure, challenge.slug)
  const landingPath = `/s/${contactSlug}`

  useEffect(() => {
    if (resolvedRef.current) return

    const stored = readRegistrationResult(expectedType)
    const fromUrl = parseRegistrationResultFromUrl(urlParams, expectedType)
    const resolved = stored ?? fromUrl

    if (!resolved) {
      router.replace(formPath)
      return
    }

    resolvedRef.current = true
    setResult(resolved)
    setReady(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    return () => {
      clearRegistrationResult()
    }
  }, [expectedType, formPath, router, urlParams])

  if (!ready || !result) {
    return (
      <ChallengeRegistrationShell data={data} backHref={formPath} backLabel="Formulaire">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--st-primary)]"
            aria-hidden
          />
        </div>
      </ChallengeRegistrationShell>
    )
  }

  const isSuccess = expectedType === 'success'

  return (
    <ChallengeRegistrationShell
      data={data}
      backHref={isSuccess ? landingPath : formPath}
      backLabel={isSuccess ? 'Accueil' : 'Réessayer'}
    >
      <div className="mx-auto max-w-xl text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: isSuccess ? 'var(--st-primary-soft)' : 'rgb(254 242 242)',
            color: isSuccess ? 'var(--st-primary-dark)' : 'rgb(185 28 28)',
          }}
        >
          {isSuccess ? (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Inscription reçue
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5" />
              Inscription non enregistrée
            </>
          )}
        </span>

        <div
          className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl"
          style={
            isSuccess
              ? {
                  backgroundImage:
                    'linear-gradient(to bottom right, var(--st-primary), var(--st-primary-dark))',
                }
              : {
                  backgroundColor: 'rgb(254 226 226)',
                }
          }
        >
          {isSuccess ? (
            <CheckCircle2 className="h-10 w-10 text-white" />
          ) : (
            <AlertCircle className="h-10 w-10 text-red-600" />
          )}
        </div>

        <h1 className="mt-8 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
          {isSuccess ? 'Merci pour votre inscription !' : 'Impossible d\'enregistrer votre inscription'}
        </h1>

        <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">{result.message}</p>

        <div
          className="mt-8 rounded-2xl border bg-white p-6 text-left shadow-sm"
          style={{
            borderColor: isSuccess
              ? 'rgba(var(--st-primary-rgb), 0.15)'
              : 'rgb(254 202 202)',
          }}
        >
          <p className="text-sm font-semibold text-slate-800">{challenge.name}</p>
          <p className="mt-1 text-sm text-slate-500">Organisé par {structure.name}</p>

          {result.fullName && (
            <p className="mt-4 text-sm text-slate-700">
              Candidat : <strong>{result.fullName}</strong>
            </p>
          )}
          {result.email && (
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 shrink-0" />
              {result.email}
            </p>
          )}

          {isSuccess && result.candidateCode && (
            <div
              className="mt-5 flex items-start gap-3 rounded-xl border p-4"
              style={{
                borderColor: 'rgba(var(--st-primary-rgb), 0.2)',
                backgroundColor: 'rgba(var(--st-primary-rgb), 0.06)',
              }}
            >
              <Hash className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--st-primary)' }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Votre numéro candidat
                </p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-900">
                  {result.candidateCode}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Conservez ce code — il identifie votre candidature (suivi et fiche publique
                  après validation). Le vote public se fait par email, sans ce code.
                </p>
              </div>
            </div>
          )}

          {isSuccess ? (
            <div
              className="mt-5 flex gap-3 rounded-xl p-4 text-sm text-slate-700"
              style={{ backgroundColor: 'rgba(var(--st-primary-rgb), 0.06)' }}
            >
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--st-primary)' }} />
              <p>
                Votre dossier est <strong>en cours d&apos;examen</strong>. L&apos;équipe{' '}
                {structure.name} vous contactera par email après validation de votre candidature.
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-600">
              Vérifiez les informations saisies ou réessayez dans quelques instants. Si le problème
              persiste, contactez directement {structure.name}.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isSuccess ? (
            <Button
              asChild
              className="h-11 min-w-[200px] font-semibold text-white"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
              }}
            >
              <Link href={landingPath}>
                <Home className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                className="h-11 min-w-[200px] font-semibold text-white"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
                }}
              >
                <Link href={formPath}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réessayer l&apos;inscription
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 min-w-[200px]">
                <Link href={landingPath}>
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l&apos;accueil
                </Link>
              </Button>
            </>
          )}
        </div>

        {!isSuccess && (
          <p className="mt-6 text-xs text-slate-500">
            Besoin d&apos;aide ? Contactez directement {structure.name} depuis la page d&apos;accueil.
          </p>
        )}
      </div>
    </ChallengeRegistrationShell>
  )
}
