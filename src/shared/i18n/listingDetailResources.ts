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
};
