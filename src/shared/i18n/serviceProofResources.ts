/** Textos da prova do serviço nas reservas (D20): código, QR, Cheguei, ausência e confirmação. pt-BR é a fonte. */
type Reasons = { no_phone: string; refused: string; other: string };

export interface ServiceProofTranslation {
  pass: {
    codeTitle: string;
    entryTitle: string;
    codeHint: string;
    entryHint: string;
    warning: string;
    notYet: string;
    checkedIn: string;
    loadError: string;
    retry: string;
    qrAlt: string;
    copyLabel: string;
  };
  buyer: {
    providerAbsent: string;
    providerAbsentTitle: string;
    providerAbsentMessage: string;
    providerAbsentConfirm: string;
    keep: string;
    absenceSent: string;
    absenceAdmin: string;
    absenceRefunded: string;
    absenceWithdrawn: string;
    questionTitle: string;
    questionMessage: string;
    yes: string;
    no: string;
    noTitle: string;
    noMessageRefund: string;
    noMessageReview: string;
    noConfirm: string;
    confirmed: string;
    denied: string;
    refunded: string;
  };
  checkout: {
    pickupLabel: string;
    pickupHint: string;
    pickupPlaceholder: string;
  };
  partner: {
    checkIn: string;
    entry: string;
    sheetTitle: string;
    entrySheetTitle: string;
    codeLabel: string;
    entryCodeLabel: string;
    character: string;
    participantsLabel: string;
    submit: string;
    scan: string;
    scanning: string;
    stopScan: string;
    scanUnsupported: string;
    cameraDenied: string;
    success_one: string;
    success_other: string;
    savedOffline: string;
    offlineValid: string;
    offlineInvalid: string;
    pending_one: string;
    pending_other: string;
    arrived: string;
    arrivedAt: string;
    locationDenied: string;
    noShow: string;
    noShowAt: string;
    noCode: string;
    noCodeMessage: string;
    noCodeReason: string;
    reasons: Reasons;
    noCodeConfirm: string;
    absenceTitle: string;
    absenceMessage: string;
    wasThere: string;
    admitted: string;
    admittedTitle: string;
    admittedMessage: string;
    admittedConfirm: string;
    pickupAt: string;
    checkedIn_one: string;
    checkedIn_other: string;
    checkedInNoCode: string;
  };
  evidence: {
    title: string;
    checkIn: string;
    methods: { code: string; qr: string; no_code: string };
    noCheckIn: string;
    arrival: string;
    noArrival: string;
    map: string;
    absence: string;
    answers: { was_there: string; admitted: string; none: string };
    confirmation: string;
    confirmationAnswers: { yes: string; no: string; none: string };
    noShow: string;
    pickup: string;
    noCodeReason: string;
  };
  offerEditor: {
    pickupLegend: string;
    meetingPoint: string;
    buyerAddress: string;
  };
}

