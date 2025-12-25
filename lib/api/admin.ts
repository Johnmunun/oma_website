/**
 * @file lib/api/admin.ts
 * @description Client API pour l'administration avec gestion des requêtes
 * Centralise tous les appels API backend pour le panel admin
 */

import type {
  SiteSettings,
  Article,
  Event,
  TeamMember,
  Training,
  TrainingRegistration,
  AdminUser,
  Analytics,
  ContactMessage,
  ActivityLog,
  Partner,
  Testimonial,
  MediaFile,
} from "@/lib/types/admin"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// ============================================================================
// UTILITAIRES D'API
// ============================================================================

/**
 * Effectue une requête fetch avec gestion d'erreurs centralisée
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}/api${endpoint}`
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ============================================================================
// GESTION DES PARAMÈTRES DU SITE
// ============================================================================

export const siteSettingsApi = {
  /**
   * Récupère les paramètres du site
   */
  getSettings: () => apiRequest<SiteSettings>("/admin/site-settings"),

  /**
   * Met à jour les paramètres du site
   * @todo Implémenter la validation des couleurs et polices côté backend
   */
  updateSettings: (data: Partial<SiteSettings>) =>
    apiRequest<SiteSettings>("/admin/site-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Télécharge un logo
   * @todo Implémenter la validation du fichier (taille, format)
   */
  uploadLogo: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiRequest<{ url: string }>("/admin/site-settings/logo", {
      method: "POST",
      body: formData,
      headers: {}, // Les headers Content-Type seront définis automatiquement
    })
  },
}

// ============================================================================
// GESTION DES ARTICLES
// ============================================================================

export const articlesApi = {
  /**
   * Récupère tous les articles avec pagination
   */
  getAll: (page = 1, limit = 10) =>
    apiRequest<{ articles: Article[]; total: number }>(`/admin/articles?page=${page}&limit=${limit}`),

  /**
   * Récupère un article par ID
   */
  getById: (id: string) => apiRequest<Article>(`/admin/articles/${id}`),

  /**
   * Crée un nouvel article
   * @todo Implémenter la génération automatique du slug
   * @todo Ajouter la validation SEO
   */
  create: (data: Omit<Article, "id" | "createdAt" | "updatedAt">) =>
    apiRequest<Article>("/admin/articles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Met à jour un article
   */
  update: (id: string, data: Partial<Article>) =>
    apiRequest<Article>(`/admin/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Supprime un article
   */
  delete: (id: string) => apiRequest<void>(`/admin/articles/${id}`, { method: "DELETE" }),

  /**
   * Planifie la publication d'un article
   */
  schedule: (id: string, scheduledFor: Date) =>
    apiRequest<Article>(`/admin/articles/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledFor }),
    }),

  /**
   * Publie un article immédiatement
   */
  publish: (id: string) => apiRequest<Article>(`/admin/articles/${id}/publish`, { method: "POST" }),

  /**
   * Dépublie un article
   */
  unpublish: (id: string) => apiRequest<Article>(`/admin/articles/${id}/unpublish`, { method: "POST" }),
}

// ============================================================================
// GESTION DES ÉVÉNEMENTS
// ============================================================================

