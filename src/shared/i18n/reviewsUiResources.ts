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