export const serviceProofPtBR: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Código de check-in',
    entryTitle: 'Sua entrada',
    codeHint: 'Informe este código ao prestador, pessoalmente, na hora do serviço.',
    entryHint: 'Mostre o QR Code na portaria. Se a leitura falhar, informe o código.',
    warning:
      'Nunca informe o código por telefone ou mensagem. Ninguém do Use Guide pede este código.',
    notYet: 'Seu código aparece no dia do serviço, a partir de {{date}}.',
    checkedIn: 'Check-in feito em {{date}}.',
    loadError: 'Não foi possível carregar o código.',
    retry: 'Tentar de novo',
    qrAlt: 'QR Code da entrada',
    copyLabel: 'Código {{code}}',
  },
  buyer: {
    providerAbsent: 'O prestador não veio',
    providerAbsentTitle: 'O prestador não veio?',
    providerAbsentMessage:
      'O prestador tem 2 h para responder. Sem resposta, você recebe o valor pago de volta, com a taxa de serviço.',
    providerAbsentConfirm: 'Enviar relato',
    keep: 'Voltar',
    absenceSent: 'Relato enviado. O prestador tem até {{date}} para responder.',
    absenceAdmin: 'O prestador diz que esteve no local. Nossa equipe decide em até 5 dias.',
    absenceRefunded: 'O prestador não compareceu. Você recebe o valor pago de volta.',
    absenceWithdrawn: 'O prestador chegou e o check-in foi feito.',
    questionTitle: 'O serviço aconteceu?',
    questionMessage: 'Responda até {{date}}. Sem resposta, você recebe o valor pago de volta.',
    yes: 'Sim, aconteceu',
    no: 'Não aconteceu',
    noTitle: 'O serviço não aconteceu?',
    noMessageRefund: 'Você recebe o valor pago de volta.',
    noMessageReview:
      'Nossa equipe vai analisar o caso em até 5 dias. O valor pago pode voltar para você.',
    noConfirm: 'Confirmar',
    confirmed: 'Obrigado. O serviço foi confirmado.',
    denied: 'Resposta enviada.',
    refunded: 'Você recebe o valor pago de volta.',
  },
  checkout: {
    pickupLabel: 'Onde você está hospedado?',
    pickupHint:
      'O prestador busca você neste endereço. Só ele vê, e o endereço é apagado depois do serviço.',
    pickupPlaceholder: 'Nome da pousada ou endereço',
  },
  partner: {
    checkIn: 'Fazer check-in',
    entry: 'Portaria',
    sheetTitle: 'Check-in',
    entrySheetTitle: 'Portaria',
    codeLabel: 'Código do comprador',
    entryCodeLabel: 'Código da entrada',
    character: 'Caractere {{n}} de {{total}}',
    participantsLabel: 'Pessoas presentes',
    submit: 'Confirmar check-in',
    scan: 'Ler QR Code',
    scanning: 'Aponte a câmera para o QR Code',
    stopScan: 'Parar câmera',
    scanUnsupported: 'Este navegador não lê QR Code. Digite o código que aparece abaixo do QR.',
    cameraDenied: 'Sem acesso à câmera. Digite o código que aparece abaixo do QR.',
    success_one: 'Check-in feito: {{count}} pessoa.',
    success_other: 'Check-in feito: {{count}} pessoas.',
    savedOffline: 'Sem internet: o check-in foi guardado e será enviado quando a conexão voltar.',
    offlineValid:
      'QR válido, conferido sem internet. A entrada será enviada quando a conexão voltar.',
    offlineInvalid: 'QR inválido para este horário.',
    pending_one: '{{count}} check-in aguardando internet',
    pending_other: '{{count}} check-ins aguardando internet',
    arrived: 'Cheguei',
    arrivedAt: 'Chegada às {{time}}',
    locationDenied: 'Sem acesso à localização: a chegada foi registrada só com a hora.',
    noShow: 'Cliente não apareceu',
    noShowAt: 'Ausência disponível às {{time}}',
    noCode: 'Cliente sem código',
    noCodeMessage:
      'O serviço segue por sua conta e risco. O comprador vai confirmar se o serviço aconteceu.',
    noCodeReason: 'Motivo',
    reasons: {
      no_phone: 'Sem celular ou sem bateria',
      refused: 'Não quis informar',
      other: 'Outro',
    },
    noCodeConfirm: 'Registrar',
    absenceTitle: 'O comprador diz que você não veio',
    absenceMessage:
      'Responda até {{date}}. Sem resposta, o comprador recebe o reembolso integral e vale a multa de 20%.',
    wasThere: 'Eu estava lá',
    admitted: 'Não compareci',
    admittedTitle: 'Confirmar que não compareceu?',
    admittedMessage: 'O comprador recebe o reembolso integral e a multa de 20% é cobrada.',
    admittedConfirm: 'Confirmar',
    pickupAt: 'Buscar em: {{address}}',
    checkedIn_one: 'Check-in às {{time}} · {{count}} pessoa',
    checkedIn_other: 'Check-in às {{time}} · {{count}} pessoas',
    checkedInNoCode: 'Sem código às {{time}} · aguardando o comprador',
  },
  evidence: {
    title: 'Provas do serviço',
    checkIn: 'Check-in: {{date}} · {{method}} · {{present}} de {{total}} pessoas',
    methods: { code: 'com código', qr: 'pelo QR Code', no_code: 'sem código' },
    noCheckIn: 'Sem check-in',
    arrival: '"Cheguei": {{date}}',
    noArrival: 'Sem "Cheguei"',
    map: 'Ver local no mapa',
    absence: 'Relato de ausência: {{date}} · {{answer}}',
    answers: {
      was_there: 'o prestador diz que esteve lá',
      admitted: 'o prestador admitiu a falta',
      none: 'sem resposta',
    },
    confirmation: 'Comprador: {{answer}}',
    confirmationAnswers: {
      yes: 'o serviço aconteceu',
      no: 'o serviço não aconteceu',
      none: 'sem resposta',
    },
    noShow: 'Ausência marcada pelo prestador',
    pickup: 'Endereço de busca: {{address}}',
    noCodeReason: 'Motivo do check-in sem código: {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Onde o serviço começa',
    meetingPoint: 'No ponto de encontro',
    buyerAddress: 'Buscar o comprador onde ele está',
  },
};

