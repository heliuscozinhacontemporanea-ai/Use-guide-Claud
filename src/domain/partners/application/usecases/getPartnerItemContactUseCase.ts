import { partnerContentAdapter } from '../../factory';

/** Telefone do próprio anúncio para o editor (o anúncio que vende não o publica, C2/B37). */
export function getPartnerItemContactUseCase(itemId: string): Promise<{ phone: string | null }> {
  return partnerContentAdapter.getItemContact(itemId);
}
