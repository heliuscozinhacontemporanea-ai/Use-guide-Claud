import { EmailVerificationPrompt, useAuthContext } from '../domain/auth';

/**
 * Aviso "Confirme seu e-mail" (D22). Espera a escolha do @ (UsernameGate), que vem antes logo
 * depois do cadastro, para os dois passos não abrirem juntos.
 */
export function EmailVerificationGate() {
  const { user, profile, loading } = useAuthContext();
  if (loading || !user || user.isAnonymous || !profile?.username) return null;
  return <EmailVerificationPrompt />;
}
