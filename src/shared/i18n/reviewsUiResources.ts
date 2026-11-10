// Avaliações no anúncio em tela cheia (aprovado em 2026-11-10).
export interface ReviewsUiTranslation {
  title: string;
  prompt: { tour: string; stay: string; restaurant: string; event: string; default: string };
  rate: string;
  saved: string;
  ownerTitle: string;
  ownerText: string;
  sort: { recent: string; highest: string; lowest: string };
  empty: string;
  verified: string;
  partnerReply: string;
  loadMore: string;
  loadingMore: string;
  alreadyReviewed: string;
  editing: string;
  yourRating: string;
  placeholder: string;
  submit: string;
  update: string;
}

export const reviewsUiPtBR: ReviewsUiTranslation = {
  title: 'Avaliações',
  prompt: {
    tour: 'Fez este passeio? Conte como foi.',
    stay: 'Ficou aqui? Conte como foi.',
    restaurant: 'Comeu aqui? Conte como foi.',
    event: 'Foi a este evento? Conte como foi.',
    default: 'Esteve aqui? Conte como foi.',
  },
  rate: 'Avaliar',
  saved: 'Sua avaliação foi salva.',
  ownerTitle: 'Este anúncio é seu',
  ownerText:
    'Quem anuncia não avalia o próprio anúncio. Responda às avaliações pelo painel do parceiro.',
  sort: { recent: 'Mais recentes', highest: 'Melhor avaliadas', lowest: 'Menores notas' },
  empty: 'Ainda não há avaliações.',
  verified: 'experiência verificada',
  partnerReply: 'Resposta do parceiro:',
  loadMore: 'Ver mais avaliações',
  loadingMore: 'Carregando…',
  alreadyReviewed: 'Você já avaliou este anúncio',
  editing: 'Editando sua avaliação',
  yourRating: 'Sua nota',
  placeholder: 'Conte como foi a sua experiência',
  submit: 'Enviar avaliação',
  update: 'Atualizar avaliação',
};

export const reviewsUiEn: ReviewsUiTranslation = {
  title: 'Reviews',
  prompt: {
    tour: 'Did this tour? Tell us how it went.',
    stay: 'Stayed here? Tell us how it went.',
    restaurant: 'Ate here? Tell us how it went.',
    event: 'Went to this event? Tell us how it went.',
    default: 'Been here? Tell us how it went.',
  },
  rate: 'Write a review',
  saved: 'Your review was saved.',
  ownerTitle: 'This listing is yours',
  ownerText: "Partners don't review their own listings. Reply to reviews from the partner panel.",
  sort: { recent: 'Most recent', highest: 'Highest rated', lowest: 'Lowest rated' },
  empty: 'No reviews yet.',
  verified: 'verified experience',
  partnerReply: 'Partner reply:',
  loadMore: 'See more reviews',
  loadingMore: 'Loading…',
  alreadyReviewed: 'You already reviewed this listing',
  editing: 'Editing your review',
  yourRating: 'Your rating',
  placeholder: 'Tell us about your experience',
  submit: 'Send review',
  update: 'Update review',
};

export const reviewsUiFr: ReviewsUiTranslation = {
  title: 'Avis',
  prompt: {
    tour: 'Vous avez fait cette excursion ? Racontez-nous.',
    stay: 'Vous avez séjourné ici ? Racontez-nous.',
    restaurant: 'Vous avez mangé ici ? Racontez-nous.',
    event: 'Vous étiez à cet événement ? Racontez-nous.',
    default: 'Vous êtes venu ici ? Racontez-nous.',
  },
  rate: 'Donner un avis',
  saved: 'Votre avis a été enregistré.',
  ownerTitle: 'Cette annonce est la vôtre',
  ownerText:
    'Les partenaires ne notent pas leurs propres annonces. Répondez aux avis depuis le panneau partenaire.',
  sort: { recent: 'Plus récents', highest: 'Mieux notés', lowest: 'Moins bien notés' },
  empty: 'Pas encore d’avis.',
  verified: 'expérience vérifiée',
  partnerReply: 'Réponse du partenaire :',
  loadMore: 'Voir plus d’avis',
  loadingMore: 'Chargement…',
  alreadyReviewed: 'Vous avez déjà noté cette annonce',
  editing: 'Modification de votre avis',
  yourRating: 'Votre note',
  placeholder: 'Racontez votre expérience',
  submit: 'Envoyer l’avis',
  update: 'Mettre à jour l’avis',
};
