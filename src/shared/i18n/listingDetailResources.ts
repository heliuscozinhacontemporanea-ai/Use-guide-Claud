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
