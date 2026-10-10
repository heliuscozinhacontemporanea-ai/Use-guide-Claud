import type { PartnerContentEventInput, PartnerContentItemInput } from '../types/partnerContent';

export interface PartnerContentPort {
  createItem(data: PartnerContentItemInput): Promise<string>;
  updateItem(id: string, data: Partial<PartnerContentItemInput>): Promise<void>;
  deleteItem(id: string): Promise<void>;
  createEvent(data: PartnerContentEventInput): Promise<string>;
  updateEvent(id: string, data: Partial<PartnerContentEventInput>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
}
