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
    unitsLabel: string;
    unitOf: string;
    addName: string;
    changeName: string;
    nameTitle: string;
    nameLabel: string;
    nameHint: string;
    nameSave: string;
    nameSaved: string;
    nameLocked: string;
  };
  units: {
    person: string;
    group: string;
    groupTag: string;
    groups_one: string;
    groups_other: string;
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
    noMessage: string;
    noConfirm: string;
    confirmed: string;
    denied: string;
    refunded: string;
    businessFallback: string;
  };
  checkout: {
    pickupLabel: string;
    pickupHint: string;
    pickupPlaceholder: string;
    namesLater: string;
    namesHint: string;
    groupNote: string;
    groupLegend: string;
  };
  partner: {
    checkIn: string;
    entry: string;
    sheetTitle: string;
    entrySheetTitle: string;
    codeLabel: string;
    entryCodeLabel: string;
    character: string;
    submit: string;
    scan: string;
    scanning: string;
    scanLoading: string;
    stopScan: string;
    scanUnsupported: string;
    cameraDenied: string;
    success: string;
    successNamed: string;
    alreadyUsed: string;
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
    checkedIn: string;
    checkedInUnits: string;
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
    sellingUnitLegend: string;
    perPerson: string;
    perPersonHint: string;
    perGroup: string;
    perGroupHint: string;
    groupMaxLabel: string;
    maxGroupsLabel: string;
    requireNamesHint: string;
  };
}

