import type { PurchasesTranslation } from './purchasesResources';

export const purchasesFr: PurchasesTranslation = {
  settingsItem: 'Achats',
  title: 'Achats',
  back: 'Retour',
  tabsLabel: 'Achats',
  tabs: {
    done: 'Terminés',
    pending: 'En attente',
    pendingCount: 'En attente ({{count}})',
    canceled: 'Annulés',
  },
  empty: {
    done: 'Aucun achat terminé.',
    pending: 'Aucun achat en attente de paiement.',
    canceled: 'Aucun achat annulé.',
  },
  loading: 'Chargement de vos achats…',
  service: {
    event: 'Événement le {{date}}',
    tour: 'Excursion le {{date}}',
    private_entry: 'Entrée le {{date}}',
  },
  status: {
    paid: 'Payé',
    partiallyRefunded: 'Payé · remboursé en partie',
    awaitingPayment: 'En attente de paiement · jusqu’à {{time}}',
    awaitingPaymentNoTime: 'En attente de paiement',
    processing: 'Paiement en cours de confirmation',
    disputed: 'En cours d’examen',
    noShow: 'Absent',
    refundPending: 'Remboursement en cours',
    refunded: 'Remboursé',
    refundedAmount: 'Remboursé {{amount}}',
    notCompleted: 'Paiement non finalisé',
    canceledByPartner: 'Annulé par l’organisateur',
  },
  pay: 'Payer',
  receipt: {
    boughtAt: '#{{code}} · acheté le {{date}}',
    serviceAt: '{{place}} · {{date}}',
    tickets_one: '{{count}} billet',
    tickets_other: '{{count}} billets',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    discount: 'Réduction',
    serviceFee: 'Frais de service',
    total: 'Total payé',
    refund: 'Remboursement',
    finalAmount: 'Montant final',
    policy: 'Politique d’annulation : {{title}}. {{description}}',
    viewTickets: 'Voir les billets',
    viewBooking: 'Voir la réservation',
    cancel: 'Annuler l’achat',
    cancelEndedTickets:
      'Le délai d’annulation avec remboursement est terminé. Vos billets restent valables.',
    cancelEndedBooking:
      'Le délai d’annulation avec remboursement est terminé. Votre réservation reste valable.',
  },
  confirm: {
    title: 'Annuler l’achat ?',
    refundLabel: 'Remboursement',
    withdrawal:
      'Vous êtes dans le délai de rétractation et tout vous est remboursé. Valable jusqu’au {{date}}.',
    withdrawalWithFee:
      'Vous êtes dans le délai de rétractation : tout vous est remboursé, frais de service compris. Valable jusqu’au {{date}}.',
    reschedule: 'La date a changé et tout vous est remboursé. Valable jusqu’au {{date}}.',
    rescheduleWithFee:
      'La date a changé : tout vous est remboursé, frais de service compris. Valable jusqu’au {{date}}.',
    policy:
      'Selon la politique {{policy}}, vous récupérez {{percent}} % du montant. Valable jusqu’au {{date}}.',
    policyKeepsFee:
      'Selon la politique {{policy}}, vous récupérez {{percent}} % des billets. Les frais de service ne sont pas remboursés. Valable jusqu’au {{date}}.',
    note: 'Le montant revient sur le même moyen de paiement.',
    confirm: 'Annuler l’achat',
    keep: 'Garder l’achat',
  },
  feedback: {
    canceled: 'Achat annulé. Le remboursement revient sur le même moyen de paiement.',
  },
  errors: { cancel: 'Impossible d’annuler l’achat.' },
};
