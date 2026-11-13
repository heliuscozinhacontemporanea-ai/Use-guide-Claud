import type { TicketWalletTranslation } from './ticketWalletResources';

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
    transfer: 'Transférer',
    return: 'Rendre',
  },
  swap: {
    action: 'Un problème avec le QR code ?',
    title: 'Remplacer le QR code ?',
    message:
      'À utiliser si quelqu’un a vu ou copié votre QR code. Le QR et le code actuels ne fonctionnent plus, et vous ne pouvez le faire qu’une fois. Si l’entrée est hors ligne, l’ancien QR peut encore passer jusqu’à sa mise à jour : arrivez tôt et montrez votre pièce d’identité si besoin.',
    confirm: 'Remplacer le QR code',
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
    qrSwapped: 'QR code remplacé. L’ancien et l’ancien code ne sont plus valables.',
    refundRequested: 'Remboursement demandé. Vous le recevrez par le même moyen de paiement.',
    alreadyPaid: 'Votre paiement était déjà confirmé. Billets mis à jour.',
    paid: 'Paiement confirmé et billets émis !',
  },
  errors: {
    qr: 'Impossible de générer le QR code.',
    qrSwap: 'Impossible de remplacer le QR code.',
    refund: 'Impossible de demander le remboursement.',
    resume: 'Impossible de reprendre le paiement de cette commande.',
  },
};