export const serviceProofPtBR: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Código de check-in',
    entryTitle: 'Sua entrada',
    codeHint: 'Informe este código pessoalmente, na hora do serviço.',
    entryHint: 'Mostre o QR Code na portaria. Se a leitura falhar, informe o código.',
    warning:
      'Nunca informe o código por telefone ou mensagem. Ninguém do Use Guide pede este código.',
    notYet: 'Seu código aparece no dia do serviço, a partir de {{date}}.',
    checkedIn: 'Check-in feito em {{date}}.',
    loadError: 'Não foi possível carregar o código.',
    retry: 'Tentar de novo',
    qrAlt: 'QR Code da entrada',
    copyLabel: 'Código {{code}}',
    unitsLabel: 'Escolha a entrada',
    unitOf: '{{n}} de {{total}}',
    addName: 'Adicionar nome',
    changeName: 'Trocar nome',
    nameTitle: 'Nome nesta entrada',
    nameLabel: 'Nome completo',
    nameHint:
      'Na entrada, a pessoa mostra um documento com foto. O nome pode ser trocado uma vez, até 24 h antes.',
    nameSave: 'Salvar nome',
    nameSaved: 'Nome salvo.',
    nameLocked: 'Nome já trocado',
  },
  units: {
    person: 'Pessoa {{n}}',
    group: 'Grupo de até {{max}} pessoas',
    groupTag: 'Grupo',
    groups_one: '{{count}} grupo',
    groups_other: '{{count}} grupos',
  },
  buyer: {
    providerAbsent: '{{business}} não apareceu',
    providerAbsentTitle: '{{business}} não apareceu?',
    providerAbsentMessage: 'Avisamos agora. {{business}} tem 2 h para responder ao seu relato.',
    providerAbsentConfirm: 'Enviar relato',
    keep: 'Voltar',
    absenceSent: 'Relato enviado. {{business}} tem até {{date}} para responder.',
    absenceAdmin: '{{business}} diz que esteve no local. Nossa equipe decide em até 5 dias.',
    absenceRefunded: 'O relato foi aceito. Você recebe o valor pago de volta.',
    absenceWithdrawn: '{{business}} chegou e o check-in foi feito.',
    questionTitle: 'O serviço aconteceu?',
    questionMessage: 'Responda até {{date}}.',
    yes: 'Sim, aconteceu',
    no: 'Não aconteceu',
    noTitle: 'O serviço não aconteceu?',
    noMessage: 'Sua resposta é registrada e não pode ser mudada depois.',
    noConfirm: 'Confirmar',
    confirmed: 'Obrigado. O serviço foi confirmado.',
    denied: 'Resposta enviada. Nossa equipe analisa o caso em até 5 dias.',
    refunded: 'Resposta registrada. Você recebe o valor pago de volta.',
    businessFallback: 'A equipe',
  },
  checkout: {
    pickupLabel: 'Onde você está hospedado?',
    pickupHint: 'Só quem vai buscar você vê este endereço, e ele é apagado depois do serviço.',
    pickupPlaceholder: 'Nome da pousada ou endereço',
    namesLater: 'Informar depois',
    namesHint: 'Você pode informar os nomes depois, em Compras, até o dia.',
    groupNote: 'Cada grupo leva até {{max}} pessoas e recebe um código.',
    groupLegend: 'Grupos',
  },
  partner: {
    checkIn: 'Fazer check-in',
    entry: 'Portaria',
    sheetTitle: 'Check-in',
    entrySheetTitle: 'Portaria',
    codeLabel: 'Código do cliente',
    entryCodeLabel: 'Código da entrada',
    character: 'Caractere {{n}} de {{total}}',
    submit: 'Confirmar check-in',
    scan: 'Ler QR Code',
    scanning: 'Aponte a câmera para o QR Code',
    scanLoading: 'Abrindo a câmera…',
    stopScan: 'Parar câmera',
    scanUnsupported: 'Não foi possível abrir o leitor. Digite o código que aparece abaixo do QR.',
    cameraDenied: 'Sem acesso à câmera. Digite o código que aparece abaixo do QR.',
    success: 'Check-in feito · {{unit}}.',
    successNamed: 'Check-in feito: {{name}}. Confira o documento com foto.',
    alreadyUsed: 'Este código já foi usado às {{time}}.',
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
      'O serviço segue por sua conta e risco. O cliente vai confirmar se o serviço aconteceu.',
    noCodeReason: 'Motivo',
    reasons: {
      no_phone: 'Sem celular ou sem bateria',
      refused: 'Não quis informar',
      other: 'Outro',
    },
    noCodeConfirm: 'Registrar',
    absenceTitle: 'O cliente diz que você não compareceu',
    absenceMessage:
      'Responda até {{date}}. Sem resposta, o cliente recebe o reembolso integral e vale a multa de 20%.',
    wasThere: 'Eu estava lá',
    admitted: 'Não compareci',
    admittedTitle: 'Confirmar que não compareceu?',
    admittedMessage: 'O cliente recebe o reembolso integral e a multa de 20% é cobrada.',
    admittedConfirm: 'Confirmar',
    pickupAt: 'Buscar em: {{address}}',
    checkedIn: 'Check-in às {{time}}',
    checkedInUnits: 'Check-in às {{time}} · {{used}} de {{total}}',
    checkedInNoCode: 'Sem código às {{time}} · aguardando o cliente',
  },
  evidence: {
    title: 'Provas do serviço',
    checkIn: 'Check-in: {{date}} · {{method}} · {{used}} de {{total}}',
    methods: { code: 'com código', qr: 'pelo QR Code', no_code: 'sem código' },
    noCheckIn: 'Sem check-in',
    arrival: '"Cheguei": {{date}}',
    noArrival: 'Sem "Cheguei"',
    map: 'Ver local no mapa',
    absence: 'Relato de ausência: {{date}} · {{answer}}',
    answers: {
      was_there: 'o parceiro diz que esteve lá',
      admitted: 'o parceiro admitiu a falta',
      none: 'sem resposta',
    },
    confirmation: 'Cliente: {{answer}}',
    confirmationAnswers: {
      yes: 'o serviço aconteceu',
      no: 'o serviço não aconteceu',
      none: 'sem resposta',
    },
    noShow: 'Ausência marcada pelo parceiro',
    pickup: 'Endereço de busca: {{address}}',
    noCodeReason: 'Motivo do check-in sem código: {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Onde o serviço começa',
    meetingPoint: 'No ponto de encontro',
    buyerAddress: 'Buscar o cliente onde ele está',
    sellingUnitLegend: 'Como você vende',
    perPerson: 'Por pessoa',
    perPersonHint: 'Cada pessoa recebe um código.',
    perGroup: 'Por grupo',
    perGroupHint: 'Um código para o grupo inteiro, como um buggy ou um barco.',
    groupMaxLabel: 'Máximo de pessoas por grupo',
    maxGroupsLabel: 'Máximo de grupos por reserva',
    requireNamesHint: 'O nome aparece em cada entrada e a portaria confere com documento com foto.',
  },
};

