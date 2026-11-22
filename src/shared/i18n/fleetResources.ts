/** Aluguel e translado à venda (F3b, D34): editor da oferta e dias com veículos. */
export interface FleetTranslation {
  editor: {
    vehicleLegend: string;
    noVehicles: string;
    periodsLegend: string;
    periodsHint: string;
    periodStart: string;
    periodPrice: string;
    addPeriod: string;
    removePeriod: string;
    periodSummary: string;
    noPrice: string;
    customLegend: string;
    hourlyHint: string;
    minHours: string;
    hourlyPrice: string;
    peoplePerVehicle: string;
    passengersPerVehicle: string;
    maxVehicles: string;
    rentalPickupLegend: string;
    pickupStore: string;
    pickupDelivery: string;
    licenseLegend: string;
    yes: string;
    no: string;
    routeLegend: string;
    noRoutes: string;
    transferTypeLegend: string;
    privateTitle: string;
    privateHint: string;
    sharedTitle: string;
    sharedHint: string;
    vehiclePrice: string;
    travelTime: string;
    transferPickupLegend: string;
    pickupAddress: string;
    pickupMeeting: string;
    departuresLegend: string;
    departureTime: string;
    addDeparture: string;
    removeDeparture: string;
    departureChip: string;
    anyTimeHint: string;
    anyTimeFrom: string;
    anyTimeTo: string;
    minNotice: string;
    optional: string;
  };
  days: {
    title: string;
    placeTime: string;
    open: string;
    from: string;
    to: string;
    weekdays: string;
    vehicles: string;
    vehiclesNote_one: string;
    vehiclesNote_other: string;
    rentalHoursHint: string;
    opened_one: string;
    opened_other: string;
    empty: string;
    vehiclesCount_one: string;
    vehiclesCount_other: string;
    busy_one: string;
    busy_other: string;
    busyKind_one: string;
    busyKind_other: string;
    kind: { period: string; departure: string; custom: string };
    footnote: string;
    free: string;
    closed: string;
    invalidRange: string;
  };
  booking: {
    tabFixedRental: string;
    tabCustomRental: string;
    tabFixedTransfer: string;
    tabCustomTransfer: string;
    chooseLabel: string;
    days: string;
    noTimes: string;
    free_one: string;
    free_other: string;
    soldOut: string;
    pickupTime: string;
    pickupTimeTransfer: string;
    hours: string;
    hoursHint: string;
    lessHours: string;
    moreHours: string;
    hourlyCalc: string;
    arrival: string;
    crossedTransfer: string;
    pickupAddressLabel: string;
    deliveryAddressLabel: string;
    vehicles: string;
    lessVehicles: string;
    moreVehicles: string;
    perVehicle_one: string;
    perVehicle_other: string;
    passengers_one: string;
    passengers_other: string;
    license: string;
    totalLabel: string;
    dayPart: { dawn: string; morning: string; afternoon: string; evening: string };
    periodLine: string;
    hourlyLine: string;
    vehicleLine: string;
    peopleUpTo_one: string;
    peopleUpTo_other: string;
    passengersUpTo_one: string;
    passengersUpTo_other: string;
    pickupStore: string;
    pickupDelivery: string;
    pickupAddress: string;
    pickupMeeting: string;
    needsLicense: string;
    privateTag: string;
    sharedTag: string;
    route: string;
  };
  /** Preço da oferta por veículo na lista do parceiro. */
  summary: {
    perVehicle: string;
    fromPerVehicle: string;
    perHour: string;
  };
}

