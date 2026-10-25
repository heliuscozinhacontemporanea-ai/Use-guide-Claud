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
type OrderStatusKey =
  | 'pending_payment'
  | 'payment_processing'
  | 'paid'
  | 'payment_failed'
  | 'expired'
  | 'refund_pending'
  | 'partially_refunded'
  | 'refunded'
  | 'canceled'
  | 'disputed';

export interface TicketWalletTranslation {
  back: string;
  refresh: string;
  loading: string;
  tabs: { tickets: string; orders: string };
  emptyTickets: string;
  emptyTicketsHint: string;
  emptyOrders: string;
  emptyOrdersHint: string;
  session: string;
  qrSigned: string;
  order: string;
  reservedUntil: string;
  refundConfirm: string;
  actions: { showQr: string; reissueQr: string; transfer: string; resume: string; refund: string };
  ticketStatus: Record<TicketStatusKey, string>;
  orderStatus: Record<OrderStatusKey, string>;
  transfer: { title: string; name: string; email: string; confirm: string };
  resume: { title: string; close: string };
  feedback: {
    qrReissued: string;
    transferred: string;
    refundRequested: string;
    alreadyPaid: string;
    paid: string;
  };
  errors: { qr: string; qrReissue: string; transfer: string; refund: string; resume: string };
}

