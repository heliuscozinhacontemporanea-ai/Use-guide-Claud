import { guideService } from '../factory';
import type { GuideItemContact } from '../ports/guidePort';

/**
 * Telefone do anúncio para quem o servidor já autorizou (pedido pago, C2/B37). Quem chama confere o
 * direito antes: o anúncio que vende pelo app não publica o telefone.
 */
export function getGuideItemContactUseCase(itemId: string): Promise<GuideItemContact | null> {
  return guideService.getItemContact(itemId);
}
