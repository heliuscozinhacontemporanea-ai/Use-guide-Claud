import { clearPartnerJoinDraft } from '../../adapters/partnerJoinDraftStorage';
import type { PartnerJoinDraft } from '../../utils/partnerJoinDraft';
import { isBrState } from '../../../../shared/utils/timeZones';
import { createOrUpdatePartnerProfileUseCase } from './createOrUpdatePartnerProfileUseCase';
import { createPartnerContentItemUseCase } from './createPartnerContentItemUseCase';

/**
 * "Criar meu painel" (D34): aceita os Termos do parceiro e cria o estabelecimento, que nasce como
 * rascunho no servidor. Fotos, detalhes e preços entram depois, pelo guia do Início.
 */
export async function joinAsPartnerUseCase(draft: PartnerJoinDraft): Promise<string> {
  if (!draft.terms || !isBrState(draft.state)) throw new Error('VALIDATION_ERROR');
  await createOrUpdatePartnerProfileUseCase({ termsAccepted: true });
  const id = await createPartnerContentItemUseCase({
    name: draft.name.trim(),
    category: draft.category as Parameters<typeof createPartnerContentItemUseCase>[0]['category'],
    description: '',
    image: '',
    images: [],
    location: '',
    state: draft.state,
    city: draft.city.trim(),
    phone: draft.phone,
  });
  clearPartnerJoinDraft();
  return id;
}
