// ============================================
// TYPES ET INTERFACES POUR L'API ET LE CMS
// ============================================
// Ce fichier centralise tous les types TypeScript pour assurer la cohérence
// entre le frontend et le backend

export interface SiteSettings {
  id: string
  logo_url: string
  site_title: string
  site_description: string
  primary_color: string
  secondary_color: string
  font_family: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  image_url: string
  date: string
  location: string
  status: "upcoming" | "past"
  created_at: string
  updated_at: string
}

export interface Formation {
  id: string
  title: string
  description: string
  price: number
  duration: string
  instructor: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface FormationRegistration {
  id: string
  formation_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  country: string
  message?: string
  registration_date: string
  status: "pending" | "confirmed" | "cancelled"
}

export interface ContentSection {
  id: string
  section_name: string
  section_key: string
  title: string
  description: string
  content: Record<string, any>
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
