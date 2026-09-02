/**
 * Définition modulaire des permissions techniques.
 * Le développeur déclare les capacités ; l'admin les regroupe dans des rôles.
 */
export interface PermissionDef {
  key: string
  module: string
  description: string
}

export const CORE_PERMISSIONS: PermissionDef[] = [
  // ── Rôles & structures (administration ERP) ──
  { key: 'roles.view', module: 'roles', description: 'Voir les rôles' },
  { key: 'roles.create', module: 'roles', description: 'Créer des rôles' },
  { key: 'roles.update', module: 'roles', description: 'Modifier des rôles' },
  { key: 'roles.delete', module: 'roles', description: 'Supprimer des rôles' },
  { key: 'permissions.view', module: 'permissions', description: 'Voir le catalogue des permissions' },
  { key: 'structures.view', module: 'structures', description: 'Voir les structures' },
  { key: 'structures.create', module: 'structures', description: 'Créer des structures' },
  { key: 'structures.update', module: 'structures', description: 'Modifier des structures' },
  { key: 'structures.delete', module: 'structures', description: 'Supprimer des structures' },

  // ── Utilisateurs ──
  { key: 'users.view', module: 'users', description: 'Voir les utilisateurs' },
  { key: 'users.create', module: 'users', description: 'Créer des utilisateurs' },
  { key: 'users.update', module: 'users', description: 'Modifier des utilisateurs' },
  { key: 'users.delete', module: 'users', description: 'Supprimer des utilisateurs' },
  { key: 'users.assign-roles', module: 'users', description: 'Attribuer des rôles aux utilisateurs' },
  { key: 'users.manage', module: 'users', description: 'Gestion complète des utilisateurs (alias)' },

  // ── Paramètres ──
  { key: 'settings.view', module: 'settings', description: 'Voir les paramètres du site' },
  { key: 'settings.update', module: 'settings', description: 'Modifier les paramètres du site' },

  // ── Analytics ──
  { key: 'analytics.view', module: 'analytics', description: 'Voir les analytics' },
  { key: 'stats.view', module: 'analytics', description: 'Voir les statistiques du tableau de bord' },

  // ── Événements ──
  { key: 'events.view', module: 'events', description: 'Voir les événements' },
  { key: 'events.create', module: 'events', description: 'Créer des événements' },
  { key: 'events.update', module: 'events', description: 'Modifier des événements' },
  { key: 'events.delete', module: 'events', description: 'Supprimer des événements' },
  { key: 'events.publish', module: 'events', description: 'Publier des événements' },
  { key: 'events.manage', module: 'events', description: 'Gestion complète des événements (alias)' },

  // ── Médias ──
  { key: 'media.view', module: 'media', description: 'Voir la bibliothèque média' },
  { key: 'media.upload', module: 'media', description: 'Uploader des médias' },
  { key: 'media.update', module: 'media', description: 'Modifier des médias' },
  { key: 'media.delete', module: 'media', description: 'Supprimer des médias' },

  // ── Messages ──
  { key: 'messages.view', module: 'messages', description: 'Voir les messages de contact' },
  { key: 'messages.update', module: 'messages', description: 'Marquer / modifier les messages' },
  { key: 'messages.delete', module: 'messages', description: 'Supprimer des messages' },
  { key: 'messages.manage', module: 'messages', description: 'Gestion complète des messages (alias)' },

  // ── Contenu ──
  { key: 'content.view', module: 'content', description: 'Voir le contenu du site' },
  { key: 'content.update', module: 'content', description: 'Modifier le contenu du site' },
  { key: 'content.manage', module: 'content', description: 'Gestion complète du contenu (alias)' },
  { key: 'expertise.view', module: 'expertise', description: "Voir les domaines d'expertise" },
  { key: 'expertise.create', module: 'expertise', description: "Créer des domaines d'expertise" },
  { key: 'expertise.update', module: 'expertise', description: "Modifier les domaines d'expertise" },
  { key: 'expertise.delete', module: 'expertise', description: "Supprimer des domaines d'expertise" },

  // ── Équipe ──
  { key: 'team.view', module: 'team', description: "Voir l'équipe" },
  { key: 'team.create', module: 'team', description: "Ajouter des membres d'équipe" },
  { key: 'team.update', module: 'team', description: "Modifier l'équipe" },
  { key: 'team.delete', module: 'team', description: "Supprimer des membres d'équipe" },
  { key: 'team.manage', module: 'team', description: "Gestion complète de l'équipe (alias)" },

  // ── Témoignages ──
  { key: 'testimonials.view', module: 'testimonials', description: 'Voir les témoignages' },
  { key: 'testimonials.approve', module: 'testimonials', description: 'Approuver des témoignages' },
  { key: 'testimonials.reject', module: 'testimonials', description: 'Rejeter des témoignages' },
  { key: 'testimonials.publish', module: 'testimonials', description: 'Publier des témoignages' },
  { key: 'testimonials.delete', module: 'testimonials', description: 'Supprimer des témoignages' },
  { key: 'testimonials.manage', module: 'testimonials', description: 'Gestion complète des témoignages (alias)' },

  // ── Partenaires ──
  { key: 'partners.view', module: 'partners', description: 'Voir les partenaires' },
  { key: 'partners.create', module: 'partners', description: 'Créer des partenaires' },
  { key: 'partners.update', module: 'partners', description: 'Modifier des partenaires' },
  { key: 'partners.delete', module: 'partners', description: 'Supprimer des partenaires' },
  { key: 'partners.manage', module: 'partners', description: 'Gestion complète des partenaires (alias)' },

  // ── SEO & pixels ──
  { key: 'seo.view', module: 'seo', description: 'Voir la configuration SEO' },
  { key: 'seo.update', module: 'seo', description: 'Modifier la configuration SEO' },
  { key: 'seo.manage', module: 'seo', description: 'Gestion complète SEO (alias)' },
  { key: 'pixels.view', module: 'pixels', description: 'Voir les pixels de tracking' },
  { key: 'pixels.create', module: 'pixels', description: 'Créer des pixels' },
  { key: 'pixels.update', module: 'pixels', description: 'Modifier des pixels' },
  { key: 'pixels.delete', module: 'pixels', description: 'Supprimer des pixels' },

  // ── Newsletter ──
  { key: 'newsletter.view', module: 'newsletter', description: 'Voir les abonnés newsletter' },
  { key: 'newsletter.export', module: 'newsletter', description: 'Exporter les abonnés' },
  { key: 'newsletter.manage', module: 'newsletter', description: 'Gestion complète newsletter (alias)' },
]

