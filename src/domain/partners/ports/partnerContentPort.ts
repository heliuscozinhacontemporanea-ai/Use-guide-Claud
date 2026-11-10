import type { PartnerContentEventInput, PartnerContentItemInput } from '../types/partnerContent';

export interface PartnerContentPort {
  createItem(data: PartnerContentItemInput): Promise<string>;
  updateItem(id: string, data: Partial<PartnerContentItemInput>): Promise<void>;
  deleteItem(id: string): Promise<void>;
  /** Telefone do próprio anúncio que vende pelo app (fica fora do documento público, C2/B37). */
  getItemContact(id: string): Promise<{ phone: string | null }>;
  createEvent(data: PartnerContentEventInput): Promise<string>;
  updateEvent(id: string, data: Partial<PartnerContentEventInput>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
}