export const serviceProofEn: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Check-in code',
    entryTitle: 'Your entry',
    codeHint: 'Tell this code to the provider, in person, when the service starts.',
    entryHint: 'Show the QR code at the entrance. If it cannot be read, tell them the code.',
    warning: 'Never share the code by phone or message. No one at Use Guide asks for this code.',
    notYet: 'Your code appears on the day of the service, from {{date}}.',
    checkedIn: 'Checked in on {{date}}.',
    loadError: 'Could not load the code.',
    retry: 'Try again',
    qrAlt: 'Entry QR code',
    copyLabel: 'Code {{code}}',
  },
  buyer: {
    providerAbsent: 'The provider did not show up',
    providerAbsentTitle: 'The provider did not show up?',
    providerAbsentMessage:
      'The provider has 2 h to respond. Without a response, you get the amount paid back, including the service fee.',
    providerAbsentConfirm: 'Send report',
    keep: 'Back',
    absenceSent: 'Report sent. The provider has until {{date}} to respond.',
    absenceAdmin: 'The provider says they were there. Our team decides within 5 days.',
    absenceRefunded: 'The provider did not show up. You get the amount paid back.',
    absenceWithdrawn: 'The provider arrived and the check-in was done.',
    questionTitle: 'Did the service happen?',
    questionMessage: 'Answer by {{date}}. Without an answer, you get the amount paid back.',
    yes: 'Yes, it happened',
    no: 'It did not happen',
    noTitle: 'The service did not happen?',
    noMessageRefund: 'You get the amount paid back.',
    noMessageReview:
      'Our team will review the case within 5 days. You may get the amount paid back.',
    noConfirm: 'Confirm',
    confirmed: 'Thank you. The service is confirmed.',
    denied: 'Answer sent.',
    refunded: 'You get the amount paid back.',
  },
  checkout: {
    pickupLabel: 'Where are you staying?',
    pickupHint:
      'The provider picks you up at this address. Only they can see it, and it is deleted after the service.',
    pickupPlaceholder: 'Name of the guesthouse or address',
  },
  partner: {
    checkIn: 'Check in',
    entry: 'Entrance',
    sheetTitle: 'Check-in',
    entrySheetTitle: 'Entrance',
    codeLabel: "Buyer's code",
    entryCodeLabel: 'Entry code',
    character: 'Character {{n}} of {{total}}',
    participantsLabel: 'People present',
    submit: 'Confirm check-in',
    scan: 'Scan QR code',
    scanning: 'Point the camera at the QR code',
    stopScan: 'Stop camera',
    scanUnsupported: 'This browser cannot read QR codes. Type the code shown below the QR.',
    cameraDenied: 'No camera access. Type the code shown below the QR.',
    success_one: 'Checked in: {{count}} person.',
    success_other: 'Checked in: {{count}} people.',
    savedOffline:
      'No internet: the check-in was saved and will be sent when the connection is back.',
    offlineValid: 'Valid QR, checked offline. The entry will be sent when the connection is back.',
    offlineInvalid: 'This QR is not valid for this time slot.',
    pending_one: '{{count}} check-in waiting for internet',
    pending_other: '{{count}} check-ins waiting for internet',
    arrived: "I'm here",
    arrivedAt: 'Arrived at {{time}}',
    locationDenied: 'No location access: the arrival was saved with the time only.',
    noShow: 'Customer did not show up',
    noShowAt: 'No-show available at {{time}}',
    noCode: 'Customer without code',
    noCodeMessage:
      'The service goes ahead at your own risk. The buyer will confirm whether the service happened.',
    noCodeReason: 'Reason',
    reasons: {
      no_phone: 'No phone or no battery',
      refused: 'Did not want to tell',
      other: 'Other',
    },
    noCodeConfirm: 'Save',
    absenceTitle: 'The buyer says you did not show up',
    absenceMessage:
      'Respond by {{date}}. Without a response, the buyer gets a full refund and the 20% penalty applies.',
    wasThere: 'I was there',
    admitted: 'I did not show up',
    admittedTitle: 'Confirm that you did not show up?',
    admittedMessage: 'The buyer gets a full refund and the 20% penalty is charged.',
    admittedConfirm: 'Confirm',
    pickupAt: 'Pick up at: {{address}}',
    checkedIn_one: 'Checked in at {{time}} · {{count}} person',
    checkedIn_other: 'Checked in at {{time}} · {{count}} people',
    checkedInNoCode: 'Without code at {{time}} · waiting for the buyer',
  },
  evidence: {
    title: 'Proof of service',
    checkIn: 'Check-in: {{date}} · {{method}} · {{present}} of {{total}} people',
    methods: { code: 'with code', qr: 'by QR code', no_code: 'without code' },
    noCheckIn: 'No check-in',
    arrival: '"I\'m here": {{date}}',
    noArrival: 'No "I\'m here"',
    map: 'See place on the map',
    absence: 'No-show report: {{date}} · {{answer}}',
    answers: {
      was_there: 'the provider says they were there',
      admitted: 'the provider admitted not showing up',
      none: 'no response',
    },
    confirmation: 'Buyer: {{answer}}',
    confirmationAnswers: {
      yes: 'the service happened',
      no: 'the service did not happen',
      none: 'no answer',
    },
    noShow: 'No-show marked by the provider',
    pickup: 'Pick-up address: {{address}}',
    noCodeReason: 'Reason for check-in without code: {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Where the service starts',
    meetingPoint: 'At the meeting point',
    buyerAddress: 'Pick up the buyer where they are',
  },
};

