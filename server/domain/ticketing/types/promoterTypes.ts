import type { MoneyMinor } from './ticketingTypes';

/**
 * Divulgador de um evento (D27, opção A): o organizador paga direto; o Use Guide calcula e mostra.
 * Classe Interna (§7.6): o organizador e o próprio divulgador leem pela API.
 */
export type PromoterEarning =
  /** Porcentagem em pontos-base (1000 = 10%) sobre o valor pago pelo ingresso. */
  | { type: 'commission'; basisPoints: number }
  | { type: 'per_ticket'; amountMinor: MoneyMinor }
  | { type: 'flat_fee'; amountMinor: MoneyMinor };

export type PromoterStatus = 'invited' | 'active' | 'declined' | 'ended';

export interface EventPromoter {
  id: string;
  eventListingId: string;
  ownerId: string;
  promoterUid: string;
  /** @ e nome públicos no convite; o link usa o @ atual, a atribuição usa o código. */
  promoter: { username: string | null; displayName: string | null };
  /** Código fixo do link (`?d=<@>-<código>`): não é segredo, só identifica o divulgador. */
  code: string;
  earning: PromoterEarning;
  status: PromoterStatus;
  createdAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  endedAt: string | null;
}

/** Venda feita pelo link, como entra na conta do divulgador. */
export interface PromoterSaleInput {
  promoterId: string;
  /** Valor pago pelos ingressos (com cupom, sem taxa de serviço), menos o que voltou. */
  netTicketsMinor: MoneyMinor;
  /** Ingressos que continuam valendo (sem os reembolsados e cancelados). */
  tickets: number;
}

export interface PromoterTotals {
  tickets: number;
  soldMinor: MoneyMinor;
  owedMinor: MoneyMinor;
}

const CODE_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const PROMOTER_CODE_LENGTH = 6;

/** `joao.promo-k7Qm2a` → `k7Qm2a`; o @ na frente é só para quem vê o link. */
export function promoterCodeFromParam(raw: string): string | null {
  const value = raw.trim();
  const code = value.slice(value.lastIndexOf('-') + 1);
  const pattern = new RegExp(`^[${CODE_ALPHABET}]{${PROMOTER_CODE_LENGTH}}$`);
  return pattern.test(code) ? code : null;
}

export function promoterCodeAlphabet(): string {
  return CODE_ALPHABET;
}

/** Quanto o divulgador ganha com as vendas dadas; cachê fixo não depende das vendas. */
export function promoterOwedMinor(earning: PromoterEarning, totals: PromoterTotals): MoneyMinor {
  if (earning.type === 'flat_fee') return earning.amountMinor;
  if (earning.type === 'per_ticket') return earning.amountMinor * totals.tickets;
  return Math.round((totals.soldMinor * earning.basisPoints) / 10_000);
}
