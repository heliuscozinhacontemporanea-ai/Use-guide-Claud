import { mentionsUseGuide } from '../../../shared/utils/reservedNames';
import { isBrState } from '../../../shared/utils/timeZones';

/** O que a tela "Seu negócio" pede (D34): o resto o parceiro completa no guia do painel. */
export interface PartnerJoinDraft {
  category: string;
  name: string;
  state: string;
  city: string;
  /** Telefone ou WhatsApp do negócio em E.164 (obrigatório, decisão 7 da D34). */
  phone: string;
  terms: boolean;
}

/** `nameReserved`: o nome usa "Use Guide" (D35, item 10). */
export type PartnerJoinField = 'category' | 'name' | 'nameReserved' | 'city' | 'phone' | 'terms';

export const EMPTY_JOIN_DRAFT: PartnerJoinDraft = {
  category: '',
  name: '',
  state: 'CE',
  city: '',
  phone: '',
  terms: false,
};

const E164 = /^\+[1-9]\d{9,14}$/;

/** Campos que faltam ou estão errados, na ordem da tela. */
export function partnerJoinErrors(
  draft: PartnerJoinDraft,
  {
    requireTerms = true,
    requirePhone = true,
    allowUseGuideName = false,
  }: { requireTerms?: boolean; requirePhone?: boolean; allowUseGuideName?: boolean } = {}
): PartnerJoinField[] {
  const errors: PartnerJoinField[] = [];
  if (!draft.category) errors.push('category');
  if (draft.name.trim().length < 2) errors.push('name');
  else if (!allowUseGuideName && mentionsUseGuide(draft.name)) errors.push('nameReserved');
  if (!isBrState(draft.state) || draft.city.trim().length < 2) errors.push('city');
  // O admin pode deixar o telefone do lugar em branco (escolhas da F4); preenchido, vale o formato.
  if ((requirePhone || draft.phone) && !E164.test(draft.phone)) errors.push('phone');
  if (requireTerms && !draft.terms) errors.push('terms');
  return errors;
}
