import { useEffect } from 'react';
import { useAuthContext } from '../../domain/auth';
import type { ClaimTarget } from '../../domain/partners';
import { useUIStore } from '../../shared/stores/useUIStore';
import { useClaimStore } from '../stores/claimStore';

/**
 * "Sou o dono" (D35, 4a): com conta, abre "Assumir anúncio"; sem conta, abre o acesso com o lugar escrito
 * no alto e volta sozinho para o pedido quando a conta tem o @. Fechar o acesso sem conta desiste.
 */
export function useClaimListing(): (target: ClaimTarget) => void {
  const { user, profile, loading } = useAuthContext();
  const waiting = useClaimStore((state) => state.waiting);
  const open = useClaimStore((state) => state.open);
  const wait = useClaimStore((state) => state.wait);
  const isLoginOpen = useUIStore((state) => state.isLoginModalOpen);
  const openLoginWithNote = useUIStore((state) => state.openLoginWithNote);
  const signedIn = Boolean(user && !user.isAnonymous);

  useEffect(() => {
    if (!waiting || loading) return;
    if (!signedIn) {
      if (!isLoginOpen) wait(null);
      return;
    }
    if (profile?.username) open(waiting);
  }, [waiting, loading, signedIn, isLoginOpen, profile, open, wait]);

  return (target) => {
    if (signedIn) {
      open(target);
      return;
    }
    wait(target);
    openLoginWithNote('login', { key: 'claims.loginNote', values: { name: target.name } });
  };
}
