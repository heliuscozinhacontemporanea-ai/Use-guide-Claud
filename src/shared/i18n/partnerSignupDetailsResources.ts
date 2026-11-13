// Passo 3 do cadastro de parceiro (V2): rótulos e opções por categoria. As opções continuam gravadas
// com o texto em português (débito registrado); aqui só muda o que a pessoa vê.
export const DETAIL_OPTION_KEYS = [
  'licensedGuide',
  'transport',
  'waterSnack',
  'lunch',
  'stopTickets',
  'equipment',
  'photos',
  'insurance',
  'quad',
  'buggy',
  'utv',
  'bike',
  'ebike',
  'sup',
  'kayak',
  'kiteGear',
  'helmet',
  'fuel',
  'lifeVest',
  'map',
  'car',
  'pickup4x4',
  'van',
  'minibus',
  'jardineira',
  'aLaCarte',
  'american',
  'buffet',
  'vegan',
  'vegetarian',
  'glutenFree',
  'italian',
  'asian',
  'restaurant',
  'roomService',
  'bar',
  'reception24h',
  'sauna',
  'gym',
  'garden',
  'terrace',
  'airportShuttle',
  'familyRooms',
  'spa',
  'hotTub',
  'freeWifi',
  'airConditioning',
  'waterPark',
  'evCharging',
  'pool',
  'breakfast',
  'dinner',
  'snacks',
  'drinks',
  'wines',
  'delivery',
  'onlineBooking',
  'liveMusic',
  'privateEvents',
  'beachfront',
  'outdoorArea',
  'parking',
  'accessibility',
  'petsAllowed',
  'tourGuide',
  'equipmentRental',
  'restaurantBar',
  'lockerRooms',
  'camping',
  'eventSpace',
  'trails',
  'waterSports',
  'fishing',
  'boatTrips',
  'photography',
  'birdwatching',
  'ecotourism',
  'swimming',
] as const;

export type DetailOptionKey = (typeof DETAIL_OPTION_KEYS)[number];

export interface PartnerSignupDetailsTranslation {
  fields: {
    tourDuration: string;
    meetingPoint: string;
    itinerary: string;
    includes: string;
    rentalWhat: string;
    minHours: string;
    deposit: string;
    license: string;
    routes: string;
    from: string;
    to: string;
    removeRoute: string;
    addRoute: string;
    vehicles: string;
    maxPassengers: string;
    luggage: string;
    servesBreakfast: string;
    breakfastIncluded: string;
    breakfastIncludedYes: string;
    breakfastIncludedNo: string;
    breakfastPrice: string;
    breakfastTypes: string;
    amenities: string;
    menuLink: string;
    subcategory: string;
    cuisine: string;
    mealTypes: string;
    extraServices: string;
    sightAccess: string;
    paid: string;
    free: string;
    pricePerPerson: string;
    sightServices: string;
    sightAmenities: string;
    sightActivities: string;
    sightActivitiesHint: string;
  };
  placeholders: {
    tourDuration: string;
    meetingPoint: string;
    itinerary: string;
    minHours: string;
    from: string;
    to: string;
    maxPassengers: string;
    luggage: string;
    subcategory: string;
    cuisine: string;
  };
  additional: {
    title: string;
    languages: string;
    checkIn: string;
    checkOut: string;
    from: string;
    until: string;
    children: string;
    pets: string;
    petsYes: string;
    petsOnRequest: string;
    petsNo: string;
    petsCost: string;
    petsFree: string;
    petsPaid: string;
    hours: string;
    open: string;
    closed: string;
    opens: string;
    closes: string;
    nothing: string;
  };
  options: Record<DetailOptionKey, string>;
}

