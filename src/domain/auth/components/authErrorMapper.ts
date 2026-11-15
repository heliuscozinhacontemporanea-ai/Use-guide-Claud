/** Códigos do Firebase Auth que a tela explica; o resto vira a mensagem genérica. */
const MESSAGES: Record<string, string> = {
  'auth/wrong-password': 'auth.errors.wrongCredentials',
  'auth/invalid-credential': 'auth.errors.wrongCredentials',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/popup-blocked': 'auth.errors.popupBlocked',
  'auth/account-exists-with-different-credential': 'auth.errors.accountExists',
  'auth/unauthorized-domain': 'auth.errors.unauthorizedDomain',
  'auth/network-request-failed': 'auth.errors.network',
  'auth/requires-recent-login': 'auth.errors.recentLogin',
};

/**
 * Chave de tradução do erro de acesso (AGENTS.md §12.5). `null`: não há o que mostrar (a pessoa fechou
 * a janela do Google). `''`: e-mail sem cadastro, que a tela trata sem revelar se a conta existe.
 * Mensagem do SDK nunca chega à tela (§10.2).
 */
export function getAuthErrorMessage(err: unknown): string | null {
  if (!err) return null;
  const record = typeof err === 'object' ? (err as { code?: unknown; message?: unknown }) : {};
  // Alguns caminhos (cadastro pela API) trazem o código só dentro da mensagem.
  const fromMessage =
    typeof record.message === 'string' ? record.message.match(/auth\/[a-z-]+/)?.[0] : undefined;
  const code = typeof record.code === 'string' && record.code ? record.code : (fromMessage ?? '');
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  if (code === 'auth/user-not-found') return '';
  return MESSAGES[code] ?? 'auth.errors.generic';
}
