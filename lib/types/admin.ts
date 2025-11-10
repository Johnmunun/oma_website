/**
 * @file lib/types/admin.ts
 * @description Types et interfaces pour le panel administrateur
 * Centralise tous les types utilisés dans le CMS
 */

// ============================================================================
// TYPES UTILISATEURS ET AUTHENTIFICATION
// ============================================================================

export type UserRole = "admin" | "editor" | "contributor"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

// ============================================================================
// TYPES CONTENU DU SITE (CMS)
// ============================================================================

export interface SiteSettings {
  id: string
  logo: string
  logoAlt: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  neutralColor: string
  fontFamily: string
  fontSize: number
  footerEmail: string
  footerPhone: string
  footerAddress: string
  socialLinks: Record<string, string>
  updatedAt: Date
  updatedBy: string
}

export interface HeroSection {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundImage: string
  isActive: boolean
  updatedAt: Date
}

export interface ContentSection {
  id: string
  name: string
  title: string
  description: string
  content: string
  images: string[]
  isActive: boolean
  order: number
  updatedAt: Date
}

// ============================================================================
// TYPES ARTICLES ET ACTUALITÉS
// ============================================================================

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  author: string
  views: number
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  scheduledFor?: Date
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

// ============================================================================
// TYPES ÉVÉNEMENTS
// ============================================================================

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  startTime: string
  endTime?: string
  location: string
  eventType: "online" | "in-person" | "hybrid"
  zoomLink?: string
  youtubeLink?: string
  flyer: string
  registrationLink?: string
  capacity?: number
  registered: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// TYPES MEMBRES ET ÉQUIPES
// ============================================================================

export interface TeamMember {
  id: string
  name: string
  title: string
  role: string
  bio: string
  photo: string
  country?: string
  email?: string
  phone?: string
  socialLinks?: Record<string, string>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// TYPES FORMATIONS ET PROGRAMMES
// ============================================================================

export interface Training {
  id: string
  title: string
  description: string
  objectives: string[]
  duration: string
  modules: TrainingModule[]
  price?: number
  image: string
  registrations: number
  capacity?: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TrainingModule {
  id: string
  title: string
  description: string
  duration: string
  content: string
}

export interface TrainingRegistration {
  id: string
  trainingId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  company?: string
  registeredAt: Date
  status: "pending" | "confirmed" | "attended" | "cancelled"
}

// ============================================================================
// TYPES TÉMOIGNAGES
// ============================================================================

export interface Testimonial {
  id: string
  author: string
  role: string
  content: string
  rating: number
  photo: string
  trainingId?: string
  isApproved: boolean
  isPublished: boolean
  createdAt: Date
}

// ============================================================================
// TYPES PARTENAIRES
// ============================================================================

export interface Partner {
  id: string
  name: string
  logo: string
  website?: string
  description?: string
  category: string
  isSponsor: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// TYPES MÉDIAS
// ============================================================================

export interface MediaFile {
  id: string
  name: string
  url: string
  type: "image" | "video" | "pdf" | "document"
  size: number
  category?: string
  uploadedAt: Date
  uploadedBy: string
}

// ============================================================================
// TYPES ANALYTICS
// ============================================================================

export interface Analytics {
  totalArticles: number
  totalEvents: number
  totalTrainings: number
  totalRegistrations: number
  totalVisitors: number
  weeklyVisitors: number[]
  monthlyRegistrations: number[]
  topEvents: Event[]
  topArticles: Article[]
}

// ============================================================================
// TYPES FORMULAIRES ET MESSAGES
// ============================================================================

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  repliedAt?: Date
  createdAt: Date
}

export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: Date
  status: "pending" | "reviewed" | "processed"
}

// ============================================================================
// TYPES LOGS ET SÉCURITÉ
// ============================================================================

export interface ActivityLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string
  changes?: Record<string, any>
  timestamp: Date
}

export interface BackupLog {
  id: string
  backupName: string
  backupDate: Date
  size: number
  status: "completed" | "failed"
  restoredAt?: Date
}
