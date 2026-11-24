import { usePartnerJoinStore } from './stores/partnerJoinStore';
import { EmailVerificationPrompt, useAuthContext } from '../domain/auth';

/**
 * Aviso "Confirme seu e-mail" (D22). Espera a escolha do @ (UsernameGate), que vem antes logo
 * depois do cadastro, para os dois passos não abrirem juntos.
 */
export function EmailVerificationGate() {
  // O Seja parceiro pede a confirmação na própria pilha, também quando vem do convite (D34, D35).
  const joining = usePartnerJoinStore((state) => state.active || state.invited);
  const { user, profile, loading } = useAuthContext();
  if (joining || loading || !user || user.isAnonymous || !profile?.username) return null;
  return <EmailVerificationPrompt />;
}
