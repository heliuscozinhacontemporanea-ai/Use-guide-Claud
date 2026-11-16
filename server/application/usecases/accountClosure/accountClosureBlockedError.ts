/** O que impede encerrar a conta ou o perfil de parceiro, na ordem em que a tela orienta. */
export type AccountClosureBlocker = 'bookings' | 'sessions' | 'debts' | 'payouts';

/**
 * Conta com vendas em andamento não é encerrada (travas aprovadas em 2026-11-16): reserva ativa,
 * sessão futura com ingressos ou cortesias, multa em aberto ou repasse ainda não transferido.
 */
export class AccountClosureBlockedError extends Error {
  readonly code = 'ACCOUNT_HAS_ACTIVE_SALES';
  constructor(readonly blockers: AccountClosureBlocker[]) {
    super('A conta tem vendas em andamento e não pode ser excluída agora.');
    this.name = 'AccountClosureBlockedError';
  }
}
