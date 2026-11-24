import { useEffect } from 'react';
import { useAuthContext } from '../../domain/auth';
import { useUIStore } from '../../shared/stores/useUIStore';
import { usePartnerJoinStore } from '../stores/partnerJoinStore';

/**
 * Convite "Tem um negócio? Crie sua conta para anunciar" (D35, item 9): abre "Criar conta" com a linha
 * de contexto e, quando a conta já tem o @, abre o Seja parceiro, que confirma o e-mail se faltar.
 * Fechar o acesso sem criar conta encerra o convite.
 */
export function usePartnerInvite(openPartnerJoin: () => void): () => void {
  const { user, profile, loading } = useAuthContext();
  const invited = usePartnerJoinStore((state) => state.invited);
  const setInvited = usePartnerJoinStore((state) => state.setInvited);
  const isLoginOpen = useUIStore((state) => state.isLoginModalOpen);
  const openLoginWithNote = useUIStore((state) => state.openLoginWithNote);
  const signedIn = Boolean(user && !user.isAnonymous);

  useEffect(() => {
    if (!invited || loading) return;
    if (!signedIn) {
      if (!isLoginOpen) setInvited(false);
      return;
    }
    if (!profile?.username) return;
    setInvited(false);
    // Quem já é parceiro (entrou pela aba "Entrar") continua no app, sem abrir o cadastro de novo.
    if (profile.role !== 'partner') openPartnerJoin();
  }, [invited, loading, signedIn, isLoginOpen, profile, setInvited, openPartnerJoin]);

  return () => {
    setInvited(true);
    openLoginWithNote('register', { key: 'partnerGuide.join.inviteNote' });
  };
}
