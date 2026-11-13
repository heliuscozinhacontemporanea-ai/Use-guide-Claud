/** Textos da denúncia de resposta e da aba Moderação (D19). pt-BR é a fonte. */
type Reasons = { offensive: string; fraud: string; personal_data: string; other: string };

export interface ReviewReportsTranslation {
  /** Avaliações recentes na página do estabelecimento (p19). */
  recent: {
    loading: string;
    noReply: string;
    replied: string;
    empty: string;
    error: string;
    seeAll: string;
  };
  action: string;
  sheet: {
    title: string;
    description: string;
    reasonLegend: string;
    detailsLabel: string;
    submit: string;
    sending: string;
  };
  reasons: Reasons;
  status: { open: string; upheld: string; dismissed: string };
  sent: string;
  errors: {
    REPORT_LIMIT_REACHED: string;
    ALREADY_REPORTED: string;
    NO_RESPONSE_TO_REPORT: string;
    generic: string;
  };
  admin: {
    tab: string;
    title: string;
    loading: string;
    empty: string;
    unknownPlace: string;
    review: string;
    response: string;
    reason: string;
    details: string;
    decideBy: string;
    uphold: string;
    dismiss: string;
    upholdConfirm: string;
    upheld: string;
    dismissed: string;
    loadMore: string;
    errors: { load: string; decide: string; ALREADY_DECIDED: string };
  };
}

export const reviewReportsPtBR: ReviewReportsTranslation = {
  recent: {
    loading: 'Carregando avaliações',
    noReply: 'Sem resposta',
    replied: 'Respondida',
    empty: 'Nenhuma avaliação ainda.',
    error: 'Não foi possível carregar as avaliações.',
    seeAll: 'Ver todas e responder',
  },
  action: 'Denunciar resposta',
  sheet: {
    title: 'Denunciar resposta',
    description:
      '{{place}}. A equipe do Use Guide analisa e responde em até 3 dias. O estabelecimento não fica sabendo quem denunciou.',
    reasonLegend: 'Motivo',
    detailsLabel: 'Conte o que aconteceu (opcional)',
    submit: 'Enviar denúncia',
    sending: 'Enviando…',
  },
  reasons: {
    offensive: 'Ofensiva ou desrespeitosa',
    fraud: 'Fraude ou golpe',
    personal_data: 'Expõe dados pessoais',
    other: 'Outro motivo',
  },
  status: {
    open: 'Denúncia em análise · resposta até {{date}}',
    upheld: 'Denúncia aceita: a resposta foi removida',
    dismissed: 'Denúncia analisada: a resposta foi mantida',
  },
  sent: 'Denúncia enviada. O resultado aparece aqui no cartão.',
  errors: {
    REPORT_LIMIT_REACHED: 'Você já enviou muitas denúncias hoje. Tente de novo amanhã.',
    ALREADY_REPORTED: 'Você já denunciou esta resposta.',
    NO_RESPONSE_TO_REPORT: 'Esta avaliação não tem mais resposta.',
    generic: 'Não foi possível enviar a denúncia.',
  },
  admin: {
    tab: 'Moderação',
    title: 'Denúncias de respostas',
    loading: 'Carregando denúncias…',
    empty: 'Nenhuma denúncia para analisar.',
    unknownPlace: 'Lugar fora do guia',
    review: 'Avaliação · {{rating}} de 5',
    response: 'Resposta denunciada',
    reason: 'Motivo: {{reason}}',
    details: 'Relato: {{details}}',
    decideBy: 'Responder até {{date}}',
    uphold: 'Remover resposta',
    dismiss: 'Manter resposta',
    upholdConfirm: 'Remover a resposta do estabelecimento? A avaliação continua publicada.',
    upheld: 'Resposta removida.',
    dismissed: 'Denúncia recusada; a resposta continua.',
    loadMore: 'Ver mais',
    errors: {
      load: 'Não foi possível carregar as denúncias.',
      decide: 'Não foi possível registrar a decisão.',
      ALREADY_DECIDED: 'Esta denúncia já foi decidida.',
    },
  },
};
