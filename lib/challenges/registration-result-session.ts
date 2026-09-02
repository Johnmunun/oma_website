export type ChallengeRegistrationResultType = 'success' | 'error'

export type ChallengeRegistrationResult = {
  type: ChallengeRegistrationResultType
  message: string
  fullName?: string
  email?: string
  candidateCode?: string
  challengeName: string
  structureName: string
  timestamp: number
}

const STORAGE_KEY = 'oma_challenge_registration_result'
const TTL_MS = 15 * 60 * 1000

const DEFAULT_SUCCESS_MESSAGE =
  'Inscription enregistrée avec succès. Notre équipe vous contactera après validation.'

export function saveRegistrationResult(
  result: Omit<ChallengeRegistrationResult, 'timestamp'>
): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...result, timestamp: Date.now() })
    )
  } catch {
    // sessionStorage indisponible — repli via paramètres URL
  }
}

export function readRegistrationResult(
  expectedType?: ChallengeRegistrationResultType
): ChallengeRegistrationResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ChallengeRegistrationResult
    if (!parsed?.type || !parsed.message || !parsed.timestamp) return null
    if (Date.now() - parsed.timestamp > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    if (expectedType && parsed.type !== expectedType) return null
    return parsed
  } catch {
    return null
  }
}

export function clearRegistrationResult(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export type RegistrationResultUrlParams = {
  name?: string
  email?: string
  code?: string
  msg?: string
}

/** Construit l'URL de résultat avec repli query string (sessionStorage peut être perdu au redirect). */
export function buildRegistrationResultUrl(
  basePath: string,
  result: Omit<ChallengeRegistrationResult, 'timestamp' | 'challengeName' | 'structureName'>
): string {
  const params = new URLSearchParams()
  if (result.fullName) params.set('name', result.fullName)
  if (result.email) params.set('email', result.email)
  if (result.candidateCode) params.set('code', result.candidateCode)
  if (result.type === 'error' && result.message) {
    params.set('msg', result.message.slice(0, 500))
  }
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function parseRegistrationResultFromUrl(
  params: RegistrationResultUrlParams,
  expectedType: ChallengeRegistrationResultType
): ChallengeRegistrationResult | null {
  if (expectedType === 'success') {
    const fullName = params.name?.trim()
    const email = params.email?.trim()
    const candidateCode = params.code?.trim()
    if (!fullName && !email && !candidateCode) return null

    return {
      type: 'success',
      message: DEFAULT_SUCCESS_MESSAGE,
      fullName: fullName || undefined,
      email: email || undefined,
      candidateCode: candidateCode || undefined,
      challengeName: '',
      structureName: '',
      timestamp: Date.now(),
    }
  }

  const message = params.msg?.trim()
  if (!message) return null

  return {
    type: 'error',
    message,
    fullName: params.name?.trim() || undefined,
    email: params.email?.trim() || undefined,
    challengeName: '',
    structureName: '',
    timestamp: Date.now(),
  }
}
