import type { InteractionCounter, ItemStats } from '../types/interaction';

export interface RecordInteractionInput {
  itemId: string;
  itemCollection: 'items' | 'events';
  counter: InteractionCounter;
  /** Dia no fuso do negócio (AAAA-MM-DD). */
  day: string;
  /** Chave opaca de quem interagiu com este item; só serve para não contar duas vezes. */
  guardId: string;
  now: Date;
  guardWindowMs: number;
}

export interface InsightsRepositoryPort {
  /** Soma 1 no contador do dia, salvo se o mesmo visitante já contou dentro da janela. */
  recordInteraction(input: RecordInteractionInput): Promise<boolean>;
  getItemStats(itemId: string, itemCollection: 'items' | 'events', today: Date): Promise<ItemStats>;
}
