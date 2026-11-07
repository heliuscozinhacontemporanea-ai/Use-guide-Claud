/**
 * Versões dos termos da plataforma (D15). Mudou o texto, muda a versão: compras e vendas novas exigem o
 * aceite da versão atual, e o pedido guarda a versão aceita como prova.
 */
export const BUYER_TERMS_VERSION = '2026-11-07';
export const PARTNER_TERMS_VERSION = '2026-11-07';

/** Antecedência do aviso de mudança grande; continuar usando depois da vigência vale como aceite. */
export const TERMS_NOTICE_DAYS = 15;

/**
 * Versão publicada. `major`: mudança de regra (taxa, multa, proibição, prazo), avisada a todos com
 * 15 dias de antecedência; mudança de redação fica `false` e ninguém é avisado. Nada é bloqueado.
 */
export interface TermsRelease {
  audience: 'partner' | 'buyer';
  version: string;
  major: boolean;
  /** 00:00 em Fortaleza do dia em que passa a valer (UTC−3). */
  effectiveAt: string;
}

export const TERMS_RELEASES: readonly TermsRelease[] = [
  // 2026-11-07 só acrescenta o parágrafo sobre mudanças nos termos: redação, sem aviso.
  {
    audience: 'buyer',
    version: BUYER_TERMS_VERSION,
    major: false,
    effectiveAt: '2026-11-07T03:00:00.000Z',
  },
  {
    audience: 'partner',
    version: PARTNER_TERMS_VERSION,
    major: true,
    effectiveAt: '2026-11-22T03:00:00.000Z',
  },
];

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
