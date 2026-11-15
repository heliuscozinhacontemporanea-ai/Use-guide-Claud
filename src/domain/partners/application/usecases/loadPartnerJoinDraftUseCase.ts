import { readPartnerJoinDraft } from '../../adapters/partnerJoinDraftStorage';
import type { PartnerJoinDraft } from '../../utils/partnerJoinDraft';

/** "Seu negócio" guardado no aparelho enquanto a pessoa cria a conta (D34). */
export function loadPartnerJoinDraftUseCase(): PartnerJoinDraft | null {
  return readPartnerJoinDraft();
}
