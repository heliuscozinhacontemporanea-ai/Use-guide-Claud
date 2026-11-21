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
    vehiclesHint: string;
    rentalHoursHint: string;
    submit: string;
    opened_one: string;
    opened_other: string;
    empty: string;
    vehiclesCount_one: string;
    vehiclesCount_other: string;
    busy_one: string;
    busy_other: string;
    free: string;
    closed: string;
    invalidRange: string;
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
    vehiclesHint:
      'Os períodos, as saídas e o horário personalizado usam esses veículos. 0 fecha o dia.',
    rentalHoursHint: 'O horário de cada dia vem do anúncio; dia fechado no anúncio não abre.',
    submit: 'Abrir',
    opened_one: '{{count}} dia aberto.',
    opened_other: '{{count}} dias abertos.',
    empty: 'Nenhum dia aberto nesta semana.',
    vehiclesCount_one: '{{count}} veículo',
    vehiclesCount_other: '{{count}} veículos',
    busy_one: '{{start}}–{{end}} · {{count}} veículo',
    busy_other: '{{start}}–{{end}} · {{count}} veículos',
    free: 'Livre',
    closed: 'Fechado',
    invalidRange: 'Escolha as datas e ao menos um dia da semana.',
  },
};
