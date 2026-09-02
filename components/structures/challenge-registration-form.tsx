'use client'

import type React from 'react'
import { useState } from 'react'
import 'sweetalert2/dist/sweetalert2.min.css'
import { Send, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ChallengeRegistrationSettings } from '@/lib/challenges/challenge-registration-settings'
import {
  DEFAULT_CHALLENGE_REGISTRATION_SETTINGS,
  hasParentSection,
  isParentSectionRequired,
} from '@/lib/challenges/challenge-registration-settings'
import {
  showRegistrationErrorSwal,
  showRegistrationSuccessSwal,
} from '@/lib/challenges/show-registration-swal'

interface ChallengeRegistrationFormProps {
  structureName: string
  contactSlug: string
  challengeSlug: string
  challengeName: string
  registrationSettings?: ChallengeRegistrationSettings
  structure?: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
  variant?: 'embedded' | 'page'
}

export function ChallengeRegistrationForm({
  structureName,
  contactSlug,
  challengeSlug,
  challengeName,
  registrationSettings = DEFAULT_CHALLENGE_REGISTRATION_SETTINGS,
  structure,
  variant = 'embedded',
}: ChallengeRegistrationFormProps) {
  const settings = registrationSettings
  const isPage = variant === 'page'
  const showParent = hasParentSection(settings)
  const parentRequired = isParentSectionRequired(settings)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    city: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      age: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      city: '',
      notes: '',
    })
  }

  const ageHint =
    settings.age.enabled && (settings.age.min != null || settings.age.max != null)
      ? [
          settings.age.min != null ? `min. ${settings.age.min} ans` : null,
          settings.age.max != null ? `max. ${settings.age.max} ans` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null

  const cityHint =
    settings.city.enabled && (settings.city.allowedCities?.length ?? 0) > 0
      ? `Villes acceptées : ${settings.city.allowedCities.join(', ')}`
      : null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
      }

      if (settings.phone.enabled) {
        payload.phone = formData.phone.trim() || null
      }
      if (settings.age.enabled) {
        payload.age = formData.age ? Number.parseInt(formData.age, 10) : null
      }
      if (settings.city.enabled) {
        payload.city = formData.city.trim() || null
      }
      if (settings.parentName.enabled) {
        payload.parentName = formData.parentName.trim() || null
      }
      if (settings.parentEmail.enabled) {
        payload.parentEmail = formData.parentEmail.trim() || null
      }
      if (settings.parentPhone.enabled) {
        payload.parentPhone = formData.parentPhone.trim() || null
      }
      if (settings.notes.enabled) {
        payload.notes = formData.notes.trim() || null
      }

      const res = await fetch(
        `/api/structures/${encodeURIComponent(contactSlug)}/challenges/${encodeURIComponent(challengeSlug)}/candidates`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()
      if (!res.ok || !data.success) {
        const errorMessage = data.error || 'Erreur lors de l\'inscription'
        await showRegistrationErrorSwal({ message: errorMessage })
        return
      }

      const successMessage =
        data.message || 'Inscription enregistrée avec succès. Notre équipe vous contactera après validation.'
      const candidateCode =
        typeof data.data?.candidateCode === 'string' ? data.data.candidateCode : undefined

      await showRegistrationSuccessSwal({
        message: successMessage,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        candidateCode,
        challengeName,
        structureName,
      })
      resetForm()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue.'
      await showRegistrationErrorSwal({ message: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('text-left', isPage ? 'mx-auto max-w-2xl' : 'mx-auto max-w-2xl')}>
      <div
        className={cn(
          'space-y-5 rounded-2xl border bg-white p-6 md:p-8',
          isPage
            ? 'border-slate-200/80 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100'
            : 'border-slate-200 shadow-sm'
        )}
      >
        {!isPage && (
          <p className="text-sm text-slate-600">
            Inscription au challenge <strong>{challengeName}</strong> — {structureName}
          </p>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <UserRound className="h-4 w-4" style={{ color: 'var(--st-primary)' }} />
            Informations du candidat
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="candidate-full-name" className="text-sm font-medium text-slate-700">
                Nom complet *
              </label>
              <Input
                id="candidate-full-name"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Ex. Amina Kouassi"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="candidate-email" className="text-sm font-medium text-slate-700">
                Email *
              </label>
              <Input
                id="candidate-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="candidat@email.com"
                required
                className="h-11"
              />
            </div>
            {settings.age.enabled && (
              <div className="space-y-1.5">
                <label htmlFor="candidate-age" className="text-sm font-medium text-slate-700">
                  Âge{settings.age.required ? ' *' : ''}
                </label>
                <Input
                  id="candidate-age"
                  type="number"
                  min={settings.age.min ?? 1}
                  max={settings.age.max ?? 120}
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder={ageHint ?? 'Ex. 12'}
                  required={settings.age.required}
                  className="h-11"
                />
                {ageHint && <p className="text-xs text-slate-500">{ageHint}</p>}
              </div>
            )}
            {settings.phone.enabled && (
              <div className="space-y-1.5">
                <label htmlFor="candidate-phone" className="text-sm font-medium text-slate-700">
                  Téléphone{settings.phone.required ? ' *' : ''}
                </label>
                <Input
                  id="candidate-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+225 07 00 00 00 00"
                  required={settings.phone.required}
                  className="h-11"
                />
              </div>
            )}
            {settings.city.enabled && (
              <div className="space-y-1.5">
                <label htmlFor="candidate-city" className="text-sm font-medium text-slate-700">
                  Ville{settings.city.required ? ' *' : ''}
                </label>
                {(settings.city.allowedCities?.length ?? 0) > 0 ? (
                  <select
                    id="candidate-city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    required={settings.city.required}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Choisir une ville</option>
                    {settings.city.allowedCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="candidate-city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Abidjan"
                    required={settings.city.required}
                    className="h-11"
                  />
                )}
                {cityHint && <p className="text-xs text-slate-500">{cityHint}</p>}
              </div>
            )}
          </div>
        </div>

        {showParent && (
          <div
            className="rounded-xl border p-4 space-y-4 md:p-5"
            style={{
              borderColor: 'rgba(var(--st-primary-rgb), 0.15)',
              backgroundColor: 'rgba(var(--st-primary-rgb), 0.04)',
            }}
          >
            <p className="text-sm font-semibold text-slate-800">
              Responsable / parent{parentRequired ? ' *' : ''}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {settings.parentName.enabled && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="candidate-parent-name" className="text-sm font-medium text-slate-700">
                    Nom complet{settings.parentName.required ? ' *' : ''}
                  </label>
                  <Input
                    id="candidate-parent-name"
                    value={formData.parentName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Ex. Marie Kouassi"
                    required={settings.parentName.required}
                    className="h-11 bg-white"
                  />
                </div>
              )}
              {settings.parentEmail.enabled && (
                <div className="space-y-1.5">
                  <label htmlFor="candidate-parent-email" className="text-sm font-medium text-slate-700">
                    Email{settings.parentEmail.required ? ' *' : ''}
                  </label>
                  <Input
                    id="candidate-parent-email"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parentEmail: e.target.value }))}
                    placeholder="parent@email.com"
                    required={settings.parentEmail.required}
                    className="h-11 bg-white"
                  />
                </div>
              )}
              {settings.parentPhone.enabled && (
                <div className="space-y-1.5">
                  <label htmlFor="candidate-parent-phone" className="text-sm font-medium text-slate-700">
                    Téléphone{settings.parentPhone.required ? ' *' : ''}
                  </label>
                  <Input
                    id="candidate-parent-phone"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parentPhone: e.target.value }))}
                    placeholder="+225 05 00 00 00 00"
                    required={settings.parentPhone.required}
                    className="h-11 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {settings.notes.enabled && (
          <div className="space-y-1.5">
            <label htmlFor="candidate-notes" className="text-sm font-medium text-slate-700">
              Parlez-nous du talent{settings.notes.required ? ' *' : ' (optionnel)'}
            </label>
            <Textarea
              id="candidate-notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Centres d'intérêt, expérience scénique, motivation pour le challenge…"
              required={settings.notes.required}
              className="resize-none"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full text-base font-semibold text-white shadow-lg sm:w-auto sm:min-w-[220px]"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--st-primary-dark), var(--st-primary))',
            boxShadow: '0 10px 30px -10px rgba(var(--st-primary-rgb), 0.5)',
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Envoi en cours…' : 'Envoyer mon inscription'}
        </Button>
      </div>
    </form>
  )
}
