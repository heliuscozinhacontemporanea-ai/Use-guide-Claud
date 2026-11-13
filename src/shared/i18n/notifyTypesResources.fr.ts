import type { NotificationTypeTexts } from './notifyTypesResources';

export const notifyTypesFr: NotificationTypeTexts = {
  terms_updated_partner: {
    title: 'Les conditions du partenaire ont changé',
    body: 'Les changements s’appliquent 15 jours après cet avis. Touchez pour lire et accepter la nouvelle version.',
  },
  terms_updated_buyer: {
    title: 'Les conditions d’utilisation ont changé',
    body: 'Les changements s’appliquent 15 jours après cet avis. Touchez pour lire.',
  },
  gate_staff_invited: {
    title: 'Invitation à l’accueil',
    body: '{{business}} vous invite à valider les entrées de {{event}}.',
    bodyGeneric: 'Vous avez reçu une invitation pour l’accueil d’un événement.',
  },
  promoter_invited: {
    title: 'Invitation à promouvoir',
    body: '{{business}} veut que vous fassiez la promotion de {{event}}. Voyez combien vous gagnez.',
    bodyGeneric: 'Vous avez reçu une invitation à promouvoir un événement.',
  },
  promoter_accepted: {
    title: 'Promoteur accepté',
    body: '{{username}} a accepté de promouvoir {{event}}.',
    bodyGeneric: 'Un promoteur a accepté votre invitation.',
  },
  promoter_declined: {
    title: 'Invitation refusée',
    body: '{{username}} a refusé de promouvoir {{event}}.',
    bodyGeneric: 'Une invitation à promouvoir a été refusée.',
  },
  courtesy_received: {
    title: 'Vous avez reçu un billet',
    body: '{{business}} vous a invité à {{event}}. Le billet est dans votre portefeuille.',
    bodyGeneric: 'Un billet offert est dans votre portefeuille.',
  },
  courtesy_canceled: {
    title: 'Billet offert annulé',
    body: 'Le billet offert pour {{event}} a été annulé par l’organisateur.',
    bodyGeneric: 'Un de vos billets offerts a été annulé par l’organisateur.',
  },
  courtesy_link_accepted: {
    title: 'Invitation acceptée',
    body: '{{username}} a reçu le billet offert de votre lien d’invitation.',
    bodyGeneric: 'Le billet offert de votre lien d’invitation a été reçu.',
  },
  ticket_received: {
    title: 'Vous avez reçu un billet',
    body: 'Un billet pour {{event}} est dans votre portefeuille.',
    bodyGeneric: 'Un nouveau billet est dans votre portefeuille.',
  },
  ticket_returned: {
    title: 'Billet rendu',
    body: 'Le billet pour {{event}} est revenu dans votre portefeuille.',
    bodyGeneric: 'Un billet est revenu dans votre portefeuille.',
  },
  ticket_link_accepted: {
    title: 'Billet remis',
    body: '{{username}} a reçu le billet que vous avez envoyé.',
    bodyGeneric: 'Le billet que vous avez envoyé a été reçu.',
  },
  ticket_qr_replaced: {
    title: 'QR code remplacé',
    body: 'L’ancien QR code et l’ancien code ne sont plus valables. Si ce n’était pas vous, contactez-nous.',
  },
  event_canceled: {
    title: 'Événement annulé',
    body: '{{event}} a été annulé. Votre remboursement est en cours.',
    bodyGeneric: 'Un de vos événements a été annulé. Votre remboursement est en cours.',
  },
  event_postponed: {
    title: 'Nouvelle date pour l’événement',
    body: '{{event}} est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
    bodyGeneric:
      'Un de vos événements est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
  },
  booking_provider_arrived: {
    title: '{{business}} est arrivé',
    titleGeneric: 'Votre guide est arrivé',
    body: 'On vous attend au point de rendez-vous. Montrez votre code.',
  },
  booking_no_show_marked: {
    title: 'Absence enregistrée',
    body: '{{business}} a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
    bodyGeneric:
      'Le prestataire a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
  },
  booking_absence_in_review: {
    title: 'Nous examinons la situation',
    body: '{{business}} affirme avoir été sur place. Nous répondons sous 5 jours.',
    bodyGeneric: 'Le prestataire affirme avoir été sur place. Nous répondons sous 5 jours.',
  },
  booking_absence_refunded_buyer: {
    title: 'Remboursement en cours',
    body: 'Vous récupérez le montant payé, frais de service compris.',
  },
  booking_confirmation_asked: {
    title: 'Tout s’est bien passé ?',
    body: 'Dites-nous dans Achats si la prestation a eu lieu, sous 72 heures.',
  },
  sale_ticket: {
    title: 'Nouvelle vente',
    body_one: '{{count}} billet vendu.',
    body_other: '{{count}} billets vendus.',
  },
  sale_booking: {
    title: 'Nouvelle réservation',
    body_one: '{{offer}} pour {{count}} personne.',
    body_other: '{{offer}} pour {{count}} personnes.',
  },
  sale_claim_opened: {
    title: 'Un client a ouvert une réclamation',
    body: 'Le montant de cette vente est retenu jusqu’à la décision, sous 5 jours.',
  },
  booking_absence_reported: {
    title: 'Le client dit que vous n’êtes pas venu',
    body: 'Répondez sous 2 heures dans les réservations de votre espace. Sans réponse, le client est remboursé et la pénalité de 20 % s’applique.',
  },
  booking_absence_refunded_partner: {
    title: 'Client remboursé',
    body: 'Aucune réponse dans le délai. Le client a été remboursé et la pénalité de 20 % s’applique.',
  },
  booking_confirmation_denied: {
    title: 'Un client a ouvert une réclamation',
    body: 'Le client dit que la prestation n’a pas eu lieu. Le montant est retenu jusqu’à la décision, sous 5 jours.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Client remboursé',
    body: 'L’arrivée n’a pas été confirmée avec le code et le client dit que la prestation n’a pas eu lieu.',
  },
  booking_confirmation_expired_partner: {
    title: 'Client remboursé',
    body: 'L’arrivée n’a pas été confirmée avec le code et le client n’a pas répondu sous 72 heures.',
  },
  review_received: {
    title: 'Nouvel avis',
    body_one: '{{user}} a donné {{count}} étoile à {{item}}.',
    body_other: '{{user}} a donné {{count}} étoiles à {{item}}.',
  },
  review_updated: {
    title: 'Avis modifié',
    body_one: '{{user}} a changé sa note pour {{item}} : {{count}} étoile.',
    body_other: '{{user}} a changé sa note pour {{item}} : {{count}} étoiles.',
  },
  plan_expiring: {
    title: 'Votre formule se termine bientôt',
    body_one:
      'La formule de {{listing}} se termine dans {{count}} jour. Renouvelez-la pour garder le badge.',
    body_other:
      'La formule de {{listing}} se termine dans {{count}} jours. Renouvelez-la pour garder le badge.',
  },
  plan_renewal_failed: {
    title: 'Impossible de renouveler votre formule',
    body: 'La carte a été refusée. Mettez à jour votre moyen de paiement pour garder le badge.',
  },
  sale_daily_digest: {
    title: 'Vos ventes du jour',
    body_one: '{{count}} vente ou réservation aujourd’hui. Voir le détail dans votre espace.',
    body_other: '{{count}} ventes ou réservations aujourd’hui. Voir le détail dans votre espace.',
  },
  purchase_ticket_paid: {
    title: 'Achat confirmé',
    body_one: 'Votre billet pour {{event}} est dans Billets.',
    body_other: 'Vos {{count}} billets pour {{event}} sont dans Billets.',
  },
  purchase_booking_paid: {
    title: 'Réservation confirmée',
    body: '{{offer}}, {{date}}. Votre code apparaît le jour même.',
  },
  purchase_expired: {
    title: 'Achat non finalisé',
    body: 'Le paiement de {{offer}} n’est pas arrivé à temps et la place a été libérée. Vous pouvez acheter à nouveau.',
    bodyGeneric:
      'Le paiement n’est pas arrivé à temps et la place a été libérée. Vous pouvez acheter à nouveau.',
  },
  ticket_reminder_day: {
    title: 'Votre événement, c’est demain',
    body: '{{event}}, {{date}}. Le code du billet apparaît à partir de minuit.',
  },
  ticket_reminder_soon: {
    title: 'Ça commence bientôt',
    body: '{{event}} commence dans moins de 2 heures. Votre billet est dans Billets.',
  },
  booking_reminder_day: {
    title: 'Votre réservation, c’est demain',
    body: '{{offer}}, {{date}}. Votre code apparaît à partir de minuit.',
  },
  booking_reminder_soon: {
    title: 'C’est bientôt',
    body: '{{offer}} commence dans moins de 2 heures. Votre code est dans Réservations.',
  },
  review_request: {
    title: 'C’était comment ?',
    body: 'Racontez-nous comment s’est passé {{offer}}. Votre avis aide les autres voyageurs.',
    bodyGeneric: 'Racontez-nous comment ça s’est passé. Votre avis aide les autres voyageurs.',
  },
  review_reply_received: {
    title: 'On a répondu à votre avis',
    body: '{{business}} a répondu à ce que vous avez écrit.',
    bodyGeneric: 'L’établissement a répondu à ce que vous avez écrit.',
  },
  review_report_decided: {
    title: 'Nous avons examiné votre signalement',
    body: 'Merci de nous avoir prévenus. L’examen est terminé.',
  },
  account_username_changed: {
    title: 'Votre @ a changé',
    body: 'Vous êtes maintenant {{username}}. Si ce n’était pas vous, contactez-nous.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};