export const fleetPtBR: FleetTranslation = {
  editor: {
    vehicleLegend: 'Veículo',
    noVehicles: 'Marque o que você aluga em Detalhes do aluguel, no anúncio.',
    periodsLegend: 'Períodos fixos',
    periodsHint: 'Ex.: 08:00 por 4 h, ou o dia inteiro.',
    periodStart: 'Início',
    periodPrice: 'Preço por veículo (R$)',
    addPeriod: 'Adicionar período',
    removePeriod: 'Remover período',
    periodSummary: '{{time}} · {{duration}}',
    noPrice: 'sem preço',
    customLegend: 'Horário personalizado',
    hourlyHint: 'O cliente escolhe quantas horas quer.',
    minHours: 'Mínimo de horas',
    hourlyPrice: 'Valor por hora (R$)',
    peoplePerVehicle: 'Pessoas por veículo',
    passengersPerVehicle: 'Passageiros por veículo',
    maxVehicles: 'Máximo de veículos por reserva',
    rentalPickupLegend: 'Retirada',
    pickupStore: 'Na loja (endereço do anúncio)',
    pickupDelivery: 'Entrega no endereço do cliente',
    licenseLegend: 'Exige CNH de quem dirige?',
    yes: 'Sim',
    no: 'Não',
    routeLegend: 'Trecho',
    noRoutes: 'Cadastre os trechos em Detalhes do translado, no anúncio.',
    transferTypeLegend: 'Tipo',
    privateTitle: 'Privativo',
    privateHint: 'Preço por veículo; o cliente escolhe a saída ou a hora.',
    sharedTitle: 'Compartilhado',
    sharedHint: 'Preço por pessoa; você abre as saídas com os lugares em Horários.',
    vehiclePrice: 'Preço por veículo (R$)',
    travelTime: 'Tempo de viagem',
    transferPickupLegend: 'Onde busca o cliente',
    pickupAddress: 'No endereço do cliente',
    pickupMeeting: 'No ponto de encontro',
    departuresLegend: 'Saídas fixas',
    departureTime: 'Saída',
    addDeparture: 'Adicionar saída',
    removeDeparture: 'Remover saída',
    departureChip: 'Saída das {{time}}',
    anyTimeHint: 'O cliente escolhe a hora da busca.',
    anyTimeFrom: 'Atende de',
    anyTimeTo: 'Até',
    minNotice: 'Antecedência mínima (horas)',
    optional: '(opcional)',
  },
  days: {
    title: 'Dias e reservas',
    placeTime: 'Horário de {{city}}',
    open: 'Abrir dias',
    from: 'De',
    to: 'Até',
    weekdays: 'Dias da semana',
    vehicles: 'Veículos disponíveis por dia',
    vehiclesNote_one:
      'Os períodos, as saídas e o horário personalizado usam <b>esse {{count}} veículo</b>. O app não vende o mesmo veículo duas vezes no mesmo horário; 0 fecha o dia.',
    vehiclesNote_other:
      'Os períodos, as saídas e o horário personalizado usam <b>esses {{count}} veículos</b>. O app não vende o mesmo veículo duas vezes no mesmo horário; 0 fecha o dia.',
    rentalHoursHint: 'O horário de cada dia vem do anúncio; dia fechado no anúncio não abre.',
    opened_one: '{{count}} dia aberto.',
    opened_other: '{{count}} dias abertos.',
    empty: 'Nenhum dia aberto nesta semana.',
    vehiclesCount_one: '{{count}} veículo',
    vehiclesCount_other: '{{count}} veículos',
    busy_one: '{{start}}–{{end}} · {{count}} veículo',
    busy_other: '{{start}}–{{end}} · {{count}} veículos',
    busyKind_one: '{{start}}–{{end}} · {{count}} veículo ({{kind}})',
    busyKind_other: '{{start}}–{{end}} · {{count}} veículos ({{kind}})',
    kind: { period: 'período', departure: 'saída', custom: 'personalizado' },
    footnote:
      'Cada reserva tem o seu horário na Agenda, com código de check-in, “Cheguei” e repasse.',
    free: 'Livre',
    closed: 'Fechado',
    invalidRange: 'Escolha as datas e ao menos um dia da semana.',
  },
  booking: {
    tabFixedRental: 'Períodos',
    tabCustomRental: 'Personalizar',
    tabFixedTransfer: 'Saídas',
    tabCustomTransfer: 'Escolher horário',
    chooseLabel: 'Como reservar',
    days: 'Dia',
    noTimes: 'Sem horários neste dia.',
    free_one: '{{count}} livre',
    free_other: '{{count}} livres',
    soldOut: 'Esgotado',
    pickupTime: 'Retirada',
    pickupTimeTransfer: 'Hora da busca',
    hours: 'Horas',
    hoursHint: 'mínimo {{min}} h · devolução {{time}}',
    lessHours: 'Menos uma hora',
    moreHours: 'Mais uma hora',
    hourlyCalc: '{{hours}} h × {{price}}',
    arrival: 'Chegada prevista {{time}}.',
    crossedTransfer: 'Horários riscados: sem veículo livre (cada viagem ocupa ida e volta).',
    pickupAddressLabel: 'Endereço de busca',
    deliveryAddressLabel: 'Endereço de entrega',
    vehicles: 'Veículos',
    lessVehicles: 'Menos um veículo',
    moreVehicles: 'Mais um veículo',
    perVehicle_one: 'até {{count}} pessoa cada',
    perVehicle_other: 'até {{count}} pessoas cada',
    passengers_one: 'até {{count}} passageiro cada',
    passengers_other: 'até {{count}} passageiros cada',
    license: 'Quem vai dirigir tem CNH válida e vai apresentá-la na retirada.',
    totalLabel: 'Total',
    dayPart: {
      dawn: 'Madrugada',
      morning: 'Manhã',
      afternoon: 'Tarde',
      evening: 'Noite',
    },
    periodLine: '{{time}} · {{duration}} — {{price}} por veículo',
    hourlyLine: 'Por hora, mínimo {{count}} h — {{price}}',
    vehicleLine: '{{price}} por veículo',
    peopleUpTo_one: 'até {{count}} pessoa',
    peopleUpTo_other: 'até {{count}} pessoas',
    passengersUpTo_one: 'até {{count}} passageiro',
    passengersUpTo_other: 'até {{count}} passageiros',
    pickupStore: 'retirada na loja',
    pickupDelivery: 'entrega no seu endereço',
    pickupAddress: 'busca no seu endereço',
    pickupMeeting: 'saída do ponto de encontro',
    needsLicense: 'exige CNH',
    privateTag: 'Privativo',
    sharedTag: 'Compartilhado',
    route: '{{from}} → {{to}}',
  },
  summary: {
    perVehicle: '{{amount}} por veículo',
    fromPerVehicle: 'a partir de {{amount}} por veículo',
    perHour: '{{amount}} por hora',
  },
};
