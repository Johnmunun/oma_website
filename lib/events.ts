export type UpcomingEvent = {
  title: string
  dateLabel: string
  dateISO?: string
  location: string
  image: string
  type: string
  slug?: string
}

export type PastEvent = {
  title: string
  dateLabel: string
  dateISO?: string
  image: string
  slug: string
}

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    title: 'Formation Professionnelle Certifiante des MC',
    dateLabel: 'Date à confirmer',
    dateISO: undefined,
    location: 'Kinshasa, RDC',
    image: '/images/mc-formation-poster.jpg',
    type: 'Formation',
    slug: 'formation-mc',
  },
  {
    title: 'Masterclass Art Oratoire',
    dateLabel: '15 Juin 2025',
    dateISO: '2025-06-15',
    location: 'Paris, France',
    image: '/images/graduation-ceremony-1.jpg',
    type: 'Masterclass',
    slug: 'masterclass-art-oratoire-2025-paris',
  },
  {
    title: 'Conférence Leadership',
    dateLabel: '22 Juin 2025',
    dateISO: '2025-06-22',
    location: 'Bruxelles, Belgique',
    image: '/leadership-conference-event.jpg',
    type: 'Conférence',
    slug: 'conference-leadership-2025-bruxelles',
  },
  {
    title: 'Atelier Communication Digitale',
    dateLabel: '5 Juillet 2025',
    dateISO: '2025-07-05',
    location: 'Genève, Suisse',
    image: '/digital-communication-workshop.jpg',
    type: 'Atelier',
    slug: 'atelier-communication-digitale-2025-geneve',
  },
]

export const PAST_EVENTS: PastEvent[] = [
  {
    title: 'Cérémonie de Graduation 2024',
    dateLabel: 'Décembre 2024',
    dateISO: '2024-12-01',
    image: '/images/graduation-ceremony-1.jpg',
    slug: 'ceremonie-graduation-2024',
  },
  {
    title: 'Formation Intensive Leadership',
    dateLabel: 'Novembre 2024',
    dateISO: '2024-11-01',
    image: '/images/graduation-ceremony-2.jpg',
    slug: 'formation-intensive-leadership-2024',
  },
  {
    title: 'Visite Proxy Business',
    dateLabel: 'Octobre 2024',
    dateISO: '2024-10-01',
    image: '/images/team-proxy-business.jpg',
    slug: 'visite-proxy-business-2024',
  },
  {
    title: 'Cérémonie de Remise des Diplômes',
    dateLabel: 'Septembre 2024',
    dateISO: '2024-09-01',
    image: '/images/graduation-ceremony-3.jpg',
    slug: 'remise-diplomes-2024',
  },
]

export function sortUpcomingByDate(a: UpcomingEvent, b: UpcomingEvent) {
  const ta = a.dateISO ? Date.parse(a.dateISO) : Number.POSITIVE_INFINITY
  const tb = b.dateISO ? Date.parse(b.dateISO) : Number.POSITIVE_INFINITY
  return ta - tb
}

export function sortPastByDateDesc(a: PastEvent, b: PastEvent) {
  const ta = a.dateISO ? Date.parse(a.dateISO) : 0
  const tb = b.dateISO ? Date.parse(b.dateISO) : 0
  return tb - ta
}



