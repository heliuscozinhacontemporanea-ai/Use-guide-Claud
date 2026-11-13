/** Textos da prova do serviço nas reservas (D20): código, QR, Cheguei, ausência e confirmação. pt-BR é a fonte. */
type Reasons = { no_phone: string; refused: string; other: string };

export interface ServiceProofTranslation {
  pass: {
    codeTitle: string;
    entryTitle: string;
    codeHint: string;
    entryHint: string;
    warning: string;
    entryWarning: string;
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
    phoneLabel: string;
    phoneHint: string;
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
      'Este código é a sua entrada. Mostre só pessoalmente, na hora do serviço: não envie por mensagem, foto ou ligação. O Use Guide nunca pede o seu código.',
    entryWarning:
      'Este código é a sua entrada. Mostre só pessoalmente, na portaria: não envie por mensagem, foto ou ligação. O Use Guide nunca pede o seu código.',
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
    phoneLabel: 'Seu telefone (WhatsApp)',
    phoneHint: 'Mostraremos seu contato só no dia do serviço.',
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
