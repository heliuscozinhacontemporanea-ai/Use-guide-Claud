export function getAuthErrorMessage(err: any): string | null {
  if (!err) return null;
  const code = err.code || '';
  const message = err.message || '';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return null;
  }
  if (message && !message.includes('Firebase:') && !message.startsWith('auth/')) {
    return message;
  }
  if (code === 'auth/user-not-found') {
    return '';
  }
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'E-mail ou senha incorretos.';
  }
  if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
    return 'Este e-mail já está em uso.';
  }
  if (code === 'auth/weak-password' || message.includes('weak-password')) {
    return 'A senha fornecida é muito fraca.';
  }
  if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
    return 'O formato do e-mail informado é inválido.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas recentes. Por favor, aguarde alguns instantes.';
  }
  if (code === 'auth/popup-blocked') {
    return 'O pop-up de autenticação foi bloqueado pelo navegador. Habilite pop-ups para continuar.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'Já existe uma conta cadastrada com este e-mail através de outro método.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Domínio não autorizado nas configurações de autenticação do Firebase.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Erro de conexão. Verifique sua conexão com a internet.';
  }
  if (code === 'auth/requires-recent-login') {
    return 'Esta operação requer autenticação recente. Por favor, faça login novamente.';
  }
  if (typeof err === 'string') {
    return err;
  }
  return 'Ocorreu um erro ao processar a autenticação. Tente novamente.';
}
