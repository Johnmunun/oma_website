import { z } from 'zod'

/** Normalise min/max âge (string JSON, NaN, vide → null) */
function normalizeOptionalAgeBound(value: unknown): number | null | undefined {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    return Math.trunc(value)
  }
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : null
}

const optionalAgeBoundSchema = z.preprocess(
  normalizeOptionalAgeBound,
  z.number().int().min(0).max(120).nullable().optional()
)

/** Configuration d'un champ optionnel du formulaire d'inscription */
export const registrationFieldConfigSchema = z.object({
  enabled: z.boolean().default(true),
  required: z.boolean().default(false),
})

export const ageFieldConfigSchema = registrationFieldConfigSchema.extend({
  min: optionalAgeBoundSchema,
  max: optionalAgeBoundSchema,
})

export const cityFieldConfigSchema = registrationFieldConfigSchema.extend({
  /** Liste blanche de villes autorisées (vide = toutes) */
  allowedCities: z.array(z.string().min(1).max(100)).default([]),
})

export const challengeRegistrationSettingsSchema = z.object({
  age: ageFieldConfigSchema.default({ enabled: true, required: false, min: null, max: null }),
  phone: registrationFieldConfigSchema.default({ enabled: true, required: false }),
  city: cityFieldConfigSchema.default({ enabled: true, required: false, allowedCities: [] }),
  parentName: registrationFieldConfigSchema.default({ enabled: true, required: true }),
  parentEmail: registrationFieldConfigSchema.default({ enabled: true, required: true }),
  parentPhone: registrationFieldConfigSchema.default({ enabled: true, required: false }),
  notes: registrationFieldConfigSchema.default({ enabled: true, required: false }),
})

export type RegistrationFieldConfig = z.infer<typeof registrationFieldConfigSchema>
export type AgeFieldConfig = z.infer<typeof ageFieldConfigSchema>
export type CityFieldConfig = z.infer<typeof cityFieldConfigSchema>
export type ChallengeRegistrationSettings = z.infer<typeof challengeRegistrationSettingsSchema>

export const DEFAULT_CHALLENGE_REGISTRATION_SETTINGS: ChallengeRegistrationSettings =
  challengeRegistrationSettingsSchema.parse({})

/** Exemple pour un challenge enfants (JoyStudio) */
export const CHILDREN_CHALLENGE_REGISTRATION_SETTINGS: ChallengeRegistrationSettings =
  challengeRegistrationSettingsSchema.parse({
    age: { enabled: true, required: true, min: 6, max: 16 },
    city: { enabled: true, required: false, allowedCities: [] },
    parentName: { enabled: true, required: true },
    parentEmail: { enabled: true, required: true },
    parentPhone: { enabled: true, required: false },
  })

export function mergeRegistrationSettings(
  partial?: Partial<ChallengeRegistrationSettings> | null
): ChallengeRegistrationSettings {
  return challengeRegistrationSettingsSchema.parse({
    ...DEFAULT_CHALLENGE_REGISTRATION_SETTINGS,
    ...partial,
    age: { ...DEFAULT_CHALLENGE_REGISTRATION_SETTINGS.age, ...partial?.age },
    phone: { ...DEFAULT_CHALLENGE_REGISTRATION_SETTINGS.phone, ...partial?.phone },
    city: { ...DEFAULT_CHALLENGE_REGISTRATION_SETTINGS.city, ...partial?.city },
    parentName: { ...DEFAULT_CHALLENGE_REGISTRATION_SETTINGS.parentName, ...partial?.parentName },
    parentEmail: { ...DEFAULT_CHALLENGE_REGISTRATION_SETTINGS.parentEmail, ...partial?.parentEmail },
    parentPhone: { ...DEFAULT_CHALLENGE_REGISTRATION_SETTINGS.parentPhone, ...partial?.parentPhone },
    notes: { ...DEFAULT_CHALLENGE_REGISTRATION_SETTINGS.notes, ...partial?.notes },
  })
}

export function parseChallengeSettings(raw: unknown): ChallengeRegistrationSettings {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_CHALLENGE_REGISTRATION_SETTINGS
  }
  const obj = raw as Record<string, unknown>
  const registration = obj.registration
  if (!registration || typeof registration !== 'object') {
    return DEFAULT_CHALLENGE_REGISTRATION_SETTINGS
  }
  return mergeRegistrationSettings(registration as Partial<ChallengeRegistrationSettings>)
}

export function parseChallengeCoverImageUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null
  const url = (raw as Record<string, unknown>).coverImageUrl
  if (typeof url !== 'string' || !url.trim()) return null
  return url.trim()
}

export function buildChallengeSettingsPayload(
  registration: ChallengeRegistrationSettings,
  coverImageUrl?: string | null
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    registration: mergeRegistrationSettings(registration),
  }
  const cover = coverImageUrl?.trim()
  if (cover) payload.coverImageUrl = cover
  return payload
}

/** Fusionne les réglages challenge en préservant ranking, votes, etc. */
export function mergeChallengeSettings(
  existingSettings: unknown,
  patch: {
    registration: ChallengeRegistrationSettings
    coverImageUrl?: string | null
  }
): Record<string, unknown> {
  const base =
    existingSettings && typeof existingSettings === 'object'
      ? { ...(existingSettings as Record<string, unknown>) }
      : {}

  const cover = patch.coverImageUrl?.trim()
  return {
    ...base,
    registration: mergeRegistrationSettings(patch.registration),
    coverImageUrl: cover || null,
  }
}

export function hasParentSection(settings: ChallengeRegistrationSettings): boolean {
  return (
    settings.parentName.enabled ||
    settings.parentEmail.enabled ||
    settings.parentPhone.enabled
  )
}