export const serviceProofEn: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Check-in code',
    entryTitle: 'Your entry',
    codeHint: 'Tell this code in person, when the service starts.',
    entryHint: 'Show the QR code at the entrance. If it cannot be read, tell them the code.',
    warning: 'Never share the code by phone or message. No one at Use Guide asks for this code.',
    notYet: 'Your code appears on the day of the service, from {{date}}.',
    checkedIn: 'Checked in on {{date}}.',
    loadError: 'Could not load the code.',
    retry: 'Try again',
    qrAlt: 'Entry QR code',
    copyLabel: 'Code {{code}}',
    unitsLabel: 'Choose the entry',
    unitOf: '{{n}} of {{total}}',
    addName: 'Add name',
    changeName: 'Change name',
    nameTitle: 'Name on this entry',
    nameLabel: 'Full name',
    nameHint:
      'At the entrance, the person shows a photo ID. The name can be changed once, up to 24 h before.',
    nameSave: 'Save name',
    nameSaved: 'Name saved.',
    nameLocked: 'Name already changed',
  },
  units: {
    person: 'Person {{n}}',
    group: 'Group of up to {{max}} people',
    groupTag: 'Group',
    groups_one: '{{count}} group',
    groups_other: '{{count}} groups',
  },
  buyer: {
    providerAbsent: '{{business}} did not show up',
    providerAbsentTitle: '{{business}} did not show up?',
    providerAbsentMessage:
      'We will let them know now. {{business}} has 2 h to respond to your report.',
    providerAbsentConfirm: 'Send report',
    keep: 'Back',
    absenceSent: 'Report sent. {{business}} has until {{date}} to respond.',
    absenceAdmin: '{{business}} says they were there. Our team decides within 5 days.',
    absenceRefunded: 'Your report was accepted. You get the amount paid back.',
    absenceWithdrawn: '{{business}} arrived and the check-in was done.',
    questionTitle: 'Did the service happen?',
    questionMessage: 'Answer by {{date}}.',
    yes: 'Yes, it happened',
    no: 'It did not happen',
    noTitle: 'The service did not happen?',
    noMessage: 'Your answer is saved and cannot be changed later.',
    noConfirm: 'Confirm',
    confirmed: 'Thank you. The service was confirmed.',
    denied: 'Answer sent. Our team reviews the case within 5 days.',
    refunded: 'Answer saved. You get the amount paid back.',
    businessFallback: 'The team',
  },
  checkout: {
    pickupLabel: 'Where are you staying?',
    pickupHint: 'Only whoever picks you up sees this address, and it is deleted after the service.',
    pickupPlaceholder: 'Name of the guesthouse or address',
    namesLater: 'Add later',
    namesHint: 'You can add the names later, in Purchases, until the day.',
    groupNote: 'Each group takes up to {{max}} people and gets one code.',
    groupLegend: 'Groups',
  },
  partner: {
    checkIn: 'Check in',
    entry: 'Entrance',
    sheetTitle: 'Check-in',
    entrySheetTitle: 'Entrance',
    codeLabel: "Customer's code",
    entryCodeLabel: 'Entry code',
    character: 'Character {{n}} of {{total}}',
    submit: 'Confirm check-in',
    scan: 'Scan QR code',
    scanning: 'Point the camera at the QR code',
    scanLoading: 'Opening the camera…',
    stopScan: 'Stop camera',
    scanUnsupported: 'The reader could not open. Type the code shown below the QR.',
    cameraDenied: 'No camera access. Type the code shown below the QR.',
    success: 'Checked in · {{unit}}.',
    successNamed: 'Checked in: {{name}}. Check the photo ID.',
    alreadyUsed: 'This code was already used at {{time}}.',
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
      'The service goes ahead at your own risk. The customer will confirm whether the service happened.',
    noCodeReason: 'Reason',
    reasons: {
      no_phone: 'No phone or no battery',
      refused: 'Did not want to tell',
      other: 'Other',
    },
    noCodeConfirm: 'Save',
    absenceTitle: 'The customer says you did not show up',
    absenceMessage:
      'Respond by {{date}}. Without a response, the customer gets a full refund and the 20% penalty applies.',
    wasThere: 'I was there',
    admitted: 'I did not show up',
    admittedTitle: 'Confirm that you did not show up?',
    admittedMessage: 'The customer gets a full refund and the 20% penalty is charged.',
    admittedConfirm: 'Confirm',
    pickupAt: 'Pick up at: {{address}}',
    checkedIn: 'Checked in at {{time}}',
    checkedInUnits: 'Checked in at {{time}} · {{used}} of {{total}}',
    checkedInNoCode: 'Without code at {{time}} · waiting for the customer',
  },
  evidence: {
    title: 'Proof of service',
    checkIn: 'Check-in: {{date}} · {{method}} · {{used}} of {{total}}',
    methods: { code: 'with code', qr: 'by QR code', no_code: 'without code' },
    noCheckIn: 'No check-in',
    arrival: '"I\'m here": {{date}}',
    noArrival: 'No "I\'m here"',
    map: 'See place on the map',
    absence: 'No-show report: {{date}} · {{answer}}',
    answers: {
      was_there: 'the partner says they were there',
      admitted: 'the partner admitted not showing up',
      none: 'no response',
    },
    confirmation: 'Customer: {{answer}}',
    confirmationAnswers: {
      yes: 'the service happened',
      no: 'the service did not happen',
      none: 'no answer',
    },
    noShow: 'No-show marked by the partner',
    pickup: 'Pick-up address: {{address}}',
    noCodeReason: 'Reason for check-in without code: {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Where the service starts',
    meetingPoint: 'At the meeting point',
    buyerAddress: 'Pick up the customer where they are',
    sellingUnitLegend: 'How you sell',
    perPerson: 'Per person',
    perPersonHint: 'Each person gets a code.',
    perGroup: 'Per group',
    perGroupHint: 'One code for the whole group, like a buggy or a boat.',
    groupMaxLabel: 'Maximum people per group',
    maxGroupsLabel: 'Maximum groups per booking',
    requireNamesHint: 'The name shows on each entry and the staff checks it against a photo ID.',
  },
};

