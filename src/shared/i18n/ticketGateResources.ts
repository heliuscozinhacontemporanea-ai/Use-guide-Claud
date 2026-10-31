/** Textos da portaria de eventos: QR, código INGR e sessão sem internet (D20). pt-BR é a fonte. */
type OfflineReason =
  | 'notPrepared'
  | 'sessionExpired'
  | 'format'
  | 'signature'
  | 'expired'
  | 'otherSession'
  | 'notInManifest'
  | 'revoked'
  | 'used'
  | 'swappedConflict'
  | 'unsupported';

export interface TicketGateTranslation {
  scan: string;
  scanLoading: string;
  scanning: string;
  stopScan: string;
  scanUnsupported: string;
  cameraDenied: string;
  codeLabel: string;
  character: string;
  submit: string;
  success: string;
  holderFallback: string;
  failed: string;
  codeNeedsInternet: string;
  offlineSaved: string;
  offline: Record<OfflineReason, string>;
  online: string;
  offlineMode: string;
  prepared_one: string;
  prepared_other: string;
  notPrepared: string;
  offlineHint: string;
  prepare: string;
  prepareAgain: string;
  sync_one: string;
  sync_other: string;
  preparedNotice_one: string;
  preparedNotice_other: string;
  synced_one: string;
  synced_other: string;
  syncedConflicts_one: string;
  syncedConflicts_other: string;
  recent: string;
  entries_one: string;
  entries_other: string;
  ticketRef: string;
  method: { online: string; offline: string };
}

export const ticketGatePtBR: TicketGateTranslation = {
  scan: 'Ler QR Code',
  scanLoading: 'Abrindo a câmera…',
  scanning: 'Aponte a câmera para o QR Code do ingresso',
  stopScan: 'Parar câmera',
  scanUnsupported: 'Não foi possível abrir o leitor. Digite o código que aparece abaixo do QR.',
  cameraDenied: 'Sem acesso à câmera. Digite o código que aparece abaixo do QR.',
  codeLabel: 'Código do ingresso',
  character: 'Caractere {{n}} de {{total}}',
  submit: 'Confirmar check-in',
  success: 'Entrada liberada: {{name}} · {{type}}.',
  holderFallback: 'Ingresso válido',
  failed: 'Não foi possível validar o ingresso.',
  codeNeedsInternet: 'Sem internet o código não vale. Leia o QR Code.',
  offlineSaved:
    'QR válido, conferido sem internet. A entrada será enviada quando a conexão voltar.',
  offline: {
    notPrepared: 'Sem internet e sem sessão preparada: prepare o check-in sem internet antes.',
    sessionExpired: 'A sessão sem internet venceu. Conecte-se e prepare de novo.',
    format: 'Este QR não é um ingresso do Use Guide.',
    signature: 'QR adulterado ou falso.',
    expired: 'Este QR venceu.',
    otherSession: 'Este ingresso é de outra sessão do evento.',
    notInManifest: 'Ingresso já usado ou cancelado.',
    revoked: 'Este QR foi substituído (ingresso transferido).',
    used: 'Este ingresso já entrou por este aparelho.',
    swappedConflict:
      'QR trocado pelo titular depois de uma entrada com o QR antigo: confira o documento.',
    unsupported: 'Este aparelho não confere QR sem internet. Use outro ou aguarde o sinal.',
  },
  online: 'Com internet',
  offlineMode: 'Sem internet',
  prepared_one: 'Pronto para funcionar sem internet · {{count}} ingresso',
  prepared_other: 'Pronto para funcionar sem internet · {{count}} ingressos',
  notPrepared: 'Check-in sem internet não preparado',
  offlineHint:
    'Prepare antes de abrir os portões. Sem sinal, o QR é conferido no aparelho e as entradas são enviadas depois.',
  prepare: 'Preparar sem internet',
  prepareAgain: 'Atualizar lista',
  sync_one: 'Enviar {{count}} entrada guardada',
  sync_other: 'Enviar {{count}} entradas guardadas',
  preparedNotice_one: 'Pronto: {{count}} ingresso salvo no aparelho.',
  preparedNotice_other: 'Pronto: {{count}} ingressos salvos no aparelho.',
  synced_one: '{{count}} entrada enviada.',
  synced_other: '{{count}} entradas enviadas.',
  syncedConflicts_one: '{{count}} entrada já tinha sido feita em outro aparelho.',
  syncedConflicts_other: '{{count}} entradas já tinham sido feitas em outro aparelho.',
  recent: 'Entradas feitas',
  entries_one: '{{count}} entrada',
  entries_other: '{{count}} entradas',
  ticketRef: 'Ingresso #{{id}}',
  method: { online: 'com internet', offline: 'enviada depois' },
};

