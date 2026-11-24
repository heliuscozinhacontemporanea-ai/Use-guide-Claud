import { useClaimStore } from './stores/claimStore';
import { usePartnerJoinStore } from './stores/partnerJoinStore';
import { EmailVerificationPrompt } from '../domain/auth';
import { useAccount } from '../domain/user';

/**
 * Aviso "Confirme seu e-mail" (D22). Espera a escolha do @ (UsernameGate), que vem antes logo
 * depois do cadastro, para os dois passos não abrirem juntos.
 */
export function EmailVerificationGate() {
  // O Seja parceiro pede a confirmação na própria pilha, também quando vem do convite (D34, D35).
  const joining = usePartnerJoinStore((state) => state.active || state.invited);
  // O "Assumir anúncio" também confirma o e-mail na própria folha (D35).
  const claiming = useClaimStore((state) => state.target !== null || state.waiting !== null);
  const { user, profile, loading } = useAccount();
  if (joining || claiming || loading || !user || user.isAnonymous || !profile?.username)
    return null;
  return <EmailVerificationPrompt />;
}
