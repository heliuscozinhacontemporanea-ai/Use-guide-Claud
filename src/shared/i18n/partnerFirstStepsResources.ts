// Primeiros passos no "Resolva agora" (painel por segmento, 2026-11-09).
export interface PartnerFirstStepsTranslation {
  progress: string;
  title: {
    prepare: string;
    start_tours: string;
    start_rentals: string;
    start_transfers: string;
    start_events: string;
    complete_attraction: string;
    complete_lodging: string;
    complete_restaurant: string;
  };
  verify: { title: string; done: string; hint: string; hintShowcase: string; pending: string };
  account: { title: string; done: string; hint: string; locked: string };
  offer: {
    title_tours: string;
    title_rentals: string;
    title_transfers: string;
    done_tours: string;
    done_rentals: string;
    done_transfers: string;
    hint_tours: string;
    hint_rentals: string;
    hint_transfers: string;
  };
  event: { title: string; done: string; hint: string };
}

export const partnerFirstStepsPtBR: PartnerFirstStepsTranslation = {
  progress: '{{done}} de {{total}}',
  title: {
    prepare: 'Prepare-se para vender',
    start_tours: 'Comece a vender passeios',
    start_rentals: 'Comece a vender aluguéis',
    start_transfers: 'Comece a vender translados',
    start_events: 'Comece a vender ingressos',
    complete_attraction: 'Deixe sua atração completa',
    complete_lodging: 'Deixe sua hospedagem completa',
    complete_restaurant: 'Deixe seu restaurante completo',
  },
  verify: {
    title: 'Verificar estabelecimento',
    done: 'Estabelecimento verificado',
    hint: 'Envie o CNPJ para liberar as vendas.',
    hintShowcase: 'Ganha o selo de verificado no guia.',
    pending: 'Em análise. Avisamos quando terminar.',
  },
  account: {
    title: 'Criar conta de recebimento',
    done: 'Conta de recebimento pronta',
    hint: 'Sem ela você não recebe pelas vendas.',
    locked: 'Liberada depois da verificação.',
  },
  offer: {
    title_tours: 'Criar seu primeiro passeio',
    title_rentals: 'Criar seu primeiro aluguel',
    title_transfers: 'Criar seu primeiro translado',
    done_tours: 'Primeiro passeio criado',
    done_rentals: 'Primeiro aluguel criado',
    done_transfers: 'Primeiro translado criado',
    hint_tours: 'Com preço e horários disponíveis.',
    hint_rentals: 'Com preço, caução e períodos.',
    hint_transfers: 'Com rotas, preço e horários.',
  },
  event: {
    title: 'Criar seu primeiro evento',
    done: 'Primeiro evento criado',
    hint: 'Com sessões e lotes de ingressos.',
  },
};

export const partnerFirstStepsEn: PartnerFirstStepsTranslation = {
  progress: '{{done}} of {{total}}',
  title: {
    prepare: 'Get ready to sell',
    start_tours: 'Start selling tours',
    start_rentals: 'Start selling rentals',
    start_transfers: 'Start selling transfers',
    start_events: 'Start selling tickets',
    complete_attraction: 'Complete your attraction',
    complete_lodging: 'Complete your lodging',
    complete_restaurant: 'Complete your restaurant',
  },
  verify: {
    title: 'Verify your business',
    done: 'Business verified',
    hint: 'Send your CNPJ to unlock sales.',
    hintShowcase: 'Earns the verified badge in the guide.',
    pending: 'Under review. We will let you know.',
  },
  account: {
    title: 'Create a payout account',
    done: 'Payout account ready',
    hint: 'Without it you cannot receive your sales.',
    locked: 'Available after verification.',
  },
  offer: {
    title_tours: 'Create your first tour',
    title_rentals: 'Create your first rental',
    title_transfers: 'Create your first transfer',
    done_tours: 'First tour created',
    done_rentals: 'First rental created',
    done_transfers: 'First transfer created',
    hint_tours: 'With price and available times.',
    hint_rentals: 'With price, deposit and periods.',
    hint_transfers: 'With routes, price and times.',
  },
  event: {
    title: 'Create your first event',
    done: 'First event created',
    hint: 'With sessions and ticket batches.',
  },
};

export const partnerFirstStepsFr: PartnerFirstStepsTranslation = {
  progress: '{{done}} sur {{total}}',
  title: {
    prepare: 'Préparez-vous à vendre',
    start_tours: 'Commencez à vendre des excursions',
    start_rentals: 'Commencez à vendre des locations',
    start_transfers: 'Commencez à vendre des transferts',
    start_events: 'Commencez à vendre des billets',
    complete_attraction: 'Complétez votre attraction',
    complete_lodging: 'Complétez votre hébergement',
    complete_restaurant: 'Complétez votre restaurant',
  },
  verify: {
    title: 'Vérifier l’établissement',
    done: 'Établissement vérifié',
    hint: 'Envoyez le CNPJ pour débloquer les ventes.',
    hintShowcase: 'Obtient le badge vérifié dans le guide.',
    pending: 'En cours d’analyse. Nous vous préviendrons.',
  },
  account: {
    title: 'Créer un compte de versement',
    done: 'Compte de versement prêt',
    hint: 'Sans lui, vous ne recevez pas vos ventes.',
    locked: 'Disponible après la vérification.',
  },
  offer: {
    title_tours: 'Créer votre première excursion',
    title_rentals: 'Créer votre première location',
    title_transfers: 'Créer votre premier transfert',
    done_tours: 'Première excursion créée',
    done_rentals: 'Première location créée',
    done_transfers: 'Premier transfert créé',
    hint_tours: 'Avec prix et horaires disponibles.',
    hint_rentals: 'Avec prix, caution et périodes.',
    hint_transfers: 'Avec trajets, prix et horaires.',
  },
  event: {
    title: 'Créer votre premier événement',
    done: 'Premier événement créé',
    hint: 'Avec séances et lots de billets.',
  },
};