export const ticketGateEn: TicketGateTranslation = {
  scan: 'Scan QR code',
  scanLoading: 'Opening the camera…',
  scanning: 'Point the camera at the ticket QR code',
  stopScan: 'Stop camera',
  scanUnsupported: 'The reader could not open. Type the code shown below the QR.',
  cameraDenied: 'No camera access. Type the code shown below the QR.',
  codeLabel: 'Ticket code',
  character: 'Character {{n}} of {{total}}',
  submit: 'Confirm check-in',
  success: 'Entry allowed: {{name}} · {{type}}.',
  holderFallback: 'Valid ticket',
  failed: 'Could not validate the ticket.',
  codeNeedsInternet: 'Without internet the code is not valid. Scan the QR code.',
  offlineSaved: 'Valid QR, checked offline. The entry will be sent when the connection is back.',
  offline: {
    notPrepared: 'No internet and no prepared session: prepare offline check-in first.',
    sessionExpired: 'The offline session expired. Connect and prepare it again.',
    format: 'This QR is not a Use Guide ticket.',
    signature: 'Tampered or fake QR.',
    expired: 'This QR has expired.',
    otherSession: 'This ticket is for another session of the event.',
    notInManifest: 'Ticket already used or canceled.',
    revoked: 'This QR was replaced (ticket transferred).',
    used: 'This ticket already entered on this device.',
    swappedConflict: 'QR replaced by the holder after an entry with the old QR: check the ID.',
    unsupported: 'This device cannot check QR codes offline. Use another one or wait for signal.',
  },
  online: 'Online',
  offlineMode: 'Offline',
  prepared_one: 'Ready to work offline · {{count}} ticket',
  prepared_other: 'Ready to work offline · {{count}} tickets',
  notPrepared: 'Offline check-in not prepared',
  offlineHint:
    'Prepare before opening the gates. Without signal, the QR is checked on the device and entries are sent later.',
  prepare: 'Prepare offline',
  prepareAgain: 'Update list',
  sync_one: 'Send {{count}} saved entry',
  sync_other: 'Send {{count}} saved entries',
  preparedNotice_one: 'Ready: {{count}} ticket saved on the device.',
  preparedNotice_other: 'Ready: {{count}} tickets saved on the device.',
  synced_one: '{{count}} entry sent.',
  synced_other: '{{count}} entries sent.',
  syncedConflicts_one: '{{count}} entry had already been made on another device.',
  syncedConflicts_other: '{{count}} entries had already been made on another device.',
  recent: 'Entries made',
  entries_one: '{{count}} entry',
  entries_other: '{{count}} entries',
  ticketRef: 'Ticket #{{id}}',
  method: { online: 'online', offline: 'sent later' },
};

export const ticketGateFr: TicketGateTranslation = {
  scan: 'Lire le QR code',
  scanLoading: 'Ouverture de la caméra…',
  scanning: 'Pointez la caméra vers le QR code du billet',
  stopScan: 'Arrêter la caméra',
  scanUnsupported: 'Le lecteur n’a pas pu s’ouvrir. Saisissez le code affiché sous le QR.',
  cameraDenied: 'Pas d’accès à la caméra. Saisissez le code affiché sous le QR.',
  codeLabel: 'Code du billet',
  character: 'Caractère {{n}} sur {{total}}',
  submit: 'Confirmer l’entrée',
  success: 'Entrée autorisée : {{name}} · {{type}}.',
  holderFallback: 'Billet valide',
  failed: 'Impossible de valider le billet.',
  codeNeedsInternet: 'Sans internet, le code n’est pas valable. Lisez le QR code.',
  offlineSaved: 'QR valide, vérifié hors ligne. L’entrée sera envoyée au retour de la connexion.',
  offline: {
    notPrepared: 'Pas d’internet ni de session préparée : préparez d’abord l’entrée hors ligne.',
    sessionExpired: 'La session hors ligne a expiré. Connectez-vous et préparez-la à nouveau.',
    format: 'Ce QR n’est pas un billet Use Guide.',
    signature: 'QR modifié ou faux.',
    expired: 'Ce QR a expiré.',
    otherSession: 'Ce billet est pour une autre séance de l’événement.',
    notInManifest: 'Billet déjà utilisé ou annulé.',
    revoked: 'Ce QR a été remplacé (billet transféré).',
    used: 'Ce billet est déjà entré avec cet appareil.',
    swappedConflict:
      'QR remplacé par le titulaire après une entrée avec l’ancien QR : vérifiez la pièce d’identité.',
    unsupported:
      'Cet appareil ne vérifie pas les QR hors ligne. Utilisez-en un autre ou attendez le réseau.',
  },
  online: 'En ligne',
  offlineMode: 'Hors ligne',
  prepared_one: 'Prêt à fonctionner hors ligne · {{count}} billet',
  prepared_other: 'Prêt à fonctionner hors ligne · {{count}} billets',
  notPrepared: 'Entrée hors ligne non préparée',
  offlineHint:
    'Préparez avant d’ouvrir les portes. Sans réseau, le QR est vérifié sur l’appareil et les entrées sont envoyées ensuite.',
  prepare: 'Préparer hors ligne',
  prepareAgain: 'Mettre à jour la liste',
  sync_one: 'Envoyer {{count}} entrée gardée',
  sync_other: 'Envoyer {{count}} entrées gardées',
  preparedNotice_one: 'Prêt : {{count}} billet enregistré sur l’appareil.',
  preparedNotice_other: 'Prêt : {{count}} billets enregistrés sur l’appareil.',
  synced_one: '{{count}} entrée envoyée.',
  synced_other: '{{count}} entrées envoyées.',
  syncedConflicts_one: '{{count}} entrée avait déjà été faite sur un autre appareil.',
  syncedConflicts_other: '{{count}} entrées avaient déjà été faites sur un autre appareil.',
  recent: 'Entrées faites',
  entries_one: '{{count}} entrée',
  entries_other: '{{count}} entrées',
  ticketRef: 'Billet #{{id}}',
  method: { online: 'en ligne', offline: 'envoyée ensuite' },
};