export const serviceProofFr: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Code d’enregistrement',
    entryTitle: 'Votre entrée',
    codeHint: 'Donnez ce code au prestataire, en personne, au moment du service.',
    entryHint: 'Montrez le QR code à l’entrée. Si la lecture échoue, donnez le code.',
    warning:
      'Ne communiquez jamais le code par téléphone ou par message. Personne chez Use Guide ne vous le demande.',
    notYet: 'Votre code apparaît le jour du service, à partir de {{date}}.',
    checkedIn: 'Enregistrement fait le {{date}}.',
    loadError: 'Impossible de charger le code.',
    retry: 'Réessayer',
    qrAlt: 'QR code de l’entrée',
    copyLabel: 'Code {{code}}',
  },
  buyer: {
    providerAbsent: 'Le prestataire n’est pas venu',
    providerAbsentTitle: 'Le prestataire n’est pas venu ?',
    providerAbsentMessage:
      'Le prestataire a 2 h pour répondre. Sans réponse, vous êtes remboursé du montant payé, frais de service compris.',
    providerAbsentConfirm: 'Envoyer le signalement',
    keep: 'Retour',
    absenceSent: 'Signalement envoyé. Le prestataire a jusqu’au {{date}} pour répondre.',
    absenceAdmin: 'Le prestataire dit qu’il était sur place. Notre équipe décide sous 5 jours.',
    absenceRefunded: 'Le prestataire n’est pas venu. Vous êtes remboursé du montant payé.',
    absenceWithdrawn: 'Le prestataire est arrivé et l’enregistrement a été fait.',
    questionTitle: 'Le service a-t-il eu lieu ?',
    questionMessage:
      'Répondez avant le {{date}}. Sans réponse, vous êtes remboursé du montant payé.',
    yes: 'Oui, il a eu lieu',
    no: 'Il n’a pas eu lieu',
    noTitle: 'Le service n’a pas eu lieu ?',
    noMessageRefund: 'Vous êtes remboursé du montant payé.',
    noMessageReview:
      'Notre équipe examinera le cas sous 5 jours. Le montant payé pourra vous être remboursé.',
    noConfirm: 'Confirmer',
    confirmed: 'Merci. Le service est confirmé.',
    denied: 'Réponse envoyée.',
    refunded: 'Vous êtes remboursé du montant payé.',
  },
  checkout: {
    pickupLabel: 'Où logez-vous ?',
    pickupHint:
      'Le prestataire vient vous chercher à cette adresse. Lui seul la voit, et elle est supprimée après le service.',
    pickupPlaceholder: 'Nom de la pousada ou adresse',
  },
  partner: {
    checkIn: 'Enregistrer',
    entry: 'Entrée',
    sheetTitle: 'Enregistrement',
    entrySheetTitle: 'Entrée',
    codeLabel: 'Code de l’acheteur',
    entryCodeLabel: 'Code de l’entrée',
    character: 'Caractère {{n}} sur {{total}}',
    participantsLabel: 'Personnes présentes',
    submit: 'Confirmer l’enregistrement',
    scan: 'Lire le QR code',
    scanning: 'Pointez la caméra vers le QR code',
    stopScan: 'Arrêter la caméra',
    scanUnsupported: 'Ce navigateur ne lit pas les QR codes. Saisissez le code affiché sous le QR.',
    cameraDenied: 'Pas d’accès à la caméra. Saisissez le code affiché sous le QR.',
    success_one: 'Enregistrement fait : {{count}} personne.',
    success_other: 'Enregistrement fait : {{count}} personnes.',
    savedOffline:
      'Pas d’internet : l’enregistrement a été gardé et sera envoyé au retour de la connexion.',
    offlineValid: 'QR valide, vérifié hors ligne. L’entrée sera envoyée au retour de la connexion.',
    offlineInvalid: 'Ce QR n’est pas valable pour ce créneau.',
    pending_one: '{{count}} enregistrement en attente d’internet',
    pending_other: '{{count}} enregistrements en attente d’internet',
    arrived: 'Je suis arrivé',
    arrivedAt: 'Arrivée à {{time}}',
    locationDenied:
      'Pas d’accès à la position : l’arrivée a été enregistrée avec l’heure seulement.',
    noShow: 'Le client n’est pas venu',
    noShowAt: 'Absence possible à {{time}}',
    noCode: 'Client sans code',
    noCodeMessage:
      'Le service continue à vos risques. L’acheteur confirmera si le service a eu lieu.',
    noCodeReason: 'Motif',
    reasons: {
      no_phone: 'Sans téléphone ou sans batterie',
      refused: 'N’a pas voulu le donner',
      other: 'Autre',
    },
    noCodeConfirm: 'Enregistrer',
    absenceTitle: 'L’acheteur dit que vous n’êtes pas venu',
    absenceMessage:
      'Répondez avant le {{date}}. Sans réponse, l’acheteur est remboursé intégralement et la pénalité de 20 % s’applique.',
    wasThere: 'J’étais sur place',
    admitted: 'Je ne suis pas venu',
    admittedTitle: 'Confirmer que vous n’êtes pas venu ?',
    admittedMessage: 'L’acheteur est remboursé intégralement et la pénalité de 20 % est facturée.',
    admittedConfirm: 'Confirmer',
    pickupAt: 'Prise en charge : {{address}}',
    checkedIn_one: 'Enregistré à {{time}} · {{count}} personne',
    checkedIn_other: 'Enregistré à {{time}} · {{count}} personnes',
    checkedInNoCode: 'Sans code à {{time}} · en attente de l’acheteur',
  },
  evidence: {
    title: 'Preuves du service',
    checkIn: 'Enregistrement : {{date}} · {{method}} · {{present}} sur {{total}} personnes',
    methods: { code: 'avec code', qr: 'par QR code', no_code: 'sans code' },
    noCheckIn: 'Pas d’enregistrement',
    arrival: '« Je suis arrivé » : {{date}}',
    noArrival: 'Pas de « Je suis arrivé »',
    map: 'Voir le lieu sur la carte',
    absence: 'Signalement d’absence : {{date}} · {{answer}}',
    answers: {
      was_there: 'le prestataire dit qu’il était sur place',
      admitted: 'le prestataire a reconnu son absence',
      none: 'sans réponse',
    },
    confirmation: 'Acheteur : {{answer}}',
    confirmationAnswers: {
      yes: 'le service a eu lieu',
      no: 'le service n’a pas eu lieu',
      none: 'sans réponse',
    },
    noShow: 'Absence marquée par le prestataire',
    pickup: 'Adresse de prise en charge : {{address}}',
    noCodeReason: 'Motif de l’enregistrement sans code : {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Où le service commence',
    meetingPoint: 'Au point de rendez-vous',
    buyerAddress: 'Aller chercher l’acheteur là où il est',
  },
};