export const serviceProofFr: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Code d’enregistrement',
    entryTitle: 'Votre entrée',
    codeHint: 'Donnez ce code en personne, au moment du service.',
    entryHint: 'Montrez le QR code à l’entrée. Si la lecture échoue, donnez le code.',
    warning:
      'Ne communiquez jamais le code par téléphone ou par message. Personne chez Use Guide ne vous le demande.',
    notYet: 'Votre code apparaît le jour du service, à partir de {{date}}.',
    checkedIn: 'Enregistrement fait le {{date}}.',
    loadError: 'Impossible de charger le code.',
    retry: 'Réessayer',
    qrAlt: 'QR code de l’entrée',
    copyLabel: 'Code {{code}}',
    unitsLabel: 'Choisissez l’entrée',
    unitOf: '{{n}} sur {{total}}',
    addName: 'Ajouter un nom',
    changeName: 'Changer le nom',
    nameTitle: 'Nom sur cette entrée',
    nameLabel: 'Nom complet',
    nameHint:
      'À l’entrée, la personne présente une pièce d’identité avec photo. Le nom peut être changé une fois, jusqu’à 24 h avant.',
    nameSave: 'Enregistrer le nom',
    nameSaved: 'Nom enregistré.',
    nameLocked: 'Nom déjà changé',
  },
  units: {
    person: 'Personne {{n}}',
    group: 'Groupe de {{max}} personnes maximum',
    groupTag: 'Groupe',
    groups_one: '{{count}} groupe',
    groups_other: '{{count}} groupes',
  },
  buyer: {
    providerAbsent: '{{business}} n’est pas venu',
    providerAbsentTitle: '{{business}} n’est pas venu ?',
    providerAbsentMessage:
      'Nous prévenons tout de suite. {{business}} a 2 h pour répondre à votre signalement.',
    providerAbsentConfirm: 'Envoyer le signalement',
    keep: 'Retour',
    absenceSent: 'Signalement envoyé. {{business}} a jusqu’au {{date}} pour répondre.',
    absenceAdmin: '{{business}} dit avoir été sur place. Notre équipe décide sous 5 jours.',
    absenceRefunded: 'Votre signalement a été accepté. Vous êtes remboursé du montant payé.',
    absenceWithdrawn: '{{business}} est arrivé et l’enregistrement a été fait.',
    questionTitle: 'Le service a-t-il eu lieu ?',
    questionMessage: 'Répondez avant le {{date}}.',
    yes: 'Oui, il a eu lieu',
    no: 'Il n’a pas eu lieu',
    noTitle: 'Le service n’a pas eu lieu ?',
    noMessage: 'Votre réponse est enregistrée et ne pourra pas être modifiée.',
    noConfirm: 'Confirmer',
    confirmed: 'Merci. Le service est confirmé.',
    denied: 'Réponse envoyée. Notre équipe examine le cas sous 5 jours.',
    refunded: 'Réponse enregistrée. Vous êtes remboursé du montant payé.',
    businessFallback: 'L’équipe',
  },
  checkout: {
    pickupLabel: 'Où logez-vous ?',
    pickupHint:
      'Seule la personne qui vient vous chercher voit cette adresse, supprimée après le service.',
    pickupPlaceholder: 'Nom de la pousada ou adresse',
    namesLater: 'Plus tard',
    namesHint: 'Vous pouvez indiquer les noms plus tard, dans Achats, jusqu’au jour même.',
    groupNote: 'Chaque groupe compte jusqu’à {{max}} personnes et reçoit un code.',
    groupLegend: 'Groupes',
  },
  partner: {
    checkIn: 'Enregistrer',
    entry: 'Entrée',
    sheetTitle: 'Enregistrement',
    entrySheetTitle: 'Entrée',
    codeLabel: 'Code du client',
    entryCodeLabel: 'Code de l’entrée',
    character: 'Caractère {{n}} sur {{total}}',
    submit: 'Confirmer l’enregistrement',
    scan: 'Lire le QR code',
    scanning: 'Pointez la caméra vers le QR code',
    scanLoading: 'Ouverture de la caméra…',
    stopScan: 'Arrêter la caméra',
    scanUnsupported: 'Le lecteur n’a pas pu s’ouvrir. Saisissez le code affiché sous le QR.',
    cameraDenied: 'Pas d’accès à la caméra. Saisissez le code affiché sous le QR.',
    success: 'Enregistrement fait · {{unit}}.',
    successNamed: 'Enregistrement fait : {{name}}. Vérifiez la pièce d’identité.',
    alreadyUsed: 'Ce code a déjà été utilisé à {{time}}.',
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
      'Le service continue à vos risques. Le client confirmera si le service a eu lieu.',
    noCodeReason: 'Motif',
    reasons: {
      no_phone: 'Sans téléphone ou sans batterie',
      refused: 'N’a pas voulu le donner',
      other: 'Autre',
    },
    noCodeConfirm: 'Enregistrer',
    absenceTitle: 'Le client dit que vous n’êtes pas venu',
    absenceMessage:
      'Répondez avant le {{date}}. Sans réponse, le client est remboursé intégralement et la pénalité de 20 % s’applique.',
    wasThere: 'J’étais sur place',
    admitted: 'Je ne suis pas venu',
    admittedTitle: 'Confirmer que vous n’êtes pas venu ?',
    admittedMessage: 'Le client est remboursé intégralement et la pénalité de 20 % est facturée.',
    admittedConfirm: 'Confirmer',
    pickupAt: 'Prise en charge : {{address}}',
    checkedIn: 'Enregistré à {{time}}',
    checkedInUnits: 'Enregistré à {{time}} · {{used}} sur {{total}}',
    checkedInNoCode: 'Sans code à {{time}} · en attente du client',
  },
  evidence: {
    title: 'Preuves du service',
    checkIn: 'Enregistrement : {{date}} · {{method}} · {{used}} sur {{total}}',
    methods: { code: 'avec code', qr: 'par QR code', no_code: 'sans code' },
    noCheckIn: 'Pas d’enregistrement',
    arrival: '« Je suis arrivé » : {{date}}',
    noArrival: 'Pas de « Je suis arrivé »',
    map: 'Voir le lieu sur la carte',
    absence: 'Signalement d’absence : {{date}} · {{answer}}',
    answers: {
      was_there: 'le partenaire dit qu’il était sur place',
      admitted: 'le partenaire a reconnu son absence',
      none: 'sans réponse',
    },
    confirmation: 'Client : {{answer}}',
    confirmationAnswers: {
      yes: 'le service a eu lieu',
      no: 'le service n’a pas eu lieu',
      none: 'sans réponse',
    },
    noShow: 'Absence marquée par le partenaire',
    pickup: 'Adresse de prise en charge : {{address}}',
    noCodeReason: 'Motif de l’enregistrement sans code : {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Où le service commence',
    meetingPoint: 'Au point de rendez-vous',
    buyerAddress: 'Aller chercher le client là où il est',
    sellingUnitLegend: 'Comment vous vendez',
    perPerson: 'Par personne',
    perPersonHint: 'Chaque personne reçoit un code.',
    perGroup: 'Par groupe',
    perGroupHint: 'Un code pour tout le groupe, comme un buggy ou un bateau.',
    groupMaxLabel: 'Nombre maximum de personnes par groupe',
    maxGroupsLabel: 'Nombre maximum de groupes par réservation',
    requireNamesHint:
      'Le nom apparaît sur chaque entrée et l’accueil le vérifie avec une pièce d’identité.',
  },
};
