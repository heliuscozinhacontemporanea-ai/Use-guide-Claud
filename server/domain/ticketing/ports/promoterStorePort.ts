import type { EventPromoter } from '../types/promoterTypes';

export interface PromoterStorePort {
  /** Cria o convite com código único no evento; recusa se a pessoa já tem convite ou link ativo. */
  invite(input: Omit<EventPromoter, 'id' | 'code'>): Promise<EventPromoter>;
  get(id: string): Promise<EventPromoter | null>;
  /** Muda o status só a partir do esperado (convite → aceito/recusado; ativo → encerrado). */
  transition(
    id: string,
    from: EventPromoter['status'][],
    patch: Partial<Pick<EventPromoter, 'status' | 'acceptedAt' | 'declinedAt' | 'endedAt'>>
  ): Promise<EventPromoter>;
  listByEvent(eventListingId: string): Promise<EventPromoter[]>;
  listByPromoter(promoterUid: string): Promise<EventPromoter[]>;
  findByCode(eventListingId: string, code: string): Promise<EventPromoter | null>;
  /** Divulgações com este código em qualquer evento, para o link curto (C6). */
  listByCode(code: string): Promise<EventPromoter[]>;
  /** Exclusão de conta: apaga @ e nome guardados (§7.5). */
  anonymizePromoter(uid: string): Promise<number>;
}
