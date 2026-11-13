import type { ReviewReportsTranslation } from './reviewReportsResources';

export const reviewReportsFr: ReviewReportsTranslation = {
  recent: {
    loading: 'Chargement des avis',
    noReply: 'Sans réponse',
    replied: 'Répondu',
    empty: "Aucun avis pour l'instant.",
    error: 'Impossible de charger les avis.',
    seeAll: 'Tout voir et répondre',
  },
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
