/**
 * Configuration CMS centralisée
 * Cette configuration permet de gérer dynamiquement le contenu via le backend
 *
 * Préparez-vous à intégrer une API backend pour charger ces données
 * Ex: GET /api/cms/config
 */

export interface CMSConfig {
  // 🎨 Branding
  branding: {
    logoUrl: string // URL du logo principal
    logoAlt: string
    faviconUrl: string
    primaryColor: string // Couleur primaire en hex
    secondaryColor: string // Couleur secondaire (or)
    brandName: string
    tagline: string
  }

  // 📝 Typographie
  typography: {
    headingFont: "playfair" | "custom" // Police pour les titres
    bodyFont: "poppins" | "custom" // Police pour le corps
    customHeadingUrl?: string // URL de police personnalisée
    customBodyUrl?: string
  }

  // 📄 Navigation
  navigation: {
    items: NavItem[]
    showFormationsLink: boolean // Contrôle l'affichage du lien Formations
    showSignupButton: boolean // Contrôle l'affichage du bouton S'inscrire
  }

  // 🏠 Héros
  hero: {
    title: string
    subtitle: string
    backgroundImageUrl: string
    ctaText: string
    ctaLink: string
  }

  // ℹ️ À propos
  about: {
    title: string
    subtitle: string
    content: string
    imageUrl: string
    founderName: string
    founderBio: string
    founderImageUrl: string
  }

  // 📚 Formations (affichage limité sur la landing)
  formations: {
    showOnLanding: boolean
    limitCount: number // Nombre de formations à afficher
    viewMoreLink: string
  }

  // 💬 Support client
  support: {
    whatsappNumber: string
    email: string
    showFloatingButton: boolean
    buttonPosition: "bottom-right" | "bottom-left"
  }

  // 🔗 Réseaux sociaux
  socialLinks: {
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    twitter?: string
  }
}

export interface NavItem {
  label: string
  href: string
  isExternal?: boolean
}

/**
 * Configuration par défaut
 * À remplacer par des données du backend
 */
export const defaultCMSConfig: CMSConfig = {
  branding: {
    logoUrl: "/images/logo.png",
    logoAlt: "Réseau OMA Logo",
    faviconUrl: "/favicon.ico",
    primaryColor: "#000000",
    secondaryColor: "#B8860B",
    brandName: "Réseau OMA",
    tagline: "Dompter la parole, c'est dompter le monde",
  },
  typography: {
    headingFont: "playfair",
    bodyFont: "poppins",
  },
  navigation: {
    items: [
      { label: "Accueil", href: "/" },
      { label: "À propos", href: "#about" },
      { label: "Événements", href: "#events" },
      { label: "OMA TV", href: "#oma-tv" },
      { label: "Contact", href: "#contact" },
    ],
    showFormationsLink: false, // Caché par défaut
    showSignupButton: false, // Caché par défaut
  },
  hero: {
    title: "Réseau OMA",
    subtitle: "Dompter la parole, c'est dompter le monde",
    backgroundImageUrl: "/hero-background.jpg",
    ctaText: "Découvrir nos formations",
    ctaLink: "/formations",
  },
  about: {
    title: "À propos du Réseau OMA",
    subtitle: "Excellence en communication et leadership",
    content:
      "Le Réseau OMA est la plateforme internationale dédiée à l'art oratoire, la communication et le leadership.",
    imageUrl: "/about-image.jpg",
    founderName: "Coach Bin",
    founderBio: "Fondateur et CEO International du Réseau OMA",
    founderImageUrl: "/images/coach-bin-professional.jpg",
  },
  formations: {
    showOnLanding: true,
    limitCount: 3,
    viewMoreLink: "/formations",
  },
  support: {
    whatsappNumber: "+243857703808",
    email: "contact@reseau-oma.com",
    showFloatingButton: true,
    buttonPosition: "bottom-right",
  },
  socialLinks: {
    facebook: "https://facebook.com/reseauoma",
    instagram: "https://instagram.com/reseauoma",
    linkedin: "https://linkedin.com/company/reseau-oma",
    youtube: "https://youtube.com/@reseauoma",
  },
}
