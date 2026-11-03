/**
 * Textos do push no idioma de quem recebe (D25, §12.5). Espelho de src/shared/i18n/notifyTypesResources.ts,
 * com teste de paridade. Variantes `Generic` quando o nome não veio; plural por Intl.PluralRules.
 */
export type NotificationTypeTexts = Record<string, Record<string, string>>;

export const NOTIFICATION_TEXTS_PT_BR: NotificationTypeTexts = {
  ticket_received: {
    title: 'Você recebeu um ingresso',
    body: 'Um ingresso para {{event}} está na sua carteira.',
    bodyGeneric: 'Um ingresso novo está na sua carteira.',
  },
  ticket_returned: {
    title: 'Ingresso devolvido',
    body: 'O ingresso para {{event}} voltou para a sua carteira.',
    bodyGeneric: 'Um ingresso voltou para a sua carteira.',
  },
  ticket_link_accepted: {
    title: 'Ingresso entregue',
    body: '{{username}} recebeu o ingresso que você enviou.',
    bodyGeneric: 'O ingresso que você enviou foi recebido.',
  },
  ticket_qr_replaced: {
    title: 'QR Code trocado',
    body: 'O QR Code e o código anteriores não valem mais. Se não foi você, fale com a gente.',
  },
  event_canceled: {
    title: 'Evento cancelado',
    body: '{{event}} foi cancelado. Já pedimos o seu reembolso.',
    bodyGeneric: 'Um evento seu foi cancelado. Já pedimos o seu reembolso.',
  },
  event_postponed: {
    title: 'Evento com nova data',
    body: '{{event}} passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
    bodyGeneric: 'Um evento seu passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
  },
  booking_provider_arrived: {
    title: '{{business}} chegou',
    titleGeneric: 'Seu guia chegou',
    body: 'Estão esperando você no local combinado. Mostre o seu código.',
  },
  booking_no_show_marked: {
    title: 'Ausência registrada',
    body: '{{business}} registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
    bodyGeneric: 'O prestador registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
  },
  booking_absence_in_review: {
    title: 'Estamos analisando',
    body: '{{business}} diz que esteve no local. Respondemos em até 5 dias.',
    bodyGeneric: 'O prestador diz que esteve no local. Respondemos em até 5 dias.',
  },
  booking_absence_refunded_buyer: {
    title: 'Reembolso a caminho',
    body: 'Você recebe de volta o valor pago, com a taxa de serviço.',
  },
  booking_confirmation_asked: {
    title: 'Deu tudo certo?',
    body: 'Conte pra gente em Compras se o serviço aconteceu, em até 72 horas.',
  },
  sale_ticket: {
    title: 'Nova venda',
    body_one: '{{count}} ingresso vendido.',
    body_other: '{{count}} ingressos vendidos.',
  },
  sale_booking: {
    title: 'Nova reserva',
    body_one: '{{offer}} para {{count}} pessoa.',
    body_other: '{{offer}} para {{count}} pessoas.',
  },
  sale_claim_opened: {
    title: 'Cliente abriu uma reclamação',
    body: 'O valor desta venda fica guardado até a decisão, em até 5 dias.',
  },
  booking_absence_reported: {
    title: 'Cliente diz que você não foi',
    body: 'Responda em até 2 horas nas reservas do painel. Sem resposta, o cliente é reembolsado e vale a multa de 20%.',
  },
  booking_absence_refunded_partner: {
    title: 'Cliente reembolsado',
    body: 'Não houve resposta no prazo. O cliente foi reembolsado e vale a multa de 20%.',
  },
  booking_confirmation_denied: {
    title: 'Cliente abriu uma reclamação',
    body: 'O cliente disse que o serviço não aconteceu. O valor fica guardado até a decisão, em até 5 dias.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Cliente reembolsado',
    body: 'A chegada não foi confirmada com o código e o cliente disse que o serviço não aconteceu.',
  },
  booking_confirmation_expired_partner: {
    title: 'Cliente reembolsado',
    body: 'A chegada não foi confirmada com o código e o cliente não respondeu em 72 horas.',
  },
  review_received: {
    title: 'Nova avaliação',
    body_one: '{{user}} deu {{count}} estrela para {{item}}.',
    body_other: '{{user}} deu {{count}} estrelas para {{item}}.',
  },
  review_updated: {
    title: 'Avaliação atualizada',
    body_one: '{{user}} mudou a nota de {{item}} para {{count}} estrela.',
    body_other: '{{user}} mudou a nota de {{item}} para {{count}} estrelas.',
  },
  plan_expiring: {
    title: 'Seu plano está acabando',
    body_one: 'O plano de {{listing}} termina em {{count}} dia. Renove para manter o selo.',
    body_other: 'O plano de {{listing}} termina em {{count}} dias. Renove para manter o selo.',
  },
  plan_renewal_failed: {
    title: 'Não conseguimos renovar seu plano',
    body: 'O cartão não passou. Atualize a forma de pagamento para manter o selo.',
  },
  sale_daily_digest: {
    title: 'Suas vendas de hoje',
    body_one: '{{count}} venda ou reserva hoje. Veja os detalhes no painel.',
    body_other: '{{count}} vendas ou reservas hoje. Veja os detalhes no painel.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};

export const NOTIFICATION_TEXTS_EN: NotificationTypeTexts = {
  ticket_received: {
    title: 'You got a ticket',
    body: 'A ticket for {{event}} is in your wallet.',
    bodyGeneric: 'A new ticket is in your wallet.',
  },
  ticket_returned: {
    title: 'Ticket returned',
    body: 'The ticket for {{event}} is back in your wallet.',
    bodyGeneric: 'A ticket is back in your wallet.',
  },
  ticket_link_accepted: {
    title: 'Ticket delivered',
    body: '{{username}} got the ticket you sent.',
    bodyGeneric: 'The ticket you sent was received.',
  },
  ticket_qr_replaced: {
    title: 'QR code replaced',
    body: 'The previous QR code and code no longer work. If this wasn’t you, contact us.',
  },
  event_canceled: {
    title: 'Event canceled',
    body: '{{event}} was canceled. Your refund is on its way.',
    bodyGeneric: 'One of your events was canceled. Your refund is on its way.',
  },
  event_postponed: {
    title: 'Event has a new date',
    body: '{{event}} moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
    bodyGeneric: 'One of your events moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
  },
  booking_provider_arrived: {
    title: '{{business}} has arrived',
    titleGeneric: 'Your guide has arrived',
    body: 'They’re waiting for you at the meeting point. Show your code.',
  },
  booking_no_show_marked: {
    title: 'Marked as no-show',
    body: '{{business}} marked that you didn’t show up. If you were there, tell us in Purchases.',
    bodyGeneric: 'The provider marked that you didn’t show up. If you were there, tell us in Purchases.',
  },
  booking_absence_in_review: {
    title: 'We’re looking into it',
    body: '{{business}} says they were there. We’ll get back to you within 5 days.',
    bodyGeneric: 'The provider says they were there. We’ll get back to you within 5 days.',
  },
  booking_absence_refunded_buyer: {
    title: 'Refund on its way',
    body: 'You’ll get back what you paid, including the service fee.',
  },
  booking_confirmation_asked: {
    title: 'Did everything go well?',
    body: 'Let us know in Purchases whether the service happened, within 72 hours.',
  },
  sale_ticket: {
    title: 'New sale',
    body_one: '{{count}} ticket sold.',
    body_other: '{{count}} tickets sold.',
  },
  sale_booking: {
    title: 'New booking',
    body_one: '{{offer}} for {{count}} person.',
    body_other: '{{offer}} for {{count}} people.',
  },
  sale_claim_opened: {
    title: 'A customer opened a complaint',
    body: 'The money from this sale is held until a decision, within 5 days.',
  },
  booking_absence_reported: {
    title: 'Customer says you didn’t show up',
    body: 'Reply within 2 hours in your panel’s bookings. Without a reply, the customer is refunded and the 20% fine applies.',
  },
  booking_absence_refunded_partner: {
    title: 'Customer refunded',
    body: 'There was no reply in time. The customer was refunded and the 20% fine applies.',
  },
  booking_confirmation_denied: {
    title: 'A customer opened a complaint',
    body: 'The customer said the service didn’t happen. The money is held until a decision, within 5 days.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Customer refunded',
    body: 'Arrival wasn’t confirmed with the code and the customer said the service didn’t happen.',
  },
  booking_confirmation_expired_partner: {
    title: 'Customer refunded',
    body: 'Arrival wasn’t confirmed with the code and the customer didn’t reply within 72 hours.',
  },
  review_received: {
    title: 'New review',
    body_one: '{{user}} gave {{item}} {{count}} star.',
    body_other: '{{user}} gave {{item}} {{count}} stars.',
  },
  review_updated: {
    title: 'Review updated',
    body_one: '{{user}} changed their rating of {{item}} to {{count}} star.',
    body_other: '{{user}} changed their rating of {{item}} to {{count}} stars.',
  },
  plan_expiring: {
    title: 'Your plan is ending soon',
    body_one: 'The plan for {{listing}} ends in {{count}} day. Renew to keep the badge.',
    body_other: 'The plan for {{listing}} ends in {{count}} days. Renew to keep the badge.',
  },
  plan_renewal_failed: {
    title: 'We couldn’t renew your plan',
    body: 'The card was declined. Update your payment method to keep the badge.',
  },
  sale_daily_digest: {
    title: 'Today’s sales',
    body_one: '{{count}} sale or booking today. See the details in your panel.',
    body_other: '{{count}} sales or bookings today. See the details in your panel.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};

export const NOTIFICATION_TEXTS_FR: NotificationTypeTexts = {
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
    bodyGeneric: 'Un de vos événements est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
  },
  booking_provider_arrived: {
    title: '{{business}} est arrivé',
    titleGeneric: 'Votre guide est arrivé',
    body: 'On vous attend au point de rendez-vous. Montrez votre code.',
  },
  booking_no_show_marked: {
    title: 'Absence enregistrée',
    body: '{{business}} a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
    bodyGeneric: 'Le prestataire a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
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
    body_one: 'La formule de {{listing}} se termine dans {{count}} jour. Renouvelez-la pour garder le badge.',
    body_other: 'La formule de {{listing}} se termine dans {{count}} jours. Renouvelez-la pour garder le badge.',
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
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};
