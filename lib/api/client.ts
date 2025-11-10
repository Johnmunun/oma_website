// ============================================
// CLIENT API POUR LES REQUÊTES FRONTEND
// ============================================
// Centralise tous les appels API du frontend vers le backend
// Facilite la maintenance et les modifications futures

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Fonction utilitaire pour les requêtes HTTP
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

// Types déclarés
type Event = {
  id: string
  created_at: string
  updated_at: string
  // autres propriétés de l'événement
}

type Formation = {
  id: string
  created_at: string
  updated_at: string
  // autres propriétés de la formation
}

type FormationRegistration = {
  id: string
  registration_date: string
  status: string
  // autres propriétés de l'inscription
}

// ============================================
// ENDPOINTS POUR LES PARAMÈTRES DU SITE
// ============================================
export const siteSettingsApi = {
  // Récupérer les paramètres du site (logo, couleurs, polices)
  getSettings: async () => apiCall("/site-settings", { method: "GET" }),

  // Mettre à jour les paramètres du site (Réservé ADMIN)
  updateSettings: async (settings: Partial<Record<string, any>>) =>
    apiCall("/site-settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
}

// ============================================
// ENDPOINTS POUR LES ÉVÉNEMENTS
// ============================================
export const eventsApi = {
  // Récupérer tous les événements
  getAll: async () => apiCall("/events", { method: "GET" }),

  // Récupérer un événement spécifique
  getById: async (id: string) => apiCall(`/events/${id}`, { method: "GET" }),

  // Créer un événement (Réservé ADMIN)
  create: async (event: Omit<Event, "id" | "created_at" | "updated_at">) =>
    apiCall("/events", {
      method: "POST",
      body: JSON.stringify(event),
    }),

  // Mettre à jour un événement (Réservé ADMIN)
  update: async (id: string, event: Partial<Event>) =>
    apiCall(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    }),

  // Supprimer un événement (Réservé ADMIN)
  delete: async (id: string) => apiCall(`/events/${id}`, { method: "DELETE" }),
}

// ============================================
// ENDPOINTS POUR LES FORMATIONS
// ============================================
export const formationsApi = {
  // Récupérer toutes les formations
  getAll: async () => apiCall("/formations", { method: "GET" }),

  // Récupérer une formation spécifique
  getById: async (id: string) => apiCall(`/formations/${id}`, { method: "GET" }),

  // Créer une formation (Réservé ADMIN)
  create: async (formation: Omit<Formation, "id" | "created_at" | "updated_at">) =>
    apiCall("/formations", {
      method: "POST",
      body: JSON.stringify(formation),
    }),

  // Mettre à jour une formation (Réservé ADMIN)
  update: async (id: string, formation: Partial<Formation>) =>
    apiCall(`/formations/${id}`, {
      method: "PUT",
      body: JSON.stringify(formation),
    }),

  // Supprimer une formation (Réservé ADMIN)
  delete: async (id: string) => apiCall(`/formations/${id}`, { method: "DELETE" }),
}

// ============================================
// ENDPOINTS POUR LES INSCRIPTIONS AUX FORMATIONS
// ============================================
export const registrationsApi = {
  // Créer une nouvelle inscription aux formations
  create: async (registration: Omit<FormationRegistration, "id" | "registration_date" | "status">) =>
    apiCall("/registrations", {
      method: "POST",
      body: JSON.stringify(registration),
    }),

  // Récupérer les inscriptions (Réservé ADMIN)
  getAll: async () => apiCall("/registrations", { method: "GET" }),

  // Récupérer les inscriptions pour une formation spécifique (Réservé ADMIN)
  getByFormation: async (formationId: string) => apiCall(`/registrations/formation/${formationId}`, { method: "GET" }),

  // Mettre à jour le statut d'une inscription (Réservé ADMIN)
  updateStatus: async (id: string, status: FormationRegistration["status"]) =>
    apiCall(`/registrations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
}

// ============================================
// ENDPOINTS POUR LES SECTIONS DE CONTENU
// ============================================
export const contentApi = {
  // Récupérer une section de contenu
  getSection: async (sectionKey: string) => apiCall(`/content/${sectionKey}`, { method: "GET" }),

  // Mettre à jour une section de contenu (Réservé ADMIN)
  updateSection: async (sectionKey: string, content: Record<string, any>) =>
    apiCall(`/content/${sectionKey}`, {
      method: "PUT",
      body: JSON.stringify(content),
    }),
}