export function isParentSectionRequired(settings: ChallengeRegistrationSettings): boolean {
  return (
    (settings.parentName.enabled && settings.parentName.required) ||
    (settings.parentEmail.enabled && settings.parentEmail.required) ||
    (settings.parentPhone.enabled && settings.parentPhone.required)
  )
}

export class RegistrationValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = 'RegistrationValidationError'
  }
}

export type ValidatedPublicRegistration = {
  fullName: string
  email: string
  phone: string | null
  age: number | null
  parentName: string | null
  parentEmail: string | null
  parentPhone: string | null
  city: string | null
  notes: string | null
}

function normalizeCity(value: string): string {
  return value.trim().toLowerCase()
}

/** Valide les données d'inscription publique selon les critères du challenge */
export function validatePublicRegistration(
  data: Record<string, unknown>,
  settingsInput?: Partial<ChallengeRegistrationSettings> | null
): ValidatedPublicRegistration {
  const settings = mergeRegistrationSettings(settingsInput)

  const fullName = typeof data.fullName === 'string' ? data.fullName.trim() : ''
  if (fullName.length < 2) {
    throw new RegistrationValidationError('Nom requis (2 caractères minimum)', 'fullName')
  }
  if (fullName.length > 200) {
    throw new RegistrationValidationError('Nom trop long', 'fullName')
  }

  const emailRaw = typeof data.email === 'string' ? data.email.trim() : ''
  const emailResult = z.string().email('Email invalide').safeParse(emailRaw)
  if (!emailResult.success) {
    throw new RegistrationValidationError('Email invalide', 'email')
  }

  let phone: string | null = null
  if (settings.phone.enabled) {
    const raw = typeof data.phone === 'string' ? data.phone.trim() : ''
    if (settings.phone.required && !raw) {
      throw new RegistrationValidationError('Téléphone requis', 'phone')
    }
    if (raw) {
      if (raw.length > 30) throw new RegistrationValidationError('Téléphone trop long', 'phone')
      phone = raw
    }
  }

  let age: number | null = null
  if (settings.age.enabled) {
    const rawAge = data.age
    if (rawAge === null || rawAge === undefined || rawAge === '') {
      if (settings.age.required) {
        throw new RegistrationValidationError('Âge requis', 'age')
      }
    } else {
      const parsed = typeof rawAge === 'number' ? rawAge : Number.parseInt(String(rawAge), 10)
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 120) {
        throw new RegistrationValidationError('Âge invalide', 'age')
      }
      if (settings.age.min != null && parsed < settings.age.min) {
        throw new RegistrationValidationError(
          `Âge minimum : ${settings.age.min} ans`,
          'age'
        )
      }
      if (settings.age.max != null && parsed > settings.age.max) {
        throw new RegistrationValidationError(
          `Âge maximum : ${settings.age.max} ans`,
          'age'
        )
      }
      age = parsed
    }
  }

  let city: string | null = null
  if (settings.city.enabled) {
    const raw = typeof data.city === 'string' ? data.city.trim() : ''
    if (settings.city.required && !raw) {
      throw new RegistrationValidationError('Ville requise', 'city')
    }
    if (raw) {
      if (raw.length > 100) throw new RegistrationValidationError('Ville trop longue', 'city')
      const allowed = settings.city.allowedCities ?? []
      if (allowed.length > 0) {
        const normalized = normalizeCity(raw)
        const match = allowed.some((c) => normalizeCity(c) === normalized)
        if (!match) {
          throw new RegistrationValidationError(
            `Ville non éligible. Villes acceptées : ${allowed.join(', ')}`,
            'city'
          )
        }
      }
      city = raw
    }
  }

  let parentName: string | null = null
  if (settings.parentName.enabled) {
    const raw = typeof data.parentName === 'string' ? data.parentName.trim() : ''
    if (settings.parentName.required && !raw) {
      throw new RegistrationValidationError('Nom du responsable requis', 'parentName')
    }
    if (raw) {
      if (raw.length < 2) {
        throw new RegistrationValidationError('Nom du responsable invalide', 'parentName')
      }
      parentName = raw
    }
  }

  let parentEmail: string | null = null
  if (settings.parentEmail.enabled) {
    const raw = typeof data.parentEmail === 'string' ? data.parentEmail.trim() : ''
    if (settings.parentEmail.required && !raw) {
      throw new RegistrationValidationError('Email du responsable requis', 'parentEmail')
    }
    if (raw) {
      const result = z.string().email('Email responsable invalide').safeParse(raw)
      if (!result.success) {
        throw new RegistrationValidationError('Email responsable invalide', 'parentEmail')
      }
      parentEmail = raw
    }
  }

  let parentPhone: string | null = null
  if (settings.parentPhone.enabled) {
    const raw = typeof data.parentPhone === 'string' ? data.parentPhone.trim() : ''
    if (settings.parentPhone.required && !raw) {
      throw new RegistrationValidationError('Téléphone du responsable requis', 'parentPhone')
    }
    if (raw) {
      if (raw.length > 30) {
        throw new RegistrationValidationError('Téléphone responsable trop long', 'parentPhone')
      }
      parentPhone = raw
    }
  }

  let notes: string | null = null
  if (settings.notes.enabled) {
    const raw = typeof data.notes === 'string' ? data.notes.trim() : ''
    if (settings.notes.required && !raw) {
      throw new RegistrationValidationError('Ce champ est requis', 'notes')
    }
    if (raw) {
      if (raw.length > 2000) throw new RegistrationValidationError('Texte trop long', 'notes')
      notes = raw
    }
  }

  return {
    fullName,
    email: emailResult.data,
    phone,
    age,
    parentName,
    parentEmail,
    parentPhone,
    city,
    notes,
  }
}
