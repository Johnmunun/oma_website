import {
  Mic,
  Calendar,
  Megaphone,
  Smartphone,
  GraduationCap,
  Users,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export const EXPERTISE_ICON_KEYS = [
  'mic',
  'calendar',
  'megaphone',
  'smartphone',
  'graduation',
  'users',
  'trending',
  'sparkles',
] as const

export type ExpertiseIconKey = (typeof EXPERTISE_ICON_KEYS)[number]

export const EXPERTISE_ICON_MAP: Record<ExpertiseIconKey, LucideIcon> = {
  mic: Mic,
  calendar: Calendar,
  megaphone: Megaphone,
  smartphone: Smartphone,
  graduation: GraduationCap,
  users: Users,
  trending: TrendingUp,
  sparkles: Sparkles,
}

export const EXPERTISE_ICON_OPTIONS: { value: ExpertiseIconKey; label: string }[] = [
  { value: 'mic', label: 'Art oratoire' },
  { value: 'calendar', label: 'Événementiel' },
  { value: 'megaphone', label: 'Communication' },
  { value: 'smartphone', label: 'Digital' },
  { value: 'graduation', label: 'Formation' },
  { value: 'users', label: 'Leadership / équipe' },
  { value: 'trending', label: 'Marketing / croissance' },
  { value: 'sparkles', label: 'Expertise / talent' },
]

export function resolveExpertiseIcon(iconKey?: string | null): LucideIcon {
  if (iconKey && iconKey in EXPERTISE_ICON_MAP) {
    return EXPERTISE_ICON_MAP[iconKey as ExpertiseIconKey]
  }
  return Mic
}
