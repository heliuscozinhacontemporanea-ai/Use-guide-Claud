/**
 * Venda por veículo em dias abertos (F3b, D34): aluguel e translado privativo. O parceiro abre dias com
 * o número de veículos; períodos fixos, saídas e horário personalizado usam os mesmos veículos.
 */

/** Início dos horários escolhidos pelo cliente: de 30 em 30 minutos. */
export const FLEET_STEP_MINUTES = 30;

/** Opção de preço do aluguel por hora (horário personalizado). */
export const HOURLY_PRICE_OPTION_ID = 'hourly';

/** Período fixo do aluguel ou saída do translado, na hora do lugar. */
export interface FleetPeriod {
  /** Aluguel: o mesmo ID da opção de preço do período. */
  id: string;
  /** "HH:MM" na hora do lugar. */
  start: string;
  /** Aluguel: duração do período. Translado: a duração da oferta (tempo de viagem). */
  minutes: number;
}

/** Horário escolhido pelo cliente, quando o parceiro oferece. */
export type FleetCustom =
  /** Aluguel: o cliente escolhe o início e quantas horas; o preço por hora fica na opção `hourly`. */
  | { mode: 'hours'; minHours: number }
  /** Translado privativo: o cliente escolhe a hora da busca dentro do atendimento. */
  | { mode: 'time'; from: string; to: string; minNoticeHours: number };

export interface FleetSchedule {
  fixed: FleetPeriod[];
  custom?: FleetCustom;
}

/** Intervalo que uma reserva ocupa no dia (no translado, ida e volta). */
export interface FleetHold {
  bookingId: string;
  startsAt: string;
  endsAt: string;
  units: number;
}

/** Dia aberto de uma oferta por veículo (Interna, só backend). */
export interface FleetDay {
  id: string;
  offerId: string;
  /** Data na hora do lugar ("AAAA-MM-DD"). */
  date: string;
  /** Veículos disponíveis no dia; 0 fecha o dia para novas reservas. */
  vehicles: number;
  /** Aluguel: horário de funcionamento do anúncio no dia, copiado ao abrir (UTC). */
  opensAt?: string;
  closesAt?: string;
  holds: FleetHold[];
  /**
   * Horário de serviço já criado para cada início e fim ("início|fim"): reservas do mesmo horário ficam
   * juntas na agenda, no código de check-in e no "Cheguei".
   */
  slotIndex: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/** Ocupação do dia vista de fora (sem as reservas). */
export interface FleetBusy {
  startsAt: string;
  endsAt: string;
  units: number;
}
