// Anúncio em tela cheia (aprovado em 2026-11-10): seções que variam por categoria.
export interface ListingDetailTranslation {
  whatsapp: string;
  whatsappHint: { restaurant: string; hotel: string; default: string };
  directions: string;
  directionsHint: string;
  cuisine: string;
  eventDate: string;
  included: string;
  verifiedReviewsTitle: string;
  verifiedReviewsText: string;
  openNow: string;
  closedNow: string;
  closedToday: string;
  closesAt: string;
  opensAt: string;
  hoursToggle: string;
  today: string;
  closed: string;
  checkIn: string;
  checkOut: string;
  checkInRange: string;
  checkOutUntil: string;
  reviewsCount_one: string;
  reviewsCount_other: string;
}

export const listingDetailPtBR: ListingDetailTranslation = {
  whatsapp: 'Falar no WhatsApp',
  whatsappHint: {
    restaurant: 'Reservas e pedidos',
    hotel: 'Disponibilidade e reservas',
    default: 'Dúvidas',
  },
  directions: 'Como chegar',
  directionsHint: 'Abre o mapa com o local',
  cuisine: 'Culinária',
  eventDate: 'Data',
  included: 'O que está incluído',
  verifiedReviewsTitle: 'Avaliações verificadas',
  verifiedReviewsText:
    'Só quem teve ingresso e fez check-in pode avaliar a sessão, depois que ela termina.',
  openNow: 'Aberto agora',
  closedNow: 'Fechado agora',
  closedToday: 'Fechado hoje',
  closesAt: 'Fecha às {{time}}',
  opensAt: 'Abre às {{time}}',
  hoursToggle: 'Ver o horário da semana',
  today: 'hoje',
  closed: 'Fechado',
  checkIn: 'Check-in',
  checkOut: 'Check-out',
  checkInRange: '{{from}} às {{to}}',
  checkOutUntil: 'até {{time}}',
  reviewsCount_one: '{{count}} avaliação',
  reviewsCount_other: '{{count}} avaliações',
};

export const listingDetailEn: ListingDetailTranslation = {
  whatsapp: 'Message on WhatsApp',
  whatsappHint: {
    restaurant: 'Reservations and orders',
    hotel: 'Availability and bookings',
    default: 'Questions',
  },
  directions: 'Get directions',
  directionsHint: 'Opens the map',
  cuisine: 'Cuisine',
  eventDate: 'Date',
  included: "What's included",
  verifiedReviewsTitle: 'Verified reviews',
  verifiedReviewsText:
    'Only people who had a ticket and checked in can review the session, after it ends.',
  openNow: 'Open now',
  closedNow: 'Closed now',
  closedToday: 'Closed today',
  closesAt: 'Closes at {{time}}',
  opensAt: 'Opens at {{time}}',
  hoursToggle: 'See the weekly hours',
  today: 'today',
  closed: 'Closed',
  checkIn: 'Check-in',
  checkOut: 'Check-out',
  checkInRange: '{{from}} to {{to}}',
  checkOutUntil: 'until {{time}}',
  reviewsCount_one: '{{count}} review',
  reviewsCount_other: '{{count}} reviews',
};

export const listingDetailFr: ListingDetailTranslation = {
  whatsapp: 'Écrire sur WhatsApp',
  whatsappHint: {
    restaurant: 'Réservations et commandes',
    hotel: 'Disponibilités et réservations',
    default: 'Questions',
  },
  directions: 'Itinéraire',
  directionsHint: 'Ouvre la carte',
  cuisine: 'Cuisine',
  eventDate: 'Date',
  included: 'Ce qui est inclus',
  verifiedReviewsTitle: 'Avis vérifiés',
  verifiedReviewsText:
    'Seules les personnes avec un billet et un check-in peuvent noter la séance, une fois terminée.',
  openNow: 'Ouvert',
  closedNow: 'Fermé',
  closedToday: 'Fermé aujourd’hui',
  closesAt: 'Ferme à {{time}}',
  opensAt: 'Ouvre à {{time}}',
  hoursToggle: 'Voir les horaires de la semaine',
  today: 'aujourd’hui',
  closed: 'Fermé',
  checkIn: 'Arrivée',
  checkOut: 'Départ',
  checkInRange: 'de {{from}} à {{to}}',
  checkOutUntil: 'jusqu’à {{time}}',
  reviewsCount_one: '{{count}} avis',
  reviewsCount_other: '{{count}} avis',
};