export const eventsApi = {
  /**
   * Récupère tous les événements
   */
  getAll: (page = 1, limit = 10) =>
    apiRequest<{ events: Event[]; total: number }>(`/admin/events?page=${page}&limit=${limit}`),

  /**
   * Récupère un événement par ID
   */
  getById: (id: string) => apiRequest<Event>(`/admin/events/${id}`),

  /**
   * Crée un nouvel événement
   * @todo Ajouter la validation des dates (date fin > date début)
   */
  create: (data: Omit<Event, "id" | "createdAt" | "updatedAt">) =>
    apiRequest<Event>("/admin/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Met à jour un événement
   */
  update: (id: string, data: Partial<Event>) =>
    apiRequest<Event>(`/admin/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Supprime un événement
   */
  delete: (id: string) => apiRequest<void>(`/admin/events/${id}`, { method: "DELETE" }),

  /**
   * Télécharge un flyer
   */
  uploadFlyer: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiRequest<{ url: string }>("/admin/events/flyer", {
      method: "POST",
      body: formData,
      headers: {},
    })
  },

  /**
   * Publie un événement
   */
  publish: (id: string) => apiRequest<Event>(`/admin/events/${id}/publish`, { method: "POST" }),

  /**
   * Dépublie un événement
   */
  unpublish: (id: string) => apiRequest<Event>(`/admin/events/${id}/unpublish`, { method: "POST" }),
}

// ============================================================================
// GESTION DES FORMATIONS
// ============================================================================

export const trainingsApi = {
  /**
   * Récupère toutes les formations
   */
  getAll: (page = 1, limit = 10) =>
    apiRequest<{ trainings: Training[]; total: number }>(`/admin/trainings?page=${page}&limit=${limit}`),

  /**
   * Récupère une formation par ID
   */
  getById: (id: string) => apiRequest<Training>(`/admin/trainings/${id}`),

  /**
   * Crée une nouvelle formation
   * @todo Implémenter la validation des modules
   */
  create: (data: Omit<Training, "id" | "createdAt" | "updatedAt">) =>
    apiRequest<Training>("/admin/trainings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Met à jour une formation
   */
  update: (id: string, data: Partial<Training>) =>
    apiRequest<Training>(`/admin/trainings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Supprime une formation
   */
  delete: (id: string) => apiRequest<void>(`/admin/trainings/${id}`, { method: "DELETE" }),

  /**
   * Récupère les inscriptions pour une formation
   */
  getRegistrations: (trainingId: string, page = 1, limit = 50) =>
    apiRequest<{ registrations: TrainingRegistration[]; total: number }>(
      `/admin/trainings/${trainingId}/registrations?page=${page}&limit=${limit}`,
    ),

  /**
   * Exporte les inscriptions en CSV
   */
  exportRegistrations: (trainingId: string) =>
    fetch(`${API_URL}/api/admin/trainings/${trainingId}/registrations/export`).then((r) => r.blob()),
}

// ============================================================================
// GESTION DES MEMBRES
// ============================================================================

export const membersApi = {
  /**
   * Récupère tous les membres
   */
  getAll: (page = 1, limit = 20) =>
    apiRequest<{ members: TeamMember[]; total: number }>(`/admin/members?page=${page}&limit=${limit}`),

  /**
   * Crée un nouveau membre
   */
  create: (data: Omit<TeamMember, "id" | "createdAt" | "updatedAt">) =>
    apiRequest<TeamMember>("/admin/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Met à jour un membre
   */
  update: (id: string, data: Partial<TeamMember>) =>
    apiRequest<TeamMember>(`/admin/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Supprime un membre
   */
  delete: (id: string) => apiRequest<void>(`/admin/members/${id}`, { method: "DELETE" }),
}

// ============================================================================
// GESTION DES UTILISATEURS
// ============================================================================

export const usersApi = {
  /**
   * Récupère tous les utilisateurs admin
   */
  getAll: () => apiRequest<AdminUser[]>("/admin/users"),

  /**
   * Crée un nouvel utilisateur admin
   * @todo Implémenter l'envoi d'email avec lien de confirmation
   */
  create: (data: Omit<AdminUser, "id" | "createdAt">) =>
    apiRequest<AdminUser>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Met à jour un utilisateur
   */
  update: (id: string, data: Partial<AdminUser>) =>
    apiRequest<AdminUser>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Supprime un utilisateur
   */
  delete: (id: string) => apiRequest<void>(`/admin/users/${id}`, { method: "DELETE" }),

  /**
   * Réinitialise le mot de passe d'un utilisateur
   * @todo Implémenter l'envoi d'email avec token réinitialisable
   */
  resetPassword: (id: string) => apiRequest<void>(`/admin/users/${id}/reset-password`, { method: "POST" }),
}

// ============================================================================
// GESTION DES MÉDIAS
// ============================================================================

export const mediaApi = {
  /**
   * Récupère tous les fichiers médias
   */
  getAll: (category?: string) => apiRequest<MediaFile[]>(`/admin/media${category ? `?category=${category}` : ""}`),

  /**
   * Télécharge un fichier média
   * @todo Implémenter la validation du type et de la taille
   */
  upload: (file: File, category?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    if (category) formData.append("category", category)

    return apiRequest<MediaFile>("/admin/media/upload", {
      method: "POST",
      body: formData,
      headers: {},
    })
  },

  /**
   * Supprime un fichier média
   */
  delete: (id: string) => apiRequest<void>(`/admin/media/${id}`, { method: "DELETE" }),
}

// ============================================================================
// GESTION DES TÉMOIGNAGES
// ============================================================================

export const testimonialsApi = {
  /**
   * Récupère tous les témoignages
   */
  getAll: (page = 1, limit = 20) =>
    apiRequest<{ testimonials: Testimonial[]; total: number }>(`/admin/testimonials?page=${page}&limit=${limit}`),

  /**
   * Crée un nouveau témoignage
   */
  create: (data: Omit<Testimonial, "id" | "createdAt">) =>
    apiRequest<Testimonial>("/admin/testimonials", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Approuve un témoignage
   */
  approve: (id: string) =>
    apiRequest<Testimonial>(`/admin/testimonials/${id}/approve`, {
      method: "POST",
    }),

  /**
   * Publie un témoignage
   */
  publish: (id: string) =>
    apiRequest<Testimonial>(`/admin/testimonials/${id}/publish`, {
      method: "POST",
    }),

  /**
   * Supprime un témoignage
   */
  delete: (id: string) => apiRequest<void>(`/admin/testimonials/${id}`, { method: "DELETE" }),
}

// ============================================================================
// GESTION DES PARTENAIRES
// ============================================================================

export const partnersApi = {
  /**
   * Récupère tous les partenaires
   */
  getAll: () => apiRequest<Partner[]>("/admin/partners"),

  /**
   * Crée un nouveau partenaire
   */
  create: (data: Omit<Partner, "id" | "createdAt" | "updatedAt">) =>
    apiRequest<Partner>("/admin/partners", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Met à jour un partenaire
   */
  update: (id: string, data: Partial<Partner>) =>
    apiRequest<Partner>(`/admin/partners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Supprime un partenaire
   */
  delete: (id: string) => apiRequest<void>(`/admin/partners/${id}`, { method: "DELETE" }),
}

// ============================================================================
// ANALYTICS
// ============================================================================

export const analyticsApi = {
  /**
   * Récupère les statistiques du tableau de bord
   */
  getDashboard: () => apiRequest<Analytics>("/admin/analytics/dashboard"),

  /**
   * Récupère les statistiques détaillées par période
   */
  getStats: (startDate: Date, endDate: Date) =>
    apiRequest<any>("/admin/analytics/stats", {
      method: "POST",
      body: JSON.stringify({ startDate, endDate }),
    }),
}

// ============================================================================
// GESTION DES MESSAGES ET FORMULAIRES
// ============================================================================

export const contactApi = {
  /**
   * Récupère tous les messages de contact
   */
  getMessages: (page = 1, limit = 20) =>
    apiRequest<{ messages: ContactMessage[]; total: number }>(`/admin/contact?page=${page}&limit=${limit}`),

  /**
   * Marque un message comme lu
   */
  markAsRead: (id: string) => apiRequest<ContactMessage>(`/admin/contact/${id}/read`, { method: "POST" }),

  /**
   * Supprime un message
   */
  delete: (id: string) => apiRequest<void>(`/admin/contact/${id}`, { method: "DELETE" }),
}

// ============================================================================
// LOGS ET SÉCURITÉ
// ============================================================================

export const securityApi = {
  /**
   * Récupère l'historique des modifications
   */
  getActivityLogs: (page = 1, limit = 50) =>
    apiRequest<{ logs: ActivityLog[]; total: number }>(`/admin/security/logs?page=${page}&limit=${limit}`),

  /**
   * Crée une sauvegarde manuelle
   * @todo Implémenter la sauvegarde Supabase avec timestamp
   */
  createBackup: () =>
    apiRequest<{ backupId: string }>("/admin/security/backup", {
      method: "POST",
    }),

  /**
   * Restaure une sauvegarde
   * @todo Implémenter la confirmation utilisateur avant restauration
   */
  restoreBackup: (backupId: string) =>
    apiRequest<void>(`/admin/security/backup/${backupId}/restore`, {
      method: "POST",
    }),

  /**
   * Récupère l'historique des sessions
   */
  getSessions: () => apiRequest<any[]>("/admin/security/sessions"),
}