/** Modules futurs (Challenge, Jury, Live…) — permissions prêtes à l'emploi */
export const FUTURE_PERMISSIONS: PermissionDef[] = [
  { key: 'challenges.view', module: 'challenges', description: 'Voir les challenges' },
  { key: 'challenges.create', module: 'challenges', description: 'Créer des challenges' },
  { key: 'challenges.update', module: 'challenges', description: 'Modifier des challenges' },
  { key: 'challenges.delete', module: 'challenges', description: 'Supprimer des challenges' },
  { key: 'challenges.publish', module: 'challenges', description: 'Publier des challenges' },
  { key: 'challenges.settings', module: 'challenges', description: 'Paramètres des challenges' },
  { key: 'candidates.view', module: 'candidates', description: 'Voir les candidats' },
  { key: 'candidates.create', module: 'candidates', description: 'Créer des candidats' },
  { key: 'candidates.update', module: 'candidates', description: 'Modifier des candidats' },
  { key: 'candidates.delete', module: 'candidates', description: 'Supprimer des candidats' },
  { key: 'candidates.approve', module: 'candidates', description: 'Approuver des candidats' },
  { key: 'candidates.reject', module: 'candidates', description: 'Rejeter des candidats' },
  { key: 'candidates.evaluate', module: 'candidates', description: 'Évaluer des candidats' },
  { key: 'videos.view', module: 'videos', description: 'Voir les vidéos' },
  { key: 'videos.upload', module: 'videos', description: 'Uploader des vidéos' },
  { key: 'videos.update', module: 'videos', description: 'Modifier des vidéos' },
  { key: 'videos.delete', module: 'videos', description: 'Supprimer des vidéos' },
  { key: 'videos.publish', module: 'videos', description: 'Publier des vidéos' },
  { key: 'videos.unpublish', module: 'videos', description: 'Dépublier des vidéos' },
  { key: 'votes.view', module: 'votes', description: 'Voir les votes' },
  { key: 'votes.create', module: 'votes', description: 'Créer des votes' },
  { key: 'votes.update', module: 'votes', description: 'Modifier des votes' },
  { key: 'votes.delete', module: 'votes', description: 'Supprimer des votes' },
  { key: 'votes.validate', module: 'votes', description: 'Valider des votes' },
  { key: 'jury.view', module: 'jury', description: 'Voir le jury' },
  { key: 'jury.create', module: 'jury', description: 'Créer des membres du jury' },
  { key: 'jury.update', module: 'jury', description: 'Modifier le jury' },
  { key: 'jury.delete', module: 'jury', description: 'Supprimer des membres du jury' },
  { key: 'jury.assign', module: 'jury', description: 'Assigner des jurés' },
  { key: 'live.view', module: 'live', description: 'Voir les lives' },
  { key: 'live.create', module: 'live', description: 'Créer des lives' },
  { key: 'live.update', module: 'live', description: 'Modifier des lives' },
  { key: 'live.start', module: 'live', description: 'Démarrer un live' },
  { key: 'live.stop', module: 'live', description: 'Arrêter un live' },
  { key: 'live.publish', module: 'live', description: 'Publier un live' },
]

export const PERMISSIONS_CATALOG = [...CORE_PERMISSIONS, ...FUTURE_PERMISSIONS]

export type PermissionKey = (typeof PERMISSIONS_CATALOG)[number]['key']

export const ALL_PERMISSION_KEYS = PERMISSIONS_CATALOG.map((p) => p.key)

/** Permissions groupées par module (pour l'UI admin) */
export function getPermissionsByModule(): Record<string, PermissionDef[]> {
  const grouped: Record<string, PermissionDef[]> = {}
  for (const perm of PERMISSIONS_CATALOG) {
    if (!grouped[perm.module]) grouped[perm.module] = []
    grouped[perm.module].push(perm)
  }
  return grouped
}