export const ticketWalletPtBR: TicketWalletTranslation = {
  back: 'Voltar',
  refresh: 'Atualizar ingressos e pedidos',
  loading: 'Carregando seus ingressos…',
  tabs: { tickets: 'Meus ingressos ({{count}})', orders: 'Pedidos ({{count}})' },
  emptyTickets: 'Nenhum ingresso encontrado',
  emptyTicketsHint: 'Os ingressos e inscrições da agenda aparecem aqui.',
  emptyOrders: 'Nenhum pedido registrado',
  emptyOrdersHint: 'Você ainda não fez pedidos de ingressos.',
  session: 'Sessão: {{date}}',
  qrSigned: 'QR assinado • v{{version}}',
  order: 'Pedido #{{id}} • {{amount}}',
  reservedUntil: 'Reserva válida até {{time}}',
  refundConfirm: 'Cancelar o pedido e receber {{amount}} de reembolso?',
  actions: {
    showQr: 'Ver QR',
    reissueQr: 'Novo QR',
    transfer: 'Transferir',
    resume: 'Continuar pagamento',
    refund: 'Cancelar e pedir reembolso',
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
  orderStatus: {
    pending_payment: 'Pagamento pendente',
    payment_processing: 'Pagamento em processamento',
    paid: 'Pago',
    payment_failed: 'Pagamento recusado',
    expired: 'Expirado',
    refund_pending: 'Reembolso em processamento',
    partially_refunded: 'Reembolsado em parte',
    refunded: 'Reembolsado',
    canceled: 'Cancelado',
    disputed: 'Em disputa',
  },
  transfer: {
    title: 'Transferir ingresso #{{id}}',
    name: 'Nome do novo titular',
    email: 'E-mail do novo titular',
    confirm: 'Confirmar transferência',
  },
  resume: { title: 'Concluir pagamento do pedido #{{id}}', close: 'Fechar' },
  feedback: {
    qrReissued: 'Novo QR Code emitido. O anterior deixou de valer.',
    transferred: 'Ingresso transferido. O novo titular recebeu um QR Code novo.',
    refundRequested: 'Reembolso solicitado. Você recebe pelo mesmo meio de pagamento.',
    alreadyPaid: 'Seu pagamento já estava confirmado. Ingressos atualizados.',
    paid: 'Pagamento confirmado e ingressos emitidos!',
  },
  errors: {
    qr: 'Não foi possível gerar o QR Code.',
    qrReissue: 'Não foi possível emitir um novo QR Code.',
    transfer: 'Não foi possível transferir o ingresso.',
    refund: 'Não foi possível pedir o reembolso.',
    resume: 'Não foi possível retomar o pagamento deste pedido.',
  },
};

export const ticketWalletEn: TicketWalletTranslation = {
  back: 'Back',
  refresh: 'Refresh tickets and orders',
  loading: 'Loading your tickets…',
  tabs: { tickets: 'My tickets ({{count}})', orders: 'Orders ({{count}})' },
  emptyTickets: 'No tickets found',
  emptyTicketsHint: 'Tickets and registrations from the agenda show up here.',
  emptyOrders: 'No orders yet',
  emptyOrdersHint: 'You have not ordered tickets yet.',
  session: 'Session: {{date}}',
  qrSigned: 'Signed QR • v{{version}}',
  order: 'Order #{{id}} • {{amount}}',
  reservedUntil: 'Reservation valid until {{time}}',
  refundConfirm: 'Cancel the order and get a {{amount}} refund?',
  actions: {
    showQr: 'Show QR',
    reissueQr: 'New QR',
    transfer: 'Transfer',
    resume: 'Continue payment',
    refund: 'Cancel and request refund',
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
  orderStatus: {
    pending_payment: 'Payment pending',
    payment_processing: 'Payment processing',
    paid: 'Paid',
    payment_failed: 'Payment declined',
    expired: 'Expired',
    refund_pending: 'Refund in progress',
    partially_refunded: 'Partially refunded',
    refunded: 'Refunded',
    canceled: 'Canceled',
    disputed: 'Disputed',
  },
  transfer: {
    title: 'Transfer ticket #{{id}}',
    name: 'New holder name',
    email: 'New holder email',
    confirm: 'Confirm transfer',
  },
  resume: { title: 'Complete payment for order #{{id}}', close: 'Close' },
  feedback: {
    qrReissued: 'New QR code issued. The previous one is no longer valid.',
    transferred: 'Ticket transferred. The new holder received a new QR code.',
    refundRequested: 'Refund requested. You will receive it through the same payment method.',
    alreadyPaid: 'Your payment was already confirmed. Tickets updated.',
    paid: 'Payment confirmed and tickets issued!',
  },
  errors: {
    qr: 'Could not generate the QR code.',
    qrReissue: 'Could not issue a new QR code.',
    transfer: 'Could not transfer the ticket.',
    refund: 'Could not request the refund.',
    resume: 'Could not resume payment for this order.',
  },
};

export const ticketWalletFr: TicketWalletTranslation = {
  back: 'Retour',
  refresh: 'Actualiser les billets et commandes',
  loading: 'Chargement de vos billets…',
  tabs: { tickets: 'Mes billets ({{count}})', orders: 'Commandes ({{count}})' },
  emptyTickets: 'Aucun billet trouvé',
  emptyTicketsHint: 'Les billets et inscriptions de l’agenda apparaissent ici.',
  emptyOrders: 'Aucune commande',
  emptyOrdersHint: 'Vous n’avez pas encore commandé de billets.',
  session: 'Séance : {{date}}',
  qrSigned: 'QR signé • v{{version}}',
  order: 'Commande n° {{id}} • {{amount}}',
  reservedUntil: 'Réservation valable jusqu’à {{time}}',
  refundConfirm: 'Annuler la commande et recevoir un remboursement de {{amount}} ?',
  actions: {
    showQr: 'Voir le QR',
    reissueQr: 'Nouveau QR',
    transfer: 'Transférer',
    resume: 'Continuer le paiement',
    refund: 'Annuler et demander le remboursement',
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
  orderStatus: {
    pending_payment: 'Paiement en attente',
    payment_processing: 'Paiement en cours',
    paid: 'Payé',
    payment_failed: 'Paiement refusé',
    expired: 'Expiré',
    refund_pending: 'Remboursement en cours',
    partially_refunded: 'Remboursé en partie',
    refunded: 'Remboursé',
    canceled: 'Annulé',
    disputed: 'En litige',
  },
  transfer: {
    title: 'Transférer le billet n° {{id}}',
    name: 'Nom du nouveau titulaire',
    email: 'E-mail du nouveau titulaire',
    confirm: 'Confirmer le transfert',
  },
  resume: { title: 'Finaliser le paiement de la commande n° {{id}}', close: 'Fermer' },
  feedback: {
    qrReissued: 'Nouveau QR code émis. L’ancien n’est plus valable.',
    transferred: 'Billet transféré. Le nouveau titulaire a reçu un nouveau QR code.',
    refundRequested: 'Remboursement demandé. Vous le recevrez par le même moyen de paiement.',
    alreadyPaid: 'Votre paiement était déjà confirmé. Billets mis à jour.',
    paid: 'Paiement confirmé et billets émis !',
  },
  errors: {
    qr: 'Impossible de générer le QR code.',
    qrReissue: 'Impossible d’émettre un nouveau QR code.',
    transfer: 'Impossible de transférer le billet.',
    refund: 'Impossible de demander le remboursement.',
    resume: 'Impossible de reprendre le paiement de cette commande.',
  },
};