export const partnerSignupDetailsPtBR: PartnerSignupDetailsTranslation = {
  additional: {
    title: 'Funcionamento',
    languages: 'Idiomas atendidos',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    from: 'Das',
    until: 'Até',
    children: 'Aceita crianças?',
    pets: 'Aceita pets?',
    petsYes: 'Sim',
    petsOnRequest: 'Sob consulta',
    petsNo: 'Não',
    petsCost: 'Cobra pelos pets?',
    petsFree: 'Sem custo',
    petsPaid: 'Com custo extra',
    hours: 'Horário de funcionamento',
    open: 'Aberto',
    closed: 'Fechado',
    opens: 'Abre',
    closes: 'Fecha',
    nothing: 'Nada mais a preencher nesta categoria.',
  },
  fields: {
    tourDuration: 'Duração (horas)',
    meetingPoint: 'Ponto de encontro',
    itinerary: 'Roteiro',
    includes: 'O que está incluído',
    rentalWhat: 'O que é alugado',
    minHours: 'Período mínimo (horas)',
    deposit: 'Exige caução',
    license: 'Exige habilitação (CNH)',
    routes: 'Trechos atendidos',
    from: 'Origem',
    to: 'Destino',
    removeRoute: 'Remover trecho {{n}}',
    addRoute: 'Adicionar trecho',
    vehicles: 'Veículos',
    maxPassengers: 'Passageiros por veículo (máximo)',
    luggage: 'Bagagem',
    servesBreakfast: 'Serve café da manhã ao hóspede?',
    breakfastIncluded: 'O café está incluso no preço da estadia?',
    breakfastIncludedYes: 'Sim, está incluso',
    breakfastIncludedNo: 'Não, é cobrado à parte',
    breakfastPrice: 'Preço por pessoa e dia, com impostos',
    breakfastTypes: 'Tipos de café da manhã',
    amenities: 'Comodidades',
    menuLink: 'Link do cardápio',
    subcategory: 'Subcategoria',
    cuisine: 'Tipo de culinária',
    mealTypes: 'Refeições e bebidas',
    extraServices: 'Serviços adicionais',
    sightAccess: 'Acesso à atração',
    paid: 'Pago',
    free: 'Gratuito',
    pricePerPerson: 'Preço por pessoa',
    sightServices: 'Serviços oferecidos',
    sightAmenities: 'Estrutura',
    sightActivities: 'Atividades',
    sightActivitiesHint: 'O que o visitante pode fazer no lugar.',
  },
  placeholders: {
    tourDuration: 'Ex.: 4',
    meetingPoint: 'Ex.: em frente à igreja de Jeri',
    itinerary: 'Paradas, horários e o que o visitante vai ver',
    minHours: 'Ex.: 2',
    from: 'Ex.: Aeroporto de Fortaleza',
    to: 'Ex.: Jericoacoara',
    maxPassengers: 'Ex.: 4',
    luggage: 'Ex.: 1 mala grande e 1 de mão por pessoa',
    subcategory: 'Ex.: restaurante, bar, café',
    cuisine: 'Ex.: italiana, japonesa',
  },
  options: {
    licensedGuide: 'Guia credenciado',
    transport: 'Transporte',
    waterSnack: 'Água e lanche',
    lunch: 'Almoço',
    stopTickets: 'Ingressos das paradas',
    equipment: 'Equipamentos',
    photos: 'Fotos',
    insurance: 'Seguro',
    quad: 'Quadriciclo',
    buggy: 'Buggy',
    utv: 'UTV',
    bike: 'Bicicleta',
    ebike: 'Bicicleta elétrica',
    sup: 'Stand up paddle',
    kayak: 'Caiaque',
    kiteGear: 'Equipamento de kitesurf',
    helmet: 'Capacete',
    fuel: 'Combustível',
    lifeVest: 'Colete',
    map: 'Mapa',
    car: 'Carro',
    pickup4x4: 'Caminhonete 4x4',
    van: 'Van',
    minibus: 'Micro-ônibus',
    jardineira: 'Jardineira',
    aLaCarte: 'À la carte',
    american: 'Americano',
    buffet: 'Buffet',
    vegan: 'Vegano',
    vegetarian: 'Vegetariano',
    glutenFree: 'Sem glúten',
    italian: 'Italiano',
    asian: 'Asiático',
    restaurant: 'Restaurante',
    roomService: 'Serviço de quarto',
    bar: 'Bar',
    reception24h: 'Recepção 24 horas',
    sauna: 'Sauna',
    gym: 'Academia',
    garden: 'Jardim',
    terrace: 'Terraço',
    airportShuttle: 'Transporte para o aeroporto',
    familyRooms: 'Quartos familiares',
    spa: 'Spa',
    hotTub: 'Banheira de hidromassagem',
    freeWifi: 'Wi-Fi gratuito',
    airConditioning: 'Ar-condicionado',
    waterPark: 'Parque aquático',
    evCharging: 'Carregador de carro elétrico',
    pool: 'Piscina',
    breakfast: 'Café da manhã',
    dinner: 'Jantar',
    snacks: 'Petiscos',
    drinks: 'Drinks',
    wines: 'Vinhos',
    delivery: 'Delivery',
    onlineBooking: 'Reserva on-line',
    liveMusic: 'Música ao vivo',
    privateEvents: 'Eventos privados',
    beachfront: 'Pé na areia',
    outdoorArea: 'Área externa',
    parking: 'Estacionamento',
    accessibility: 'Acessibilidade',
    petsAllowed: 'Aceita pets',
    tourGuide: 'Guia',
    equipmentRental: 'Aluguel de equipamentos',
    restaurantBar: 'Restaurante ou bar',
    lockerRooms: 'Vestiários',
    camping: 'Área de camping',
    eventSpace: 'Espaço para eventos',
    trails: 'Trilhas',
    waterSports: 'Esportes aquáticos',
    fishing: 'Pesca',
    boatTrips: 'Passeios de barco',
    photography: 'Fotografia',
    birdwatching: 'Observação de aves',
    ecotourism: 'Ecoturismo',
    swimming: 'Banho de mar ou rio',
  },
};
