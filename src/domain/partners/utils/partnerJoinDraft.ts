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

export type PartnerJoinField = 'category' | 'name' | 'city' | 'phone' | 'terms';

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
export function partnerJoinErrors(draft: PartnerJoinDraft): PartnerJoinField[] {
  const errors: PartnerJoinField[] = [];
  if (!draft.category) errors.push('category');
  if (draft.name.trim().length < 2) errors.push('name');
  if (!isBrState(draft.state) || draft.city.trim().length < 2) errors.push('city');
  if (!E164.test(draft.phone)) errors.push('phone');
  if (!draft.terms) errors.push('terms');
  return errors;
}

/** Lê um rascunho guardado, descartando o que não tiver o formato certo. */
export function parsePartnerJoinDraft(value: unknown): PartnerJoinDraft | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const text = (key: string) => (typeof record[key] === 'string' ? (record[key] as string) : '');
  return {
    category: text('category'),
    name: text('name'),
    state: text('state') || EMPTY_JOIN_DRAFT.state,
    city: text('city'),
    phone: text('phone'),
    terms: record.terms === true,
  };
}
