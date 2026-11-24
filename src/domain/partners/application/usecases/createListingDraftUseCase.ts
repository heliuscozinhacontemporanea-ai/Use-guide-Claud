import { isBrState } from '../../../../shared/utils/timeZones';
import type { PartnerJoinDraft } from '../../utils/partnerJoinDraft';
import { createPartnerContentItemUseCase } from './createPartnerContentItemUseCase';

/**
 * Novo estabelecimento pelo painel (F2): o que "Seu negócio" pede vira um rascunho no servidor; o
 * resto entra pelo guia do Início.
 */
export function createListingDraftUseCase(draft: PartnerJoinDraft): Promise<string> {
  if (!isBrState(draft.state)) throw new Error('VALIDATION_ERROR');
  return createPartnerContentItemUseCase({
    name: draft.name.trim(),
    category: draft.category as Parameters<typeof createPartnerContentItemUseCase>[0]['category'],
    description: '',
    image: '',
    images: [],
    location: '',
    state: draft.state,
    city: draft.city.trim(),
    ...(draft.phone ? { phone: draft.phone } : {}),
  });
}
