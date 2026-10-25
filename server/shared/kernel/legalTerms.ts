/**
 * Versões dos termos da plataforma (D15). Mudou o texto, muda a versão: compras e vendas novas exigem o
 * aceite da versão atual, e o pedido guarda a versão aceita como prova.
 */
export const BUYER_TERMS_VERSION = '2026-10-25';
export const PARTNER_TERMS_VERSION = '2026-10-25';

export interface TermsAcceptance {
  version: string;
  acceptedAt: string;
}

export function isCurrentBuyerTermsVersion(version: unknown): version is string {
  return version === BUYER_TERMS_VERSION;
}

export function isCurrentPartnerTerms(acceptance: TermsAcceptance | null | undefined): boolean {
  return acceptance?.version === PARTNER_TERMS_VERSION;
}
