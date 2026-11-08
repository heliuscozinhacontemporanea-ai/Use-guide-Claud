/** Textos da denúncia de resposta e da aba Moderação (D19). pt-BR é a fonte. */
type Reasons = { offensive: string; fraud: string; personal_data: string; other: string };

export interface ReviewReportsTranslation {
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

export const reviewReportsEn: ReviewReportsTranslation = {
  action: 'Report response',
  sheet: {
    title: 'Report response',
    description:
      '{{place}}. The Use Guide team reviews it and replies within 3 days. The business does not find out who reported it.',
    reasonLegend: 'Reason',
    detailsLabel: 'Tell us what happened (optional)',
    submit: 'Send report',
    sending: 'Sending…',
  },
  reasons: {
    offensive: 'Offensive or disrespectful',
    fraud: 'Fraud or scam',
    personal_data: 'Exposes personal data',
    other: 'Other reason',
  },
  status: {
    open: 'Report under review · answer by {{date}}',
    upheld: 'Report accepted: the response was removed',
    dismissed: 'Report reviewed: the response was kept',
  },
  sent: 'Report sent. The result shows up here on the card.',
  errors: {
    REPORT_LIMIT_REACHED: 'You have sent too many reports today. Try again tomorrow.',
    ALREADY_REPORTED: 'You have already reported this response.',
    NO_RESPONSE_TO_REPORT: 'This review no longer has a response.',
    generic: 'Could not send the report.',
  },
  admin: {
    tab: 'Moderation',
    title: 'Reported responses',
    loading: 'Loading reports…',
    empty: 'No reports to review.',
    unknownPlace: 'Place no longer in the guide',
    review: 'Review · {{rating}} out of 5',
    response: 'Reported response',
    reason: 'Reason: {{reason}}',
    details: 'Details: {{details}}',
    decideBy: 'Answer by {{date}}',
    uphold: 'Remove response',
    dismiss: 'Keep response',
    upholdConfirm: 'Remove the business response? The review stays published.',
    upheld: 'Response removed.',
    dismissed: 'Report dismissed; the response stays.',
    loadMore: 'Show more',
    errors: {
      load: 'Could not load the reports.',
      decide: 'Could not record the decision.',
      ALREADY_DECIDED: 'This report has already been decided.',
    },
  },
};

export const reviewReportsFr: ReviewReportsTranslation = {
  action: 'Signaler la réponse',
  sheet: {
    title: 'Signaler la réponse',
    description:
      '{{place}}. L’équipe Use Guide l’examine et répond sous 3 jours. L’établissement ne sait pas qui l’a signalée.',
    reasonLegend: 'Motif',
    detailsLabel: 'Racontez ce qui s’est passé (facultatif)',
    submit: 'Envoyer le signalement',
    sending: 'Envoi…',
  },
  reasons: {
    offensive: 'Offensante ou irrespectueuse',
    fraud: 'Fraude ou arnaque',
    personal_data: 'Expose des données personnelles',
    other: 'Autre motif',
  },
  status: {
    open: 'Signalement en cours d’examen · réponse avant le {{date}}',
    upheld: 'Signalement accepté : la réponse a été retirée',
    dismissed: 'Signalement examiné : la réponse a été conservée',
  },
  sent: 'Signalement envoyé. Le résultat apparaît ici sur la carte.',
  errors: {
    REPORT_LIMIT_REACHED: 'Vous avez envoyé trop de signalements aujourd’hui. Réessayez demain.',
    ALREADY_REPORTED: 'Vous avez déjà signalé cette réponse.',
    NO_RESPONSE_TO_REPORT: 'Cet avis n’a plus de réponse.',
    generic: 'Impossible d’envoyer le signalement.',
  },
  admin: {
    tab: 'Modération',
    title: 'Réponses signalées',
    loading: 'Chargement des signalements…',
    empty: 'Aucun signalement à examiner.',
    unknownPlace: 'Lieu absent du guide',
    review: 'Avis · {{rating}} sur 5',
    response: 'Réponse signalée',
    reason: 'Motif : {{reason}}',
    details: 'Récit : {{details}}',
    decideBy: 'Répondre avant le {{date}}',
    uphold: 'Retirer la réponse',
    dismiss: 'Conserver la réponse',
    upholdConfirm: 'Retirer la réponse de l’établissement ? L’avis reste publié.',
    upheld: 'Réponse retirée.',
    dismissed: 'Signalement refusé ; la réponse reste.',
    loadMore: 'Voir plus',
    errors: {
      load: 'Impossible de charger les signalements.',
      decide: 'Impossible d’enregistrer la décision.',
      ALREADY_DECIDED: 'Ce signalement a déjà été traité.',
    },
  },
};
