import { savePartnerJoinDraft } from '../../adapters/partnerJoinDraftStorage';
import type { PartnerJoinDraft } from '../../utils/partnerJoinDraft';

/** Guarda "Seu negócio" no aparelho até o painel ser criado (D34). */
export function savePartnerJoinDraftUseCase(draft: PartnerJoinDraft): void {
  savePartnerJoinDraft(draft);
}
