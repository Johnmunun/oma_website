export interface Formation {
  id: string
  name: string
  description: string
  priceInCents: number
  duration: string
  image: string
  features: string[]
  level: string
}

// Source of truth for all formations
export const FORMATIONS: Formation[] = [
  {
    id: "masterclass-art-oratoire",
    name: "Masterclass en Art oratoire",
    description:
      "Devenez un orateur captivant et maîtrisez l'art de la prise de parole en public. Cette formation complète vous apprendra les techniques des grands orateurs.",
    priceInCents: 29900, // $299
    duration: "8 semaines",
    image: "/public-speaking-masterclass-training.jpg",
    level: "Intermédiaire",
    features: [
      "Techniques de respiration et de gestion du stress",
      "Structuration de discours percutants",
      "Langage corporel et présence scénique",
      "Gestion des questions difficiles",
      "Exercices pratiques et mises en situation",
      "Certificat de fin de formation",
    ],
  },
  {
    id: "formation-marketing-digital",
    name: "Formation en Marketing Digital",
    description:
      "Apprenez les stratégies digitales pour développer votre présence en ligne et atteindre vos objectifs commerciaux.",
    priceInCents: 39900, // $399
    duration: "10 semaines",
    image: "/digital-marketing-training-course.jpg",
    level: "Débutant à Intermédiaire",
    features: [
      "Stratégies de contenu et storytelling",
      "SEO et référencement naturel",
      "Publicité sur les réseaux sociaux",
      "Email marketing et automation",
      "Analytics et mesure de performance",
      "Certificat de fin de formation",
    ],
  },
  {
    id: "coaching-prise-parole",
    name: "Coaching en Prise de parole",
    description:
      "Un accompagnement personnalisé pour surmonter vos blocages et gagner en confiance lors de vos prises de parole.",
    priceInCents: 49900, // $499
    duration: "12 semaines",
    image: "/public-speaking-coaching-session.jpg",
    level: "Tous niveaux",
    features: [
      "Sessions individuelles personnalisées",
      "Analyse vidéo de vos performances",
      "Plan d'action sur mesure",
      "Suivi hebdomadaire avec coach dédié",
      "Accès à vie aux ressources",
      "Certificat de fin de formation",
    ],
  },
  {
    id: "formation-mc-ceremonies",
    name: "Formation Professionnelle MC",
    description:
      "Formation certifiante pour devenir Maître de Cérémonie professionnel. Maîtrisez l'art de l'animation d'événements.",
    priceInCents: 59900, // $599
    duration: "16 semaines",
    image: "/images/mc-formation-poster.jpg",
    level: "Professionnel",
    features: [
      "Maîtrise des cérémonies officielles",
      "Art oratoire avancé",
      "Prise de parole en public",
      "Animation d'événements corporatifs",
      "Protocole et étiquette",
      "Certification professionnelle reconnue",
    ],
  },
  {
    id: "leadership-communication",
    name: "Leadership & Communication",
    description:
      "Développez votre leadership et votre capacité à inspirer et mobiliser vos équipes à travers une communication efficace.",
    priceInCents: 44900, // $449
    duration: "10 semaines",
    image: "/leadership-communication-training.jpg",
    level: "Avancé",
    features: [
      "Styles de leadership et adaptation",
      "Communication persuasive",
      "Gestion de conflits",
      "Motivation d'équipe",
      "Prise de décision stratégique",
      "Certificat de fin de formation",
    ],
  },
  {
    id: "personal-branding",
    name: "Personal Branding",
    description:
      "Construisez et développez votre marque personnelle pour vous démarquer dans votre domaine d'expertise.",
    priceInCents: 34900, // $349
    duration: "8 semaines",
    image: "/personal-branding-course.jpg",
    level: "Tous niveaux",
    features: [
      "Définition de votre identité unique",
      "Stratégie de contenu personnel",
      "Optimisation LinkedIn et réseaux sociaux",
      "Storytelling personnel",
      "Networking stratégique",
      "Certificat de fin de formation",
    ],
  },
]
