import { isUseGuideOwner } from '../../../shared/kernel/useGuideOwner';
import { guideService } from '../factory';
import type { GuidePublication } from '../types/guideTypes';
import {
  type ListingStep,
  listingSetupSteps,
  minimumPublishSteps,
} from '../utils/listingSetupSteps';

/** Situação do anúncio para o editor do admin (escolhas da F4), sem os campos do documento. */
export interface GuideListingSetup {
  ownerId: string;
  publication: GuidePublication;
  /** Os passos do parceiro (D34): o ✓ ou o que falta em cada bloco. */
  setupSteps: ListingStep[];
  /** O que libera "Publicar": o mínimo no anúncio do Use Guide, os passos inteiros no do parceiro. */
  publishSteps: ListingStep[];
}

export async function getGuideListingSetupUseCase(
  itemId: string
): Promise<GuideListingSetup | null> {
  const item = await guideService.getItemById(itemId);
  if (!item) return null;
  const setupSteps = listingSetupSteps(item);
  return {
    ownerId: item.ownerId,
    publication: item.publication,
    setupSteps,
    publishSteps: isUseGuideOwner(item.ownerId) ? minimumPublishSteps(item) : setupSteps,
  };
}
