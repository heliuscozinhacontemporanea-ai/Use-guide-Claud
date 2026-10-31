/** Textos da carteira de ingressos do comprador. pt-BR é a fonte. */
type TicketStatusKey =
  | 'reserved'
  | 'issued'
  | 'checked_in'
  | 'transferred'
  | 'refund_pending'
  | 'refunded'
  | 'canceled'
  | 'invalidated'
  | 'expired';
export interface TicketWalletTranslation {
  title: string;
  tabsLabel: string;
  back: string;
  refresh: string;
  loading: string;
  tabs: { upcoming: string; past: string };
  emptyUpcoming: string;
  emptyPast: string;
  session: string;
  code: { label: string; hint: string; warning: string; notYet: string };
  order: string;
  ticketCount_one: string;
  ticketCount_other: string;
  actions: { showQr: string; reissueQr: string; transfer: string };
  ticketStatus: Record<TicketStatusKey, string>;
  resume: { title: string; close: string };
  feedback: {
    qrReissued: string;
    refundRequested: string;
    alreadyPaid: string;
    paid: string;
  };
  errors: { qr: string; qrReissue: string; refund: string; resume: string };
}

export const ticketWalletPtBR: TicketWalletTranslation = {
  title: 'Ingressos',
  tabsLabel: 'Ingressos por data',
  back: 'Voltar',
  refresh: 'Atualizar ingressos',
  loading: 'Carregando seus ingressos…',
  tabs: { upcoming: 'Próximos ({{count}})', past: 'Anteriores ({{count}})' },
  emptyUpcoming: 'Nenhum ingresso para os próximos eventos.',
  emptyPast: 'Nenhum ingresso de eventos passados.',
  session: 'Sessão: {{date}}',
  code: {
    label: 'Código {{code}}',
    hint: 'Mostre o QR Code na entrada. Se a leitura falhar, informe o código.',
    warning:
      'Nunca informe o código por telefone ou mensagem. Ninguém do Use Guide pede este código.',
    notYet: 'O código aparece no dia do evento, a partir de {{date}}.',
  },
  order: 'Pedido #{{id}}',
  ticketCount_one: '{{count}} ingresso',
  ticketCount_other: '{{count}} ingressos',
  actions: {
    showQr: 'Ver QR',
    reissueQr: 'Novo QR',
    transfer: 'Transferir',
  },
  ticketStatus: {
    reserved: 'Reservado',
    issued: 'Emitido',
    checked_in: 'Utilizado',
    transferred: 'Transferido',
    refund_pending: 'Reembolso em processamento',
    refunded: 'Reembolsado',
    canceled: 'Cancelado',
    invalidated: 'Inválido',
    expired: 'Expirado',
  },
  resume: { title: 'Concluir pagamento do pedido #{{id}}', close: 'Fechar' },
  feedback: {
    qrReissued: 'Novo QR Code emitido. O anterior deixou de valer.',
    refundRequested: 'Reembolso solicitado. Você recebe pelo mesmo meio de pagamento.',
    alreadyPaid: 'Seu pagamento já estava confirmado. Ingressos atualizados.',
    paid: 'Pagamento confirmado e ingressos emitidos!',
  },
  errors: {
    qr: 'Não foi possível gerar o QR Code.',
    qrReissue: 'Não foi possível emitir um novo QR Code.',
    refund: 'Não foi possível pedir o reembolso.',
    resume: 'Não foi possível retomar o pagamento deste pedido.',
  },
};

export const ticketWalletEn: TicketWalletTranslation = {
  title: 'Tickets',
  tabsLabel: 'Tickets by date',
  back: 'Back',
  refresh: 'Refresh tickets',
  loading: 'Loading your tickets…',
  tabs: { upcoming: 'Upcoming ({{count}})', past: 'Past ({{count}})' },
  emptyUpcoming: 'No tickets for upcoming events.',
  emptyPast: 'No tickets for past events.',
  session: 'Session: {{date}}',
  code: {
    label: 'Code {{code}}',
    hint: 'Show the QR code at the entrance. If it cannot be read, tell them the code.',
    warning: 'Never share the code by phone or message. No one at Use Guide asks for this code.',
    notYet: 'The code appears on the day of the event, from {{date}}.',
  },
  order: 'Order #{{id}}',
  ticketCount_one: '{{count}} ticket',
  ticketCount_other: '{{count}} tickets',
  actions: {
    showQr: 'Show QR',
    reissueQr: 'New QR',
    transfer: 'Transfer',
  },
  ticketStatus: {
    reserved: 'Reserved',
    issued: 'Issued',
    checked_in: 'Used',
    transferred: 'Transferred',
    refund_pending: 'Refund in progress',
    refunded: 'Refunded',
    canceled: 'Canceled',
    invalidated: 'Invalid',
    expired: 'Expired',
  },
  resume: { title: 'Complete payment for order #{{id}}', close: 'Close' },
  feedback: {
    qrReissued: 'New QR code issued. The previous one is no longer valid.',
    refundRequested: 'Refund requested. You will receive it through the same payment method.',
    alreadyPaid: 'Your payment was already confirmed. Tickets updated.',
    paid: 'Payment confirmed and tickets issued!',
  },
  errors: {
    qr: 'Could not generate the QR code.',
    qrReissue: 'Could not issue a new QR code.',
    refund: 'Could not request the refund.',
    resume: 'Could not resume payment for this order.',
  },
};

export const ticketWalletFr: TicketWalletTranslation = {
  title: 'Billets',
  tabsLabel: 'Billets par date',
  back: 'Retour',
  refresh: 'Actualiser les billets',
  loading: 'Chargement de vos billets…',
  tabs: { upcoming: 'À venir ({{count}})', past: 'Passés ({{count}})' },
  emptyUpcoming: 'Aucun billet pour les prochains événements.',
  emptyPast: 'Aucun billet pour les événements passés.',
  session: 'Séance : {{date}}',
  code: {
    label: 'Code {{code}}',
    hint: 'Montrez le QR code à l’entrée. Si la lecture échoue, donnez le code.',
    warning:
      'Ne communiquez jamais le code par téléphone ou par message. Personne chez Use Guide ne vous le demande.',
    notYet: 'Le code apparaît le jour de l’événement, à partir de {{date}}.',
  },
  order: 'Commande n° {{id}}',
  ticketCount_one: '{{count}} billet',
  ticketCount_other: '{{count}} billets',
  actions: {
    showQr: 'Voir le QR',
    reissueQr: 'Nouveau QR',
    transfer: 'Transférer',
  },
  ticketStatus: {
    reserved: 'Réservé',
    issued: 'Émis',
    checked_in: 'Utilisé',
    transferred: 'Transféré',
    refund_pending: 'Remboursement en cours',
    refunded: 'Remboursé',
    canceled: 'Annulé',
    invalidated: 'Invalide',
    expired: 'Expiré',
  },
  resume: { title: 'Finaliser le paiement de la commande n° {{id}}', close: 'Fermer' },
  feedback: {
    qrReissued: 'Nouveau QR code émis. L’ancien n’est plus valable.',
    refundRequested: 'Remboursement demandé. Vous le recevrez par le même moyen de paiement.',
    alreadyPaid: 'Votre paiement était déjà confirmé. Billets mis à jour.',
    paid: 'Paiement confirmé et billets émis !',
  },
  errors: {
    qr: 'Impossible de générer le QR code.',
    qrReissue: 'Impossible d’émettre un nouveau QR code.',
    refund: 'Impossible de demander le remboursement.',
    resume: 'Impossible de reprendre le paiement de cette commande.',
  },
};
