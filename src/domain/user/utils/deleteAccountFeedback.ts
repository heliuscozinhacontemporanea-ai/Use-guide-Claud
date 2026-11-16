// Vendas em andamento que impedem excluir a conta (travas aprovadas em 2026-11-16).
const CLOSURE_MESSAGES: Record<string, string> = {
  bookings: 'account.feedback.closureBookings',
  sessions: 'account.feedback.closureSessions',
  debts: 'account.feedback.closureDebts',
  payouts: 'account.feedback.closurePayouts',
};

/** Chave da mensagem para a falha ao excluir a conta (login, Google ou vendas em andamento). */
export function deleteAccountFeedbackKey(error: unknown): string {
  const err = (error ?? {}) as { message?: string; code?: string; blockers?: string[] };
  if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
    return 'account.feedback.wrongPassword';
  }
  if (
    err.code === 'auth/requires-recent-login' ||
    err.message === 'REAUTHENTICATION_REQUIRED' ||
    err.code === 'REAUTHENTICATION_REQUIRED'
  ) {
    return 'account.feedback.recentLogin';
  }
  if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
    return 'account.feedback.googleCanceled';
  }
  if (err.code === 'ACCOUNT_HAS_ACTIVE_SALES') {
    // O primeiro motivo, na ordem em que o servidor orienta; resolvido, aparece o próximo.
    return CLOSURE_MESSAGES[err.blockers?.[0] ?? ''] ?? 'account.feedback.closureBookings';
  }
  return 'account.feedback.deleteError';
}
