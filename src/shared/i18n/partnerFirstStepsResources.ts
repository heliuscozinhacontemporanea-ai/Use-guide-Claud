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
