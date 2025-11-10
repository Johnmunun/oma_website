/**
 * Hooks pour récupérer la configuration CMS
 * À intégrer avec votre API backend
 */

import { type CMSConfig, defaultCMSConfig } from "./config"

/**
 * Hook pour charger la configuration CMS depuis le backend
 *
 * @todo Remplacer par un appel API réel une fois le backend prêt
 * Endpoint suggestion: GET /api/cms/config
 *
 * @returns Configuration CMS
 */
export async function fetchCMSConfig(): Promise<CMSConfig> {
  try {
    // TODO: À implémenter - Appel API backend
    // const response = await fetch("/api/cms/config");
    // if (!response.ok) throw new Error("Erreur CMS");
    // return await response.json();

    // Pour maintenant, retourner la configuration par défaut
    return defaultCMSConfig
  } catch (error) {
    console.error("[CMS] Erreur lors du chargement de la configuration:", error)
    return defaultCMSConfig
  }
}

/**
 * Hook client pour accéder à la configuration CMS
 * Utiliser en composants client avec useEffect
 */
export function useCMSConfig() {
  // TODO: Implémenter avec SWR ou React Query
  // const { data, error, isLoading } = useSWR("/api/cms/config", fetcher);
  return defaultCMSConfig
}
